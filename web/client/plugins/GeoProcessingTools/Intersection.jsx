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
    setSourceLayerId,
    setSourceFeatureId,
    setIntersectionLayerId,
    setIntersectionFeatureId,
    setIntersectionFirstAttribute,
    setIntersectionSecondAttribute,
    setIntersectionMode,
    setIntersectionPercentagesEnabled,
    setIntersectionAreasEnabled
} from '../../actions/geoProcessingTools';
import {
    areAllWPSAvailableForSourceLayerSelector,
    areAllWPSAvailableForIntersectionLayerSelector,
    checkingWPSAvailabilitySelector,
    checkingWPSAvailabilityIntersectionSelector,
    sourceLayerIdSelector,
    sourceFeatureIdSelector,
    sourceFeaturesSelector,
    sourceErrorSelector,
    intersectionErrorSelector,
    intersectionLayerIdSelector,
    intersectionFeatureIdSelector,
    intersectionFeaturesSelector,
    isIntersectionFeaturesLoadingSelector,
    isSourceFeaturesLoadingSelector,
    firstAttributesToRetainSelector,
    secondAttributesToRetainSelector,
    intersectionModeSelector,
    percentagesEnabledSelector,
    areasEnabledSelector
} from '../../selectors/geoProcessingTools';
import {
    nonBackgroundLayersSelector
} from '../../selectors/layers';

