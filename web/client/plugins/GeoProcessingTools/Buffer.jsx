/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {
    FormGroup,
    InputGroup,
    ControlLabel,
    Glyphicon
} from 'react-bootstrap';
import { connect } from 'react-redux';
import Select from 'react-select';
import { createSelector } from 'reselect';

import Message from '../../components/I18N/Message';
import FormControl from '../../components/misc/DebouncedFormControl';
import tooltip from '../../components/misc/enhancers/tooltip';
import Loader from '../../components/misc/Loader';
import SwitchPanel from '../../components/misc/switch/SwitchPanel';
import {
    checkWPSAvailability,
    runBufferProcess,
    setBufferDistance,
    setBufferDistanceUom,
    setBufferQuadrantSegments,
    setBufferCapStyle,
    setSourceLayerId,
    setSourceFeatureId
} from '../../actions/geoProcessingTools';
import {
    areAllWPSAvailableForSourceLayerSelector,
    checkingWPSAvailabilitySelector,
    distanceSelector,
    distanceUomSelector,
    quadrantSegmentsSelector,
    capStyleSelector,
    sourceLayerIdSelector,
    sourceFeatureIdSelector,
    sourceFeaturesSelector,
    sourceErrorSelector,
    isSourceFeaturesLoadingSelector
} from '../../selectors/geoProcessingTools';
import {
    nonBackgroundLayersSelector
} from '../../selectors/layers';

const Addon = tooltip(InputGroup.Addon);
const Buffer = ({
    areAllWPSAvailableForSourceLayer,
    checkingWPSAvailability,
    distance,
    distanceUom,
    quadrantSegments,
    capStyle,
    layers,
    sourceError,
    sourceFeatureId,
    sourceLayerId,
    sourceFeatures,
    isSourceFeaturesLoading,
    onCheckWPSAvailability,
    onSetBufferDistance,
    onSetBufferDistanceUom,
    onSetBufferQuadrantSegments,
    onSetBufferCapStyle,
    onSetSourceFeatureId,
    onSetSourceLayerId
}) => {
    useEffect(() => {
        if (sourceLayerId) {
            onCheckWPSAvailability(sourceLayerId, "source");
        }
    }, [sourceLayerId]);
    const [showBufferAdvancedSettings, setShowBufferAdvancedSettings] = useState(false);

    const handleOnChangeSource = (sel) => {
        onSetSourceLayerId(sel?.value || "");
    };
    const handleOnChangeSourceFeatureId = (sel) => {
        onSetSourceFeatureId(sel?.value || "");
    };
    const handleOnChangeBufferDistance = (val) => {
        onSetBufferDistance(val);
    };
    const handleOnChangeBufferDistanceUom = (sel) => {
        onSetBufferDistanceUom(sel?.value || "");
    };
    const handleOnChangeBufferQuadrantSegments = (val) => {
        onSetBufferQuadrantSegments(val);
    };
    const handleOnChangeBufferCapStyle = (sel) => {
        onSetBufferCapStyle(sel?.value || "");
    };
    return (
        <>
            <FormGroup>
                <ControlLabel>
                    <Message msgId="GeoProcessingTools.sourceLayer" />
                </ControlLabel>
            </FormGroup>
            <FormGroup>
                <InputGroup>
                    <Select
                        clearable
                        value={sourceLayerId}
                        noResultsText={<Message msgId="GeoProcessingTools.noMatchedLayer" />}
                        onChange={handleOnChangeSource}
                        options={layers.map(f => ({value: f.id, label: f.title || f.name || f.id }))} />
                    <Addon
                        tooltipId={
                            !sourceLayerId ? "GeoProcessingTools.tooltip.selectLayer" : areAllWPSAvailableForSourceLayer ? "GeoProcessingTools.tooltip.validLayer" : "GeoProcessingTools.tooltip.invalidLayer"}
                        tooltipPosition="left"
                        className="btn"
                        bsStyle="primary"
                    >
                        {checkingWPSAvailability ? <Loader size={14} style={{margin: '0 auto'}}/> : <Glyphicon
                            glyph={!sourceLayerId ? "question-sign" : areAllWPSAvailableForSourceLayer ? "ok-sign" : "exclamation-mark"}
                            className={!sourceLayerId ? "text-info" : areAllWPSAvailableForSourceLayer ? "text-success" : "text-danger"}/>}
                    </Addon>

                </InputGroup>
            </FormGroup>
            <FormGroup>
                <ControlLabel>
                    <Message msgId="GeoProcessingTools.sourceFeature" />
                </ControlLabel>
            </FormGroup>
            <FormGroup>
                <InputGroup>
                    <Select
                        clearable
                        value={sourceFeatureId}
                        noResultsText={<Message msgId="GeoProcessingTools.noMatchedFeature" />}
                        onChange={handleOnChangeSourceFeatureId}
                        options={sourceFeatures.map(f => ({value: f.id, label: f.id }))} />
                    <Addon
                        tooltipId={
                            !sourceFeatureId ? "GeoProcessingTools.tooltip.selectFeature" : areAllWPSAvailableForSourceLayer ? "GeoProcessingTools.tooltip.validFeature" : "GeoProcessingTools.tooltip.invalidFeature"}
                        tooltipPosition="left"
                        className="btn"
                        bsStyle="primary"
                    >
                        {isSourceFeaturesLoading ? <Loader size={14} style={{margin: '0 auto'}}/> : <Glyphicon
                            glyph={!sourceFeatureId ? "question-sign" : !sourceError ? "ok-sign" : "exclamation-mark"}
                            className={!sourceFeatureId ? "text-info" : !sourceError ? "text-success" : "text-danger"}/>}
                        {
                            // [ ] improve this with error handling, sfdem is raster and has no features
                        }
                    </Addon>
                </InputGroup>
            </FormGroup>
            <div className="gpt-distance">
                <div className="value">
                    <FormGroup>
                        <ControlLabel>
                            <Message msgId="GeoProcessingTools.distance" />
                        </ControlLabel>
                    </FormGroup>
                    <FormGroup>
                        <InputGroup className="distance">
                            <FormControl
                                type="number"
                                value={distance}
                                onChange={handleOnChangeBufferDistance}
                            />
                            <Select
                                clearable={false}
                                value={distanceUom}
                                noResultsText={<Message msgId="GeoProcessingTools.noMatchedLayer" />}
                                onChange={handleOnChangeBufferDistanceUom}
                                options={[
                                    {value: "m", label: <Message msgId="GeoProcessingTools.m" />},
                                    {value: "km", label: <Message msgId="GeoProcessingTools.km" />}
                                ]} />
                        </InputGroup>
                    </FormGroup>
                </div>
            </div>
            <SwitchPanel
                useToolbar
                title={<Message msgId="GeoProcessingTools.advancedSettings" />}
                expanded={showBufferAdvancedSettings}
                onSwitch={setShowBufferAdvancedSettings}>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="GeoProcessingTools.quadrantSegments" />
                    </ControlLabel>
                </FormGroup>
                <FormGroup>
                    <InputGroup>
                        <FormControl
                            type="number"
                            value={quadrantSegments}
                            onChange={handleOnChangeBufferQuadrantSegments}
                        />

                    </InputGroup>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="GeoProcessingTools.capStyle" />
                    </ControlLabel>
                </FormGroup>
                <FormGroup>
                    <Select
                        clearable
                        value={capStyle}
                        noResultsText={<Message msgId="GeoProcessingTools.noMatchedStyle" />}
                        onChange={handleOnChangeBufferCapStyle}
                        options={[
                            {value: "Round", label: <Message msgId="GeoProcessingTools.round" />},
                            {value: "Flat", label: <Message msgId="GeoProcessingTools.flat" />},
                            {value: "Square", label: <Message msgId="GeoProcessingTools.square" />}
                        ]} />
                </FormGroup>
            </SwitchPanel>
        </>
    );

};

