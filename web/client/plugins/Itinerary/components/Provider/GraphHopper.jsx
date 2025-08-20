/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useCallback, useRef } from 'react';
import omit from 'lodash/omit';
import get from 'lodash/get';
import { Checkbox, ButtonGroup, Glyphicon } from 'react-bootstrap';

import { DEFAULT_PROVIDER, DEFAULT_PROFILE_OPTIONS, SNAP_PREVENTION_OPTIONS, GRAPHHOPPER_PROVIDER_URL } from '../../constants';
import FlexBox from '../../../../components/layout/FlexBox';
import Text from '../../../../components/layout/Text';
import Button from '../../../../components/layout/Button';
import axios from '../../../../libs/ajax';
import { getWaypointFeatures } from '../../utils/ItineraryUtils';
import Message from '../../../../components/I18N/Message';
import InfoPopover from '../../../../components/widgets/widget/InfoPopover';
import SwitchButton from '../../../../components/misc/switch/SwitchButton';
import { extendExtent } from '../../../../utils/CoordinatesUtils';

const parseItineraryData = (data) => {
    return {
        features: get(data, 'layer.features', []),
        style: get(data, 'layer.style', {}),
        routes: get(data, 'routes', [])
            .map((route) => (route ?? [])
                .map((instruction) => ({
                    text: instruction.text,
                    streetName: instruction.street_name,
                    sign: instruction.sign,
                    distance: instruction.distance,
                    time: instruction.time
                }))
            )
    };
};

const GRAPH_HOPPER_SPECIFIC_CONFIGS = {
    profile: 'car',
    optimize: true,
    snap_prevention: [],
    points_encoded: false,
    elevation: true,
    calc_points: true,
    instructions: true,
    algorithm: 'alternative_route',
    'alternative_route.max_paths': 3,
    details: ['street_name']
};

const GraphHopperProvider = ({
    registerApi,
    config,
    setProviderConfig,
    providerConfig
}) => {

    const providerBodyRef = useRef(providerConfig);
    providerBodyRef.current = providerConfig;

    useEffect(() => {
        setProviderConfig(prev => ({
            ...prev,
            ...omit(config, 'key'),
            ...GRAPH_HOPPER_SPECIFIC_CONFIGS
        }));
    }, []);

    const handleProviderBodyChange = (key, value, checked) => {
        let _value = value;
        setProviderConfig(prev => {
            if (key === 'snap_prevention') {
                let snapPrevention = prev.snap_prevention ?? [];
                if (checked) {
                    snapPrevention = [...snapPrevention, value];
                } else {
                    snapPrevention = snapPrevention.filter(item => item !== value);
                }
                _value = snapPrevention;
            }
            return {
                ...prev,
                [key]: _value
            };
        });
    };

    const getDirections = useCallback((locations) => {
        const {key, ...rest} = config ?? {};
        let url = config.url || GRAPHHOPPER_PROVIDER_URL;
        url = `${url}?key=${key ?? ""}`;
        return axios.post(url, {
            ...rest,
            ...providerBodyRef.current,
            points: locations,
            // GraphHopper supports alternative_routes only for 2 locations
            ...(locations.length > 2 && {algorithm: undefined})
        })
            .then(({data: response}) => {
                let waypoints = get(response, 'paths', []);
                let routes = waypoints.map((path) => path.instructions) ?? [];
                let bboxes = waypoints.map((path) => path.bbox) ?? [];
                const bbox = bboxes.reduce((acc, _bbox) => {
                    return extendExtent(acc, _bbox);
                }, bboxes[0]);

                return getWaypointFeatures({
                    waypoints,
                    bbox,
                    getSnappedWaypoints: (waypoint) => {
                        let snappedWaypoints = get(waypoint, 'snapped_waypoints.coordinates', []);
                        const snappedWaypointsOrder = get(waypoint, 'points_order', []);
                        if (snappedWaypointsOrder.length > 0) {
                            snappedWaypoints = snappedWaypointsOrder
                                .map((snapIndex) => snappedWaypoints[snapIndex]);
                        }
                        return snappedWaypoints.length > 0 ? snappedWaypoints : [];
                    },
                    getFeatureGeometry: (waypoint) => waypoint.points,
                    parseItinerary: (data) => parseItineraryData({...data, routes})
                });
            }).catch((error) => {
                console.error(error);
                throw error;
            });
    }, [config]);

    useEffect(() => {
        if (registerApi) {
            registerApi(DEFAULT_PROVIDER, {
                getDirections
            });
        }
    }, [registerApi, getDirections]);

    return (
        <FlexBox className="itinerary-graphhopper" column gap="lg">
            <FlexBox className="space-between">
                <FlexBox.Fill gap="sm" centerChildrenVertically flexBox>
                    <Text strong className="itinerary-mode-text">
                        <Message msgId="itinerary.mode" />
                        &nbsp;<InfoPopover placement="top" text={<Message msgId="itinerary.modeTooltip" />} />
                    </Text>
                    <ButtonGroup className="itinerary-profile">
                        {DEFAULT_PROFILE_OPTIONS.map(option => (
                            <FlexBox
                                component={Button}
                                key={option.value}
                                centerChildren
                                className={"_relative profile-btn"}
                                variant={providerConfig.profile === option.value ? 'primary' : 'default'}
                                onClick={() => handleProviderBodyChange("profile", option.value)}
                            >
                                <Glyphicon className="profile-icon" glyph={option.glyph} />
                            </FlexBox>
                        ))}
                    </ButtonGroup>
                </FlexBox.Fill>
                <FlexBox gap="sm" centerChildrenVertically>
                    <Text strong>
                        <Message msgId="itinerary.optimizeRoute" />
                        &nbsp;<InfoPopover placement="top" text={<Message msgId="itinerary.optimizeTooltip" />} />
                    </Text>
                    <SwitchButton
                        checked={providerConfig.optimize}
                        onChange={(checked) => handleProviderBodyChange("optimize", checked)}
                    />
                </FlexBox>
            </FlexBox>
            <FlexBox column gap="sm">
                <Text strong>
                    <Message msgId="itinerary.avoid" />
                        &nbsp;<InfoPopover text={<Message msgId="itinerary.avoidTooltip" />} />
                </Text>
                <FlexBox column gap="sm">
                    {SNAP_PREVENTION_OPTIONS.map(option => (
                        <Checkbox
                            key={option.value}
                            checked={get(providerConfig, 'snap_prevention', []).includes(option.value)}
                            onChange={(e) => handleProviderBodyChange('snap_prevention', option.value, e.target.checked)}
                        >
                            <Message msgId={option.labelId} />
                        </Checkbox>
                    ))}
                </FlexBox>
            </FlexBox>
        </FlexBox>
    );
};

GraphHopperProvider.defaultProps = {
    registerApi: () => {},
    config: {
        url: GRAPHHOPPER_PROVIDER_URL
    },
    setProviderConfig: () => {},
    providerConfig: {}
};

export default GraphHopperProvider;
