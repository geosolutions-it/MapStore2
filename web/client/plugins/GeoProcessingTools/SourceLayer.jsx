/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useEffect} from 'react';
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
import tooltip from '../../components/misc/enhancers/tooltip';
import Loader from '../../components/misc/Loader';
import {
    checkWPSAvailability,
    runBufferProcess,
    setSourceLayerId,
    getFeatures,
    setSelectedLayerType,
    setSourceFeatureId
} from '../../actions/geoProcessingTools';
import {
    areAllWPSAvailableForSourceLayerSelector,
    checkingWPSAvailabilitySelector,
    runningProcessSelector,
    sourceLayerIdSelector,
    sourceFeatureIdSelector,
    sourceFeaturesSelector,
    sourceTotalCountSelector,
    sourceCurrentPageSelector,
    isSourceLayerInvalidSelector,
    isSourceFeaturesLoadingSelector,
    selectedLayerTypeSelector,
    wfsBackedLayersSelector
} from '../../selectors/geoProcessingTools';

const Addon = tooltip(InputGroup.Addon);

const Source = ({
    areAllWPSAvailableForSourceLayer,
    checkingWPSAvailability,
    runningProcess,
    layers,
    isSourceLayerInvalid,
    sourceFeatureId,
    sourceLayerId,
    sourceFeatures,
    sourceTotalCount,
    sourceCurrentPage,
    selectedLayerType,
    isSourceFeaturesLoading,
    onGetFeatures,
    onCheckWPSAvailability,
    onSetSourceFeatureId,
    onSetSourceLayerId,
    onSetSelectedLayerType
}) => {
    useEffect(() => {
        if (sourceLayerId) {
            onCheckWPSAvailability(sourceLayerId, "source");
        }
    }, [sourceLayerId]);

    const handleOnChangeSource = (sel) => {
        onSetSourceLayerId(sel?.value || "");
    };
    const handleOnChangeSourceFeatureId = (sel) => {
        onSetSourceFeatureId(sel?.value || "");
    };
    const handleOnClickToSelectSourceFeature = () => {
        onSetSelectedLayerType(selectedLayerType === "source" ? "" : "source");
    };
    return (<>
        <FormGroup>
            <ControlLabel>
                <Message msgId="GeoProcessingTools.sourceLayer" />
            </ControlLabel>
        </FormGroup>
        <FormGroup>
            <InputGroup>
                <Select
                    disabled={runningProcess}
                    clearable
                    value={sourceLayerId}
                    noResultsText={<Message msgId="GeoProcessingTools.noMatchedLayer" />}
                    onChange={handleOnChangeSource}
                    options={layers.map(f => ({value: f.id, label: f.title || f.name || f.id }))} />
                <Addon
                    tooltipId={
                        !sourceLayerId ? "GeoProcessingTools.tooltip.selectLayer" : areAllWPSAvailableForSourceLayer && !isSourceLayerInvalid  ? "GeoProcessingTools.tooltip.validLayer" : "GeoProcessingTools.tooltip.invalidLayer"}
                    tooltipPosition="left"
                    className="btn"
                    bsStyle="primary"
                >
                    {checkingWPSAvailability ? <Loader size={14} style={{margin: '0 auto'}}/> : <Glyphicon
                        glyph={!sourceLayerId ? "question-sign" : areAllWPSAvailableForSourceLayer && !isSourceLayerInvalid ? "ok-sign" : "exclamation-mark"}
                        className={!sourceLayerId ? "text-info" : areAllWPSAvailableForSourceLayer && !isSourceLayerInvalid ? "text-success" : "text-danger"}/>}
                </Addon>

            </InputGroup>
        </FormGroup>
        <FormGroup>
            <ControlLabel>
                <Message msgId="GeoProcessingTools.sourceFeature" />
            </ControlLabel>
        </FormGroup>
        <FormGroup>
            <InputGroup className="infinite-select-scroll">
                <Select
                    disabled={runningProcess || isSourceLayerInvalid}
                    clearable
                    noResultsText={<Message msgId="GeoProcessingTools.noMatchedFeature" />}
                    onChange={handleOnChangeSourceFeatureId}
                    options={sourceFeatures.map(f => ({value: f.id, label: f.id }))}
                    value={sourceFeatureId}

                    onOpen={() => {
                        if (selectedLayerType !== "source" && sourceFeatures.length === 0 ) {
                            onGetFeatures(sourceLayerId, "source", 0);
                        }
                    }}
                    onMenuScrollToBottom={() => {
                        if (sourceTotalCount > sourceFeatures.length) {
                            onGetFeatures(sourceLayerId, "source", sourceCurrentPage + 1);
                        }
                    }}
                />
                <Addon
                    tooltipId={
                        !sourceFeatureId ? "GeoProcessingTools.tooltip.selectFeature" : areAllWPSAvailableForSourceLayer ? "GeoProcessingTools.tooltip.validFeature" : "GeoProcessingTools.tooltip.invalidFeature"}
                    tooltipPosition="left"
                    className="btn"
                    bsStyle="primary"
                >
                    {isSourceFeaturesLoading ? <Loader size={14} style={{margin: '0 auto'}}/> : <Glyphicon
                        glyph={!sourceFeatureId ? "question-sign" : !isSourceLayerInvalid ? "ok-sign" : "exclamation-mark"}
                        className={!sourceFeatureId ? "text-info" : !isSourceLayerInvalid ? "text-success" : "text-danger"}/>}
                </Addon>
                <Addon
                    disabled={!sourceLayerId}
                    onClick={handleOnClickToSelectSourceFeature}
                    tooltipId={"GeoProcessingTools.tooltip.clickToSelectFeature"}
                    tooltipPosition="left"
                    className="btn"
                    bsStyle={selectedLayerType === "source" ? "success" : "primary"}
                >
                    <Glyphicon
                        glyph={"map-marker"}
                        className={selectedLayerType === "source" ? "" : "text-info"}
                    />
                </Addon>
            </InputGroup>
        </FormGroup>
    </>);
};