const Addon = tooltip(InputGroup.Addon);
const Intersection = ({
    areAllWPSAvailableForSourceLayer,
    areAllWPSAvailableForIntersectionLayer,
    checkingWPSAvailability,
    checkingWPSAvailabilityIntersection,
    layers,
    sourceError,
    intersectionError,
    intersectionLayerId,
    intersectionFeatureId,
    intersectionFeatures,
    isSourceFeaturesLoading,
    isIntersectionFeaturesLoading,
    firstAttributesToRetain,
    secondAttributesToRetain,
    intersectionMode,
    percentagesEnabled,
    areasEnabled,
    sourceFeatureId,
    sourceLayerId,
    sourceFeatures,
    onCheckWPSAvailability,
    onSetSourceFeatureId,
    onSetSourceLayerId,
    onSetIntersectionLayerId,
    onSetIntersectionFeatureId,
    onSetIntersectionFirstAttribute,
    onSetIntersectionSecondAttribute,
    onSetIntersectionMode,
    onSetIntersectionPercentagesEnabled,
    onSetIntersectionAreasEnabled
}) => {
    useEffect(() => {
        if (sourceLayerId) {
            onCheckWPSAvailability(sourceLayerId, "source");
        }
    }, [sourceLayerId]);
    useEffect(() => {
        if (intersectionLayerId) {
            onCheckWPSAvailability(intersectionLayerId, "intersection");
        }
    }, [intersectionLayerId]);
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

    const handleOnChangeSource = (sel) => {
        onSetSourceLayerId(sel?.value || "");
    };
    const handleOnChangeSourceFeatureId = (sel) => {
        onSetSourceFeatureId(sel?.value || "");
    };
    const handleOnChangeIntersectionLayer = (sel) => {
        onSetIntersectionLayerId(sel?.value || "");
    };
    const handleOnChangeIntersectionFeatureId = (sel) => {
        onSetIntersectionFeatureId(sel?.value || "");
    };
    const handleOnChangeFirstAttributesToRetain = (val) => {
        onSetIntersectionFirstAttribute(val);
    };
    const handleOnChangeSecondAttributesToRetain = (val) => {
        onSetIntersectionSecondAttribute(val);
    };
    const handleOnChangeIntersectionMode = (sel) => {
        onSetIntersectionMode(sel?.value || "");
    };
    const handleOnChangePercentagesEnabled = (val) => {
        onSetIntersectionPercentagesEnabled(val);
    };
    const handleOnChangeAreasEnabled = (val) => {
        onSetIntersectionAreasEnabled(val);
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
            <FormGroup>
                <ControlLabel>
                    <Message msgId="GeoProcessingTools.intersectionLayer" />
                </ControlLabel>
            </FormGroup>
            <FormGroup>
                <InputGroup>
                    <Select
                        clearable
                        value={intersectionLayerId}
                        noResultsText={<Message msgId="GeoProcessingTools.noMatchedLayer" />}
                        onChange={handleOnChangeIntersectionLayer}
                        options={layers.map(f => ({value: f.id, label: f.title || f.name || f.id }))} />
                    <Addon
                        tooltipId={
                            !intersectionLayerId ? "GeoProcessingTools.tooltip.selectLayer" : areAllWPSAvailableForSourceLayer ? "GeoProcessingTools.tooltip.validLayer" : "GeoProcessingTools.tooltip.invalidLayer"}
                        tooltipPosition="left"
                        className="btn"
                        bsStyle="primary"
                    >
                        {checkingWPSAvailabilityIntersection ? <Loader size={14} style={{margin: '0 auto'}}/> : <Glyphicon
                            glyph={!intersectionLayerId ? "question-sign" : areAllWPSAvailableForIntersectionLayer ? "ok-sign" : "exclamation-mark"}
                            className={!intersectionLayerId ? "text-info" : areAllWPSAvailableForIntersectionLayer ? "text-success" : "text-danger"}/>}
                    </Addon>

                </InputGroup>
            </FormGroup>
            <FormGroup>
                <ControlLabel>
                    <Message msgId="GeoProcessingTools.intersectionFeature" />
                </ControlLabel>
            </FormGroup>
            <FormGroup>
                <InputGroup>
                    <Select
                        clearable
                        value={intersectionFeatureId}
                        noResultsText={<Message msgId="GeoProcessingTools.noMatchedFeature" />}
                        onChange={handleOnChangeIntersectionFeatureId}
                        options={intersectionFeatures.map(f => ({value: f.id, label: f.id }))} />
                    <Addon
                        tooltipId={
                            !intersectionFeatureId ? "GeoProcessingTools.tooltip.selectFeature" : areAllWPSAvailableForIntersectionLayer ? "GeoProcessingTools.tooltip.validFeature" : "GeoProcessingTools.tooltip.invalidFeature"}
                        tooltipPosition="left"
                        className="btn"
                        bsStyle="primary"
                    >
                        {isIntersectionFeaturesLoading ? <Loader size={14} style={{margin: '0 auto'}}/> : <Glyphicon
                            glyph={!intersectionFeatureId ? "question-sign" : !intersectionError ? "ok-sign" : "exclamation-mark"}
                            className={!intersectionFeatureId ? "text-info" : !intersectionError ? "text-success" : "text-danger"}/>}
                    </Addon>
                </InputGroup>
            </FormGroup>
            <SwitchPanel
                useToolbar
                title={<Message msgId="GeoProcessingTools.advancedSettings" />}
                expanded={showAdvancedSettings}
                onSwitch={setShowAdvancedSettings}>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="GeoProcessingTools.firstAttributesToRetain" />
                    </ControlLabel>
                </FormGroup>
                <FormGroup>
                    <InputGroup>
                        <FormControl
                            type="text"
                            value={firstAttributesToRetain}
                            onChange={handleOnChangeFirstAttributesToRetain}
                        />
                    </InputGroup>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="GeoProcessingTools.secondAttributesToRetain" />
                    </ControlLabel>
                </FormGroup>
                <FormGroup>
                    <InputGroup>
                        <FormControl
                            type="text"
                            value={secondAttributesToRetain}
                            onChange={handleOnChangeSecondAttributesToRetain}
                        />
                    </InputGroup>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="GeoProcessingTools.intersectionMode" />
                    </ControlLabel>
                </FormGroup>
                <FormGroup>
                    <Select
                        clearable
                        value={intersectionMode}
                        noResultsText={<Message msgId="GeoProcessingTools.noMatchedMode" />}
                        onChange={handleOnChangeIntersectionMode}
                        options={[
                            {value: "INTERSECTION", label: <Message msgId="GeoProcessingTools.INTERSECTION" />},
                            {value: "FIRST", label: <Message msgId="GeoProcessingTools.FIRST" />},
                            {value: "SECOND", label: <Message msgId="GeoProcessingTools.SECOND" />}
                        ]}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="GeoProcessingTools.percentagesEnabled" />
                    </ControlLabel>
                </FormGroup>
                <FormGroup>
                    <Select
                        clearable={false}
                        value={percentagesEnabled}
                        onChange={handleOnChangePercentagesEnabled}
                        options={[
                            {value: "true", label: <Message msgId="GeoProcessingTools.true" />},
                            {value: "false", label: <Message msgId="GeoProcessingTools.false" />}
                        ]}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="GeoProcessingTools.areasEnabled" />
                    </ControlLabel>
                </FormGroup>
                <FormGroup>
                    <Select
                        clearable={false}
                        value={areasEnabled}
                        onChange={handleOnChangeAreasEnabled}
                        options={[
                            {value: "true", label: <Message msgId="GeoProcessingTools.true" />},
                            {value: "false", label: <Message msgId="GeoProcessingTools.false" />}
                        ]}
                    />
                </FormGroup>
            </SwitchPanel>
        </>
    );

};

