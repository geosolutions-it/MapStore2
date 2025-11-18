/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useCallback, useRef, useState } from 'react';
import omit from 'lodash/omit';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { Checkbox, ButtonGroup, Glyphicon } from 'react-bootstrap';

import {
    DEFAULT_PROVIDER,
    DEFAULT_PROFILE_OPTIONS,
    DEFAULT_SNAP_PREVENTION_OPTIONS,
    DEFAULT_PROVIDER_CONFIGS
} from '../constants';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';
import Button from '../../../components/layout/Button';
import axios from '../../../libs/ajax';
import { defaultItineraryDataParser, getWaypointFeatures } from '../utils/ItineraryUtils';
import Message from '../../../components/I18N/Message';
import InfoPopover from '../../../components/widgets/widget/InfoPopover';
import SwitchButton from '../../../components/misc/switch/SwitchButton';
import { extendExtent } from '../../../utils/CoordinatesUtils';

/**
 * GraphHopper provider
 * @param {object} props - The props of the component
 * @param {function} props.registerApi - The function to register the API
 * @param {object} props.config - The config of the provider
 * @param {function} props.setProviderConfig - The function to set the provider config
 * @param {object} props.providerConfig - The provider config
 */
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
            ...DEFAULT_PROVIDER_CONFIGS
        }));
    }, []);
    const [avoidRoads, setAvoidRoads] = useState([]);

    // Reset avoidRoads
    useEffect(() => {
        if (providerConfig.custom_model === undefined) {
            setAvoidRoads(prev => prev.length > 0 ? [] : prev);
        }
    }, [providerConfig.custom_model]);

    const handleProviderBodyChange = (key, value) => {
        let _value = value;
        setProviderConfig(prev => {
            if (key === 'custom_model') {
                if (isEmpty(value)) {
                    _value = undefined;
                } else {
                    _value = {
                        priority: value.map(item => {
                            const {"class": className} = DEFAULT_SNAP_PREVENTION_OPTIONS
                                .find(option => option.value === item) ?? {};
                            return {
                                "if": `${className} == ${item.toUpperCase()}`,
                                "multiply_by": 0
                            };
                        })
                    };
                }
            }
            return {
                ...prev,
                [key]: _value
            };
        });
    };

    const getDirections = useCallback((locations) => {
        const {key, url, ...rest} = config ?? {};
        const _url = `${url}?key=${key ?? ""}`;
        return axios.post(_url, {
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
                    parseItinerary: (data) => defaultItineraryDataParser({...data, routes})
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
                    {DEFAULT_SNAP_PREVENTION_OPTIONS.map(option => (
                        <Checkbox
                            key={option.value}
                            checked={avoidRoads.includes(option.value)}
                            onChange={(e) => {
                                const isChecked = e.target?.checked;
                                setAvoidRoads(prev => {
                                    const newAvoidRoads = isChecked
                                        ? [...prev, option.value]
                                        : prev.filter(item => item !== option.value);
                                    handleProviderBodyChange('custom_model', newAvoidRoads);
                                    return newAvoidRoads;
                                });
                            }}
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
    config: { url: "" },
    setProviderConfig: () => {},
    providerConfig: {}
};

export default GraphHopperProvider;