Source.propTypes = {
    areAllWPSAvailableForSourceLayer: PropTypes.bool,
    checkingWPSAvailability: PropTypes.bool,
    layers: PropTypes.array,
    runningProcess: PropTypes.bool,
    sourceFeatureId: PropTypes.string,
    sourceFeatures: PropTypes.array,
    sourceTotalCount: PropTypes.number,
    sourceCurrentPage: PropTypes.number,
    isSourceFeaturesLoading: PropTypes.bool,
    isSourceLayerInvalid: PropTypes.bool,
    selectedLayerType: PropTypes.bool,
    sourceLayerId: PropTypes.string,
    onCheckWPSAvailability: PropTypes.func,
    onSetSourceLayerId: PropTypes.func,
    onSetSelectedLayerType: PropTypes.func,
    onGetFeatures: PropTypes.func,
    onSetSourceFeatureId: PropTypes.func
};

const SourceConnected = connect(
    createSelector(
        [
            areAllWPSAvailableForSourceLayerSelector,
            runningProcessSelector,
            wfsBackedLayersSelector,
            sourceLayerIdSelector,
            sourceFeatureIdSelector,
            sourceFeaturesSelector,
            sourceTotalCountSelector,
            sourceCurrentPageSelector,
            isSourceFeaturesLoadingSelector,
            isSourceLayerInvalidSelector,
            checkingWPSAvailabilitySelector,
            selectedLayerTypeSelector
        ],
        (
            areAllWPSAvailableForSourceLayer,
            runningProcess,
            layers,
            sourceLayerId,
            sourceFeatureId,
            sourceFeatures,
            sourceTotalCount,
            sourceCurrentPage,
            isSourceFeaturesLoading,
            isSourceLayerInvalid,
            checkingWPSAvailability,
            selectedLayerType
        ) => ({
            areAllWPSAvailableForSourceLayer,
            runningProcess,
            layers,
            sourceLayerId,
            sourceFeatureId,
            sourceFeatures,
            sourceTotalCount,
            sourceCurrentPage,
            isSourceFeaturesLoading,
            isSourceLayerInvalid,
            checkingWPSAvailability,
            selectedLayerType
        })),
    {
        onCheckWPSAvailability: checkWPSAvailability,
        onRunBufferProcess: runBufferProcess,
        onSetSourceLayerId: setSourceLayerId,
        onGetFeatures: getFeatures,
        onSetSelectedLayerType: setSelectedLayerType,
        onSetSourceFeatureId: setSourceFeatureId
    })(Source);

SourceConnected.displayName = "SourceLayer";
export default SourceConnected;