Intersection.propTypes = {
    areAllWPSAvailableForSourceLayer: PropTypes.bool,
    areAllWPSAvailableForIntersectionLayer: PropTypes.bool,
    checkingWPSAvailability: PropTypes.bool,
    checkingWPSAvailabilityIntersection: PropTypes.bool,
    layers: PropTypes.array,
    intersectionLayerId: PropTypes.string,
    intersectionFeatures: PropTypes.array,
    intersectionFeatureId: PropTypes.string,
    sourceFeatureId: PropTypes.string,
    sourceFeatures: PropTypes.array,
    isSourceFeaturesLoading: PropTypes.bool,
    isIntersectionFeaturesLoading: PropTypes.bool,
    firstAttributesToRetain: PropTypes.string,
    secondAttributesToRetain: PropTypes.string,
    intersectionMode: PropTypes.string,
    percentagesEnabled: PropTypes.bool,
    areasEnabled: PropTypes.bool,
    sourceError: PropTypes.bool,
    intersectionError: PropTypes.bool,
    sourceLayerId: PropTypes.string,
    onCheckWPSAvailability: PropTypes.func,
    onSetSourceLayerId: PropTypes.func,
    onSetSourceFeatureId: PropTypes.func,
    onSetIntersectionLayerId: PropTypes.func,
    onSetIntersectionFeatureId: PropTypes.func,
    onSetIntersectionFirstAttribute: PropTypes.func,
    onSetIntersectionSecondAttribute: PropTypes.func,
    onSetIntersectionMode: PropTypes.func,
    onSetIntersectionPercentagesEnabled: PropTypes.func,
    onSetIntersectionAreasEnabled: PropTypes.func
};

Intersection.contextTypes = {
    messages: PropTypes.object
};
// [ ] add toc layer list in combobox, on selection make the check
const IntersectionConnected = connect(
    createSelector(
        [
            areAllWPSAvailableForSourceLayerSelector,
            areAllWPSAvailableForIntersectionLayerSelector,
            nonBackgroundLayersSelector,
            sourceLayerIdSelector,
            sourceFeatureIdSelector,
            sourceFeaturesSelector,
            isSourceFeaturesLoadingSelector,
            isIntersectionFeaturesLoadingSelector,
            intersectionLayerIdSelector,
            intersectionFeatureIdSelector,
            intersectionFeaturesSelector,
            sourceErrorSelector,
            intersectionErrorSelector,
            checkingWPSAvailabilitySelector,
            checkingWPSAvailabilityIntersectionSelector,
            firstAttributesToRetainSelector,
            secondAttributesToRetainSelector,
            intersectionModeSelector,
            percentagesEnabledSelector,
            areasEnabledSelector
        ],
        (
            areAllWPSAvailableForSourceLayer,
            areAllWPSAvailableForIntersectionLayer,
            layers,
            sourceLayerId,
            sourceFeatureId,
            sourceFeatures,
            isSourceFeaturesLoading,
            isIntersectionFeaturesLoading,
            intersectionLayerId,
            intersectionFeatureId,
            intersectionFeatures,
            sourceError,
            intersectionError,
            checkingWPSAvailability,
            checkingWPSAvailabilityIntersection,
            firstAttributesToRetain,
            secondAttributesToRetain,
            intersectionMode,
            percentagesEnabled,
            areasEnabled
        ) => ({
            areAllWPSAvailableForSourceLayer,
            areAllWPSAvailableForIntersectionLayer,
            layers,
            sourceLayerId,
            sourceFeatureId,
            sourceFeatures,
            isSourceFeaturesLoading,
            isIntersectionFeaturesLoading,
            intersectionLayerId,
            intersectionFeatureId,
            intersectionFeatures,
            sourceError,
            intersectionError,
            checkingWPSAvailability,
            checkingWPSAvailabilityIntersection,
            firstAttributesToRetain,
            secondAttributesToRetain,
            intersectionMode,
            percentagesEnabled,
            areasEnabled
        })),
    {
        onCheckWPSAvailability: checkWPSAvailability,
        onSetSourceLayerId: setSourceLayerId,
        onSetSourceFeatureId: setSourceFeatureId,
        onSetIntersectionLayerId: setIntersectionLayerId,
        onSetIntersectionFeatureId: setIntersectionFeatureId,
        onSetIntersectionFirstAttribute: setIntersectionFirstAttribute,
        onSetIntersectionSecondAttribute: setIntersectionSecondAttribute,
        onSetIntersectionMode: setIntersectionMode,
        onSetIntersectionPercentagesEnabled: setIntersectionPercentagesEnabled,
        onSetIntersectionAreasEnabled: setIntersectionAreasEnabled
    })(Intersection);

export default IntersectionConnected;
