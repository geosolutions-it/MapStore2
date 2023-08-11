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
    setIntersectionLayerId,
    setIntersectionFeatureId,
    setSelectedLayerType,
    getFeatures
} from '../../actions/geoProcessingTools';
import {
    areAllWPSAvailableForIntersectionLayerSelector,
    checkingWPSAvailabilityIntersectionSelector,
    isIntersectionLayerInvalidSelector,
    runningProcessSelector,
    intersectionLayerIdSelector,
    intersectionFeatureIdSelector,
    intersectionFeaturesSelector,
    intersectionTotalCountSelector,
    intersectionCurrentPageSelector,
    isIntersectionFeaturesLoadingSelector,
    selectedLayerTypeSelector,
    wfsBackedLayersSelector
} from '../../selectors/geoProcessingTools';

const Addon = tooltip(InputGroup.Addon);
const Intersection = ({
    areAllWPSAvailableForIntersectionLayer,
    checkingWPSAvailabilityIntersection,
    layers,
    isIntersectionLayerInvalid,
    intersectionLayerId,
    intersectionFeatureId,
    intersectionFeatures,
    isIntersectionFeaturesLoading,
    runningProcess,
    selectedLayerType,
    intersectionCurrentPage,
    intersectionTotalCount,
    onGetFeatures,
    onCheckWPSAvailability,
    onSetIntersectionLayerId,
    onSetIntersectionFeatureId,
    onSetSelectedLayerType
}) => {
    useEffect(() => {
        if (intersectionLayerId) {
            onCheckWPSAvailability(intersectionLayerId, "intersection");
        }
    }, [intersectionLayerId]);

    const handleOnChangeIntersectionLayer = (sel) => {
        onSetIntersectionLayerId(sel?.value || "");
    };
    const handleOnChangeIntersectionFeatureId = (sel) => {
        onSetIntersectionFeatureId(sel?.value || "");
    };
    const handleOnClickToSelectIntersectionFeature = () => {
        onSetSelectedLayerType(selectedLayerType === "intersection" ? "" : "intersection");
    };
    return (
        <>

            <FormGroup>
                <ControlLabel>
                    <Message msgId="GeoProcessingTools.intersectionLayer" />
                </ControlLabel>
            </FormGroup>
            <FormGroup>
                <InputGroup>
                    <Select
                        disabled={runningProcess}
                        clearable
                        value={intersectionLayerId}
                        noResultsText={<Message msgId="GeoProcessingTools.noMatchedLayer" />}
                        onChange={handleOnChangeIntersectionLayer}
                        options={layers.map(f => ({value: f.id, label: f.title || f.name || f.id }))} />
                    <Addon
                        tooltipId={
                            !intersectionLayerId ? "GeoProcessingTools.tooltip.selectLayer" : areAllWPSAvailableForIntersectionLayer && !isIntersectionLayerInvalid ? "GeoProcessingTools.tooltip.validLayer" : "GeoProcessingTools.tooltip.invalidLayer"}
                        tooltipPosition="left"
                        className="btn"
                        bsStyle="primary"
                    >
                        {checkingWPSAvailabilityIntersection ? <Loader size={14} style={{margin: '0 auto'}}/> : <Glyphicon
                            glyph={!intersectionLayerId ? "question-sign" : areAllWPSAvailableForIntersectionLayer && !isIntersectionLayerInvalid ? "ok-sign" : "exclamation-mark"}
                            className={!intersectionLayerId ? "text-info" : areAllWPSAvailableForIntersectionLayer && !isIntersectionLayerInvalid ? "text-success" : "text-danger"}/>}
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
                        disabled={runningProcess || isIntersectionLayerInvalid}
                        clearable
                        value={intersectionFeatureId}
                        noResultsText={<Message msgId="GeoProcessingTools.noMatchedFeature" />}
                        onChange={handleOnChangeIntersectionFeatureId}
                        options={intersectionFeatures.map(f => ({value: f.id, label: f.id }))}
                        onOpen={() => {
                            if (selectedLayerType !== "intersection" && intersectionFeatures.length === 0 ) {
                                onGetFeatures(intersectionLayerId, "intersection", 0);
                            }
                        }}
                        onMenuScrollToBottom={() => {
                            if (intersectionTotalCount > intersectionFeatures.length) {
                                onGetFeatures(intersectionLayerId, "intersection", intersectionCurrentPage + 1);
                            }
                        }}
                    />
                    <Addon
                        tooltipId={
                            !intersectionFeatureId ? "GeoProcessingTools.tooltip.selectFeature" : areAllWPSAvailableForIntersectionLayer ? "GeoProcessingTools.tooltip.validFeature" : "GeoProcessingTools.tooltip.invalidFeature"}
                        tooltipPosition="left"
                        className="btn"
                        bsStyle="primary"
                    >
                        {isIntersectionFeaturesLoading ? <Loader size={14} style={{margin: '0 auto'}}/> : <Glyphicon
                            glyph={!intersectionFeatureId ? "question-sign" : !isIntersectionLayerInvalid ? "ok-sign" : "exclamation-mark"}
                            className={!intersectionFeatureId ? "text-info" : !isIntersectionLayerInvalid ? "text-success" : "text-danger"}/>}
                    </Addon>
                    <Addon
                        disabled={!intersectionLayerId}
                        onClick={handleOnClickToSelectIntersectionFeature}
                        tooltipId={"GeoProcessingTools.tooltip.clickToSelectFeature"}
                        tooltipPosition="left"
                        className="btn"
                        bsStyle={selectedLayerType === "intersection" ? "success" : "primary"}
                    >
                        <Glyphicon
                            glyph={"map-marker"}
                            className={selectedLayerType === "intersection" ? "" : "text-info"}
                        />
                    </Addon>
                </InputGroup>
            </FormGroup>
        </>
    );

};

