/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import omit from 'lodash/omit';
import isNil from 'lodash/isNil';
import { ButtonGroup, Glyphicon } from 'react-bootstrap';
import axios from '../../../libs/ajax';

import FlexBox from '../../../components/layout/FlexBox';
import Message from '../../../components/I18N/Message';
import HTMLMessage from '../../../components/I18N/HTML';
import Button from '../../../components/layout/Button';
import Text from '../../../components/layout/Text';
import IntlNumberFormControl from '../../../components/I18N/IntlNumberFormControl';
import Slider from '../../../components/misc/Slider';
import InfoPopover from '../../../components/widgets/widget/InfoPopover';
import {
    DEFAULT_PROFILE_OPTIONS,
    DEFAULT_PROVIDER,
    DEFAULT_RANGE_OPTIONS,
    DIRECTION_OPTIONS,
    RANGE
} from '../constants';
import { getIsochroneLayer, getRangeValue } from '../utils/IsochroneUtils';

/**
 * GraphHopper provider
 * @param {object} props - The props of the component
 * @param {function} props.registerApi - The function to register the API
 * @param {object} props.config - The config of the provider
 */
const Graphhopper = ({ registerApi, config, currentRunParameters }) => {

    const [range, setRange] = useState(RANGE.DISTANCE);
    const [providerBody, setProviderBody] = useState(currentRunParameters);

    const providerBodyRef = useRef(providerBody);
    providerBodyRef.current = providerBody;

    useEffect(() => {
        setProviderBody({ ...currentRunParameters });
        setRange(!isNil(currentRunParameters.distanceLimit) ? RANGE.DISTANCE : RANGE.TIME);
    }, [currentRunParameters]);

    useEffect(() => {
        setProviderBody(prev => ({
            ...prev,
            ...omit(config, ['key', 'url'])
        }));
    }, [config]);

    const handleProviderBodyChange = (key, value) => {
        setProviderBody(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const getDirections = useCallback((points = []) => {
        const {key, url: _url, ...rest} = config ?? {};
        const url = `${_url}?key=${key ?? ""}`;
        let {
            distanceLimit,
            timeLimit,
            reverseFlow,
            ..._config
        } = { ...providerBodyRef.current };

        return axios.get(url, {
            params: {
                ...rest,
                ..._config,
                // provider api accepts `lat,lon` format for the point parameter
                point: [...(points ?? [])].reverse().join(','),
                reverse_flow: reverseFlow,
                ...(distanceLimit
                    ? { distanceLimit: getRangeValue(distanceLimit, "meters") }
                    : { timeLimit: getRangeValue(timeLimit, "seconds") }
                )
            }
        })
            .then(({data: response}) =>
                getIsochroneLayer(
                    response?.polygons ?? [],
                    {
                        ..._config,
                        distanceLimit,
                        timeLimit,
                        location: points
                    }
                ))
            .catch((error) => {
                console.error(error);
                throw error;
            });
    }, []);

    useEffect(() => {
        if (registerApi) {
            registerApi(DEFAULT_PROVIDER, {
                getDirections
            });
        }
    }, [registerApi, getDirections]);

    return (
        <FlexBox column className="ms-isochrone-provider" gap="md">
            <FlexBox.Fill flexBox gap="md" className="ms-isochrone-mode-container">
                <Text strong>
                    <Message msgId="isochrone.mode" />
                    &nbsp;<InfoPopover placement="top" text={<Message msgId="isochrone.modeTooltip" />} />
                </Text>
                <ButtonGroup className="ms-isochrone-profile">
                    {DEFAULT_PROFILE_OPTIONS.map(option => (
                        <FlexBox
                            component={Button}
                            key={option.value}
                            centerChildren
                            className={"_relative ms-isochrone-profile-btn"}
                            variant={providerBody.profile === option.value ? 'primary' : 'default'}
                            onClick={() => handleProviderBodyChange("profile", option.value)}
                        >
                            <Glyphicon className="ms-isochrone-profile-icon" glyph={option.glyph} />
                        </FlexBox>
                    ))}
                </ButtonGroup>
            </FlexBox.Fill>
            <FlexBox gap="sm" centerChildren className="ms-range-by-container">
                <FlexBox.Fill flexBox gap="md" centerChildrenVertically className="ms-range-by">
                    <Text strong>
                        <Message msgId="isochrone.rangeBy" />
                        &nbsp;<InfoPopover placement="top" text={<HTMLMessage msgId="isochrone.rangeByTooltip" />} />
                    </Text>
                    <Select
                        className="ms-range-by-select"
                        options={DEFAULT_RANGE_OPTIONS}
                        value={range}
                        onChange={(e) => {
                            const currentRange = e.value;
                            setRange(currentRange);
                            const isDistance = currentRange === RANGE.DISTANCE;
                            setProviderBody(prev => ({
                                ...prev,
                                ...(isDistance ? {timeLimit: undefined} : {distanceLimit: undefined}),
                                [isDistance ? 'distanceLimit' : 'timeLimit']:
                                providerBody[isDistance ? 'timeLimit' : 'distanceLimit']
                            }));
                        }}
                        clearable={false}
                    />
                </FlexBox.Fill>
                <FlexBox className="ms-range-by-input">
                    <IntlNumberFormControl
                        type="number"
                        value={range === RANGE.DISTANCE ? providerBody.distanceLimit : providerBody.timeLimit}
                        step={range === RANGE.DISTANCE ? 1 : 0.1}
                        onChange={value => setProviderBody(prev => ({
                            ...omit(prev, ['distanceLimit', 'timeLimit']),
                            [range === RANGE.DISTANCE ? 'distanceLimit' : 'timeLimit']: value
                        }))}
                    />
                    <Text className="ms-range-by-unit">{range === RANGE.DISTANCE ? "Km" : "Min"}</Text>
                </FlexBox>
            </FlexBox>
            <FlexBox.Fill flexBox gap="md" centerChildrenVertically className="ms-isochrone-direction-container">
                <Text strong><Message msgId="isochrone.direction" /></Text>
                <ButtonGroup className="ms-isochrone-direction">
                    {DIRECTION_OPTIONS.map(option => (
                        <FlexBox
                            component={Button}
                            key={option}
                            centerChildren
                            className={"_relative ms-isochrone-direction-btn"}
                            variant={(option === 'departure' && !providerBody.reverse_flow) ||
                                (option === "arrival" && providerBody.reverse_flow) ? 'primary' : 'default'}
                            onClick={() => handleProviderBodyChange("reverse_flow", option !== 'departure')}
                        >
                            <Message msgId={`isochrone.${option}`} />
                        </FlexBox>
                    ))}
                </ButtonGroup>
            </FlexBox.Fill>
            <FlexBox.Fill flexBox gap="md" centerChildrenVertically className="ms-isochrone-bucket-container">
                <Text strong>
                    <Message msgId="isochrone.buckets" />
                    &nbsp;<InfoPopover placement="top" text={<Message msgId="isochrone.bucketsTooltip" />} />
                </Text>
                <div
                    className="mapstore-slider with-tooltip"
                    onClick={(e) => { e.stopPropagation(); }}>
                    <Slider
                        step={1}
                        tooltips={[true]}
                        start={[providerBody.buckets || 1]}
                        range={{ min: 1, max: 4 }}
                        format={{
                            from: value => Math.round(value),
                            to: value => Math.round(value)
                        }}
                        onChange={([changedValue] = []) => {
                            handleProviderBodyChange("buckets", Math.round(Number(changedValue)));
                        }}/>
                </div>
            </FlexBox.Fill>
        </FlexBox>
    );
};
Graphhopper.defaultProps = {
    registerApi: () => {},
    config: {},
    currentRunParameters: {}
};
export default Graphhopper;
