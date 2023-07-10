/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useEffect} from 'react';
import isNil from 'lodash/isNil';
import PropTypes from 'prop-types';
import {
    FormGroup,
    Form,
    InputGroup,
    ControlLabel,
    Glyphicon
} from 'react-bootstrap';
import { connect } from 'react-redux';
import Select from 'react-select';
import { createSelector } from 'reselect';

import Message from '../../components/I18N/Message';
import tooltip from '../../components/misc/enhancers/tooltip';
import Loader from '../../components/misc/Loader';
import {
    checkWPSAvailability,
    setSelectedTool,
    setSourceLayerId,
    setSourceFeatureId
} from '../../actions/geoProcessingTools';
import {
    areAllWPSAvailableForSourceLayerSelector,
    areAllWPSAvailableForIntersectionLayerSelector,
    sourceLayerIdSelector,
    sourceFeatureIdSelector,
    sourceFeaturesSelector,
    intersectionLayerIdSelector,
    checkingWPSAvailabilitySelector,
    checkedWPSAvailabilitySelector,
    isSourceFeaturesLoadingSelector,
    featuresSourceErrorSelector,
    selectedToolSelector
} from '../../selectors/geoProcessingTools';
import {
    nonBackgroundLayersSelector
} from '../../selectors/layers';

import { getMessageById } from '../../utils/LocaleUtils';

const Addon = tooltip(InputGroup.Addon);
const MainComp = ({
    areAllWPSAvailableForSourceLayer,
    // areAllWPSAvailableForIntersectionLayer,
    checkingWPSAvailability,
    layers,
    hasSourceFeatureError,
    isSourceFeaturesLoading,
    selectedTool,
    sourceFeatureId,
    sourceLayerId,
    sourceFeatures,
    onCheckWPSAvailability,
    onSetSelectedTool,
    onSetSourceFeatureId,
    onSetSourceLayerId
}, { messages }) => {
    useEffect(() => {
        if (sourceLayerId && isNil(areAllWPSAvailableForSourceLayer) ) {
            onCheckWPSAvailability(sourceLayerId, "source");
        }
    }, [sourceLayerId]);
    const handleOnChangeTool = (sel) => {
        onSetSelectedTool(sel?.value || "");
    };
    const handleOnChangeSource = (sel) => {
        onSetSourceLayerId(sel?.value || "");
    };
    const handleOnChangeSourceFeature = (sel) => {
        onSetSourceFeatureId(sel?.value || "");
    };
    return (
        <>
            <div className="map-templates-all">
                <Form>
                    <FormGroup>
                        <ControlLabel>
                            <Message msgId="GeoProcessingTools.tool" />
                        </ControlLabel>
                    </FormGroup>
                    <FormGroup>
                        <Select
                            clearable={false}
                            value={selectedTool}
                            onChange={handleOnChangeTool}
                            options={[{
                                value: "buffer",
                                label: getMessageById(messages, "GeoProcessingTools.bufferTool")
                            }, {
                                value: "intersection",
                                label: getMessageById(messages, "GeoProcessingTools.intersectionTool")
                            }]} />
                    </FormGroup>
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
                                noResultsText={<Message msgId="GeoProcessingTools.noSourceLayer" />}
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
                                noResultsText={<Message msgId="GeoProcessingTools.noSourceFeature" />}
                                onChange={handleOnChangeSourceFeature}
                                options={sourceFeatures.map(f => ({value: f.id, label: f.id }))} />
                            <Addon
                                tooltipId={
                                    !sourceFeatureId ? "GeoProcessingTools.tooltip.selectFeature" : areAllWPSAvailableForSourceLayer ? "GeoProcessingTools.tooltip.validFeature" : "GeoProcessingTools.tooltip.invalidFeature"}
                                tooltipPosition="left"
                                className="btn"
                                bsStyle="primary"
                            >
                                {isSourceFeaturesLoading ? <Loader size={14} style={{margin: '0 auto'}}/> : <Glyphicon
                                    glyph={!sourceFeatureId ? "question-sign" : !hasSourceFeatureError ? "ok-sign" : "exclamation-mark"}
                                    className={!sourceFeatureId ? "text-info" : !hasSourceFeatureError ? "text-success" : "text-danger"}/>}
                                {
                                    // [ ] improve this with error handling, sfdem is raster and has no features
                                }
                            </Addon>

                        </InputGroup>
                    </FormGroup>
                </Form>
            </div>
        </>
    );

};

MainComp.propTypes = {
    areAllWPSAvailableForSourceLayer: PropTypes.bool,
    // areAllWPSAvailableForIntersectionLayer: PropTypes.bool,
    checkingWPSAvailability: PropTypes.bool,
    layers: PropTypes.array,
    // intersectionLayerId: PropTypes.string,
    selectedTool: PropTypes.string,
    sourceFeatureId: PropTypes.string,
    sourceFeatures: PropTypes.array,
    isSourceFeaturesLoading: PropTypes.bool,
    hasSourceFeatureError: PropTypes.bool,
    sourceLayerId: PropTypes.string,
    onCheckWPSAvailability: PropTypes.func,
    onSetSelectedTool: PropTypes.func,
    onSetSourceLayerId: PropTypes.func,
    onSetSourceFeatureId: PropTypes.func
};

MainComp.contextTypes = {
    messages: PropTypes.object
};
// [ ] add toc layer list in combobox, on selection make the check
const MainCompConnected = connect(
    createSelector(
        [
            areAllWPSAvailableForSourceLayerSelector,
            areAllWPSAvailableForIntersectionLayerSelector,
            nonBackgroundLayersSelector,
            selectedToolSelector,
            sourceLayerIdSelector,
            sourceFeatureIdSelector,
            sourceFeaturesSelector,
            isSourceFeaturesLoadingSelector,
            intersectionLayerIdSelector,
            featuresSourceErrorSelector,
            checkingWPSAvailabilitySelector,
            checkedWPSAvailabilitySelector
        ],
        (
            areAllWPSAvailableForSourceLayer,
            areAllWPSAvailableForIntersectionLayer,
            layers,
            selectedTool,
            sourceLayerId,
            sourceFeatureId,
            sourceFeatures,
            isSourceFeaturesLoading,
            intersectionLayerId,
            featuresSourceError,
            checkingWPSAvailability,
            checkedWPSAvailability
        ) => ({
            areAllWPSAvailableForSourceLayer,
            areAllWPSAvailableForIntersectionLayer,
            layers,
            selectedTool,
            sourceLayerId,
            sourceFeatureId,
            sourceFeatures,
            isSourceFeaturesLoading,
            intersectionLayerId,
            featuresSourceError,
            checkingWPSAvailability,
            checkedWPSAvailability
        })),
    {
        onCheckWPSAvailability: checkWPSAvailability,
        onSetSelectedTool: setSelectedTool,
        onSetSourceLayerId: setSourceLayerId,
        onSetSourceFeatureId: setSourceFeatureId
    })(MainComp);

export default MainCompConnected;