Buffer.propTypes = {
    areAllWPSAvailableForSourceLayer: PropTypes.bool,
    checkingWPSAvailability: PropTypes.bool,
    distance: PropTypes.number,
    distanceUom: PropTypes.string,
    layers: PropTypes.array,
    quadrantSegments: PropTypes.number,
    capStyle: PropTypes.string,
    sourceFeatureId: PropTypes.string,
    sourceFeatures: PropTypes.array,
    isSourceFeaturesLoading: PropTypes.bool,
    sourceError: PropTypes.bool,
    sourceLayerId: PropTypes.string,
    onCheckWPSAvailability: PropTypes.func,
    onSetBufferDistance: PropTypes.func,
    onSetBufferDistanceUom: PropTypes.func,
    onSetBufferQuadrantSegments: PropTypes.func,
    onSetBufferCapStyle: PropTypes.func,
    onSetSourceLayerId: PropTypes.func,
    onSetSourceFeatureId: PropTypes.func
};

const BufferConnected = connect(
    createSelector(
        [
            areAllWPSAvailableForSourceLayerSelector,
            distanceSelector,
            distanceUomSelector,
            quadrantSegmentsSelector,
            capStyleSelector,
            nonBackgroundLayersSelector,
            sourceLayerIdSelector,
            sourceFeatureIdSelector,
            sourceFeaturesSelector,
            isSourceFeaturesLoadingSelector,
            sourceErrorSelector,
            checkingWPSAvailabilitySelector
        ],
        (
            areAllWPSAvailableForSourceLayer,
            distance,
            distanceUom,
            quadrantSegments,
            capStyle,
            layers,
            sourceLayerId,
            sourceFeatureId,
            sourceFeatures,
            isSourceFeaturesLoading,
            sourceError,
            checkingWPSAvailability
        ) => ({
            areAllWPSAvailableForSourceLayer,
            distance,
            distanceUom,
            quadrantSegments,
            capStyle,
            layers,
            sourceLayerId,
            sourceFeatureId,
            sourceFeatures,
            isSourceFeaturesLoading,
            sourceError,
            checkingWPSAvailability
        })),
    {
        onCheckWPSAvailability: checkWPSAvailability,
        onRunBufferProcess: runBufferProcess,
        onSetBufferDistance: setBufferDistance,
        onSetBufferDistanceUom: setBufferDistanceUom,
        onSetBufferQuadrantSegments: setBufferQuadrantSegments,
        onSetBufferCapStyle: setBufferCapStyle,
        onSetSourceLayerId: setSourceLayerId,
        onSetSourceFeatureId: setSourceFeatureId
    })(Buffer);

export default BufferConnected;