Intersection.propTypes = {
    areAllWPSAvailableForIntersectionLayer: PropTypes.bool,
    checkingWPSAvailabilityIntersection: PropTypes.bool,
    intersectionFeatureId: PropTypes.string,
    intersectionFeatures: PropTypes.array,
    intersectionTotalCount: PropTypes.number,
    intersectionCurrentPage: PropTypes.number,
    intersectionLayerId: PropTypes.string,
    isIntersectionFeaturesLoading: PropTypes.bool,
    layers: PropTypes.array,
    runningProcess: PropTypes.bool,
    isIntersectionLayerInvalid: PropTypes.bool,
    selectedLayerType: PropTypes.string,
    onCheckWPSAvailability: PropTypes.func,
    onSetIntersectionLayerId: PropTypes.func,
    onSetIntersectionFeatureId: PropTypes.func,
    onGetFeatures: PropTypes.func,
    onSetSelectedLayerType: PropTypes.func
};

Intersection.contextTypes = {
    messages: PropTypes.object
};
// [ ] add toc layer list in combobox, on selection make the check
const IntersectionConnected = connect(
    createSelector(
        [
            areAllWPSAvailableForIntersectionLayerSelector,
            wfsBackedLayersSelector,
            isIntersectionFeaturesLoadingSelector,
            intersectionLayerIdSelector,
            intersectionFeatureIdSelector,
            intersectionFeaturesSelector,
            intersectionTotalCountSelector,
            intersectionCurrentPageSelector,
            runningProcessSelector,
            checkingWPSAvailabilityIntersectionSelector,
            isIntersectionLayerInvalidSelector,
            selectedLayerTypeSelector
        ],
        (
            areAllWPSAvailableForIntersectionLayer,
            layers,
            isIntersectionFeaturesLoading,
            intersectionLayerId,
            intersectionFeatureId,
            intersectionFeatures,
            intersectionTotalCount,
            intersectionCurrentPage,
            runningProcess,
            checkingWPSAvailabilityIntersection,
            isIntersectionLayerInvalid,
            selectedLayerType
        ) => ({
            areAllWPSAvailableForIntersectionLayer,
            layers,
            isIntersectionFeaturesLoading,
            intersectionLayerId,
            intersectionFeatureId,
            intersectionFeatures,
            intersectionTotalCount,
            intersectionCurrentPage,
            runningProcess,
            checkingWPSAvailabilityIntersection,
            isIntersectionLayerInvalid,
            selectedLayerType
        })),
    {
        onCheckWPSAvailability: checkWPSAvailability,
        onSetIntersectionLayerId: setIntersectionLayerId,
        onSetIntersectionFeatureId: setIntersectionFeatureId,
        onGetFeatures: getFeatures,
        onSetSelectedLayerType: setSelectedLayerType
    })(Intersection);

export default IntersectionConnected;
