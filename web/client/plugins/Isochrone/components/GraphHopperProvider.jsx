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
import get from 'lodash/get';
import castArray from 'lodash/castArray';
import { ButtonGroup, Glyphicon } from 'react-bootstrap';
import PropTypes from 'prop-types';

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
    DEFAULT_RAMP,
    DEFAULT_RANGE_OPTIONS,
    DIRECTION_OPTIONS,
    RANGE
} from '../constants';
import { getIsochroneLayer, getRangeValue } from '../utils/IsochroneUtils';
import ColorRamp from '../../../components/styleeditor/ColorRamp';
import SLDService from '../../../api/SLDService';
import ColorSelector from '../../../components/style/ColorSelector';
import { getMessageById } from '../../../utils/LocaleUtils';

/**
 * GraphHopper provider
 * @param {object} props - The props of the component
 * @param {function} props.registerApi - The function to register the API
 * @param {object} props.config - The config of the provider
 */
const Graphhopper = ({ registerApi, config, currentRunParameters }, context) => {

    const [range, setRange] = useState(RANGE.DISTANCE);
    const [providerBody, setProviderBody] = useState(currentRunParameters);

    const providerBodyRef = useRef(providerBody);
    providerBodyRef.current = providerBody;

    const getColors = useCallback((sample) => {
        return SLDService.getColors(undefined, undefined, sample, false);
    }, [SLDService.getColors]);

    const getBucketColor = useCallback((buckets, name) => {
        return getColors(buckets)?.find(color =>
            color.name === (name ?? get(providerBodyRef.current, 'ramp.name', DEFAULT_RAMP))) ?? {};
    }, [getColors]);

    useEffect(() => {
        setProviderBody({
            ...currentRunParameters,
            ramp: getBucketColor(currentRunParameters.buckets, DEFAULT_RAMP)
        });
        setRange(!isNil(currentRunParameters.distanceLimit) ? RANGE.DISTANCE : RANGE.TIME);
    }, [currentRunParameters]);

    useEffect(() => {
        setProviderBody(prev => ({
            ...prev,
            ...omit(config, ['key', 'url']),
            ramp: getBucketColor(prev.buckets)
        }));
    }, [config]);

    const handleProviderBodyChange = (key, value) => {
        setProviderBody(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const getIsochrones = useCallback((points = []) => {
        const {key, url: _url, ...rest} = config ?? {};
        const url = `${_url}?key=${key ?? ""}`;
        let {
            distanceLimit,
            timeLimit,
            reverseFlow,
            ramp,
            ..._config
        } = { ...providerBodyRef.current };

        return axios.get(url, {
            params: {
                ...rest,
                ...omit(_config, ['ramp', 'location']),
                // provider api accepts `lat,lon` format for the point parameter
                point: [...(points ?? [])].reverse().join(','),
                reverse_flow: reverseFlow,
                ...(distanceLimit
                    ? { distance_limit: getRangeValue(distanceLimit, "meters") }
                    : { time_limit: getRangeValue(timeLimit, "seconds") }
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
                        location: points,
                        ramp,
                        reverseFlow
                    },
                    context.messages
                ))
            .catch((error) => {
                console.error(error);
                throw error;
            });
    }, []);

    useEffect(() => {
        if (registerApi) {
            registerApi(DEFAULT_PROVIDER, {
                getIsochrones
            });
        }
    }, [registerApi, getIsochrones]);

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
                        options={DEFAULT_RANGE_OPTIONS.map(option => ({
                            ...option,
                            label: getMessageById(context.messages, `isochrone.${option.value}`)
                        }))}
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
                <ButtonGroup className="ms-isochrone-direction ms-flex-fill">
                    {DIRECTION_OPTIONS.map(option => (
                        <FlexBox.Fill
                            flexBox
                            component={Button}
                            key={option}
                            centerChildren
                            className={"_relative ms-isochrone-direction-btn"}
                            variant={(option === 'departure' && !providerBody.reverseFlow) ||
                                (option === "arrival" && providerBody.reverseFlow) ? 'primary' : 'default'}
                            onClick={() => handleProviderBodyChange("reverseFlow", option !== 'departure')}
                        >
                            <Message msgId={`isochrone.${option}`} />
                        </FlexBox.Fill>
                    ))}
                </ButtonGroup>
            </FlexBox.Fill>
            <FlexBox.Fill flexBox gap="md" centerChildrenVertically className="ms-isochrone-bucket-container">
                <Text strong>
                    <Message msgId="isochrone.buckets" />
                    &nbsp;<InfoPopover placement="top" text={<Message msgId="isochrone.bucketsTooltip" />} />
                </Text>
                <div
                    className="mapstore-slider with-tooltip ms-flex-fill"
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
                            const _buckets = Math.round(Number(changedValue));
                            handleProviderBodyChange("buckets", _buckets);
                            handleProviderBodyChange("ramp", getBucketColor(_buckets));
                        }}/>
                </div>
            </FlexBox.Fill>
            <FlexBox.Fill flexBox gap="md" centerChildrenVertically className="ms-isochrone-bucket-color">
                <Text strong>
                    <Message msgId="isochrone.colors" />
                    &nbsp;<InfoPopover placement="top" text={<Message msgId={`isochrone.${providerBody.buckets > 1 ? 'rampTooltip' : 'colorTooltip'}`} />} />
                </Text>
                <FlexBox.Fill>
                    {providerBody.buckets > 1
                        ? <ColorRamp
                            items={getColors(providerBody.buckets)}
                            samples={providerBody.buckets}
                            rampFunction = {({ colors }) => colors}
                            value={{ name: get(providerBody, 'ramp.name', DEFAULT_RAMP) }}
                            onChange={(ramp) => handleProviderBodyChange("ramp", ramp)}
                        />
                        : <ColorSelector
                            disabled={false}
                            color={get(providerBody, 'ramp.colors.[0]')}
                            line={false}
                            format="hex6"
                            onChangeColor={(color) =>
                                handleProviderBodyChange("ramp",
                                    { name: 'singleColor', colors: castArray(color) })
                            }
                        />
                    }
                </FlexBox.Fill>
            </FlexBox.Fill>
        </FlexBox>
    );
};
Graphhopper.contextTypes = {
    messages: PropTypes.object
};
Graphhopper.defaultProps = {
    registerApi: () => {},
    config: {},
    currentRunParameters: {}
};
export default Graphhopper;
