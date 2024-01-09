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
    setSourceLayerId,
    getFeatures,
    setSelectedLayerType,
    setSourceFeatureId
} from '../../actions/geoProcessing';
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
    availableLayersSelector
} from '../../selectors/geoProcessing';

import { createFeatureId } from '../../utils/LayersUtils';

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
        if (sel?.value !== sourceLayerId) {
            onSetSourceLayerId(sel?.value ?? "");
        }
    };
    const handleOnChangeSourceFeatureId = (sel) => {
        if (sel?.value !== sourceFeatureId) {
            onSetSourceFeatureId(sel?.value ?? "");
        }
    };
    const isDisableClickSelectFeature = !sourceLayerId || isSourceFeaturesLoading || checkingWPSAvailability;
    const handleOnClickToSelectSourceFeature = () => {
        if (!isDisableClickSelectFeature) {
            onSetSelectedLayerType(selectedLayerType === "source" ? "" : "source");
        }
    };
    return (<>
        <FormGroup>
            <ControlLabel>
                <Message msgId="GeoProcessing.sourceLayer" />
            </ControlLabel>
            <InputGroup>
                <Select
                    disabled={runningProcess}
                    clearable
                    value={sourceLayerId}
                    noResultsText={<Message msgId="GeoProcessing.noMatchedLayer" />}
                    onChange={handleOnChangeSource}
                    options={layers.map(f => ({value: f.id, label: f.title || f.name || f.id }))} />
                <Addon
                    tooltipId={
                        !sourceLayerId ? "GeoProcessing.tooltip.selectLayer" : areAllWPSAvailableForSourceLayer && !isSourceLayerInvalid  ? "GeoProcessing.tooltip.validLayer" : "GeoProcessing.tooltip.invalidLayer"}
                    tooltipPosition="left"
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
                <Message msgId="GeoProcessing.sourceFeature" />
            </ControlLabel>
            <InputGroup className="infinite-select-scroll">
                <Select
                    disabled={checkingWPSAvailability || isSourceFeaturesLoading || runningProcess || isSourceLayerInvalid}
                    clearable
                    noResultsText={<Message msgId="GeoProcessing.noMatchedFeature" />}
                    onChange={handleOnChangeSourceFeatureId}
                    options={sourceFeatures.map((f, i) => ({value: createFeatureId(f).id, label: f?.properties?.measureType ? `${f?.properties?.measureType} #${i}` : createFeatureId(f).id }))}
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
                        !sourceFeatureId ? "GeoProcessing.tooltip.selectFeature" : areAllWPSAvailableForSourceLayer ? "GeoProcessing.tooltip.validFeature" : "GeoProcessing.tooltip.invalidFeature"}
                    tooltipPosition="left"
                    bsStyle="primary"
                >
                    {isSourceFeaturesLoading ? <Loader size={14} style={{margin: '0 auto'}}/> : <Glyphicon
                        glyph={!sourceFeatureId ? "question-sign" : !isSourceLayerInvalid ? "ok-sign" : "exclamation-mark"}
                        className={!sourceFeatureId ? "text-info" : !isSourceLayerInvalid ? "text-success" : "text-danger"}/>}
                </Addon>
                <Addon
                    disabled={isDisableClickSelectFeature}
                    onClick={handleOnClickToSelectSourceFeature}
                    tooltipId={"GeoProcessing.tooltip.clickToSelectFeature"}
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
    selectedLayerType: PropTypes.string,
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
            availableLayersSelector,
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
        onSetSourceLayerId: setSourceLayerId,
        onGetFeatures: getFeatures,
        onSetSelectedLayerType: setSelectedLayerType,
        onSetSourceFeatureId: setSourceFeatureId
    })(Source);

SourceConnected.displayName = "SourceLayer";
export default SourceConnected;
