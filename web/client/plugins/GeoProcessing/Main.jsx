/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {
    Form,
    FormGroup,
    ControlLabel
} from 'react-bootstrap';
import { connect } from 'react-redux';
import Select from 'react-select';
import { createSelector } from 'reselect';
import { processes } from './processes';

import Message from '../../components/I18N/Message';
import Button from '../../components/misc/Button';
import Loader from '../../components/misc/Loader';

import ConfirmModal from '../../components/resources/modals/ConfirmModal';
import InfoPopover from '../../components/widgets/widget/InfoPopover';
import Buffer from './Buffer';
import Intersection from './Intersection';
import {
    reset,
    runBufferProcess,
    runIntersectionProcess,
    setSelectedTool,
    toggleHighlightLayers,
    GPT_TOOL_BUFFER,
    GPT_TOOL_INTERSECTION
} from '../../actions/geoProcessing';
import {
    areAllWPSAvailableForSourceLayerSelector,
    areAllWPSAvailableForIntersectionLayerSelector,
    distanceSelector,
    intersectionLayerIdSelector,
    isIntersectionEnabledSelector,
    intersectionFeatureSelector,
    runningProcessSelector,
    sourceLayerIdSelector,
    showHighlightLayersSelector,
    sourceFeatureSelector,
    selectedToolSelector,
    isIntersectionLayerInvalidSelector,
    isSourceLayerInvalidSelector
} from '../../selectors/geoProcessing';

import { getMessageById } from '../../utils/LocaleUtils';

const MainComp = ({
    areAllWPSAvailableForSourceLayer,
    areAllWPSAvailableForIntersectionLayer,
    distance,
    intersectionLayerId,
    isIntersectionEnabled,
    runningProcess,
    selectedTool,
    showHighlightLayers = true,
    sourceLayerId,
    sourceFeature,
    isIntersectionLayerInvalid,
    isSourceLayerInvalid,
    intersectionFeature,
    onReset,
    onRunBufferProcess,
    onRunIntersectionProcess,
    onSetSelectedTool,
    onToggleHighlightLayers
},  {messages}) => {
    const [showWarning, onShowWarning] = useState(false);
    const handleOnChangeTool = (sel) => {
        onSetSelectedTool(sel?.value || "");
        if ((sel?.value) !== selectedTool) {
            onReset();
        }
    };
    const handleConfirmRunProcess = () => {
        if (showHighlightLayers) {
            onToggleHighlightLayers();
        }
        if (selectedTool === GPT_TOOL_BUFFER) {
            onRunBufferProcess();
        } else {
            onRunIntersectionProcess();
        }
        onShowWarning(false);
    };
    const handleCloseWarningModal = () => {
        onShowWarning(false);
    };
    const handleRunAction = () => {
        if (showHighlightLayers) {
            onToggleHighlightLayers();
        }

        selectedTool.run();

        if (selectedTool === GPT_TOOL_BUFFER) {
            if (!sourceFeature) {
                onShowWarning(true);
            } else {
                onRunBufferProcess();
            }
        } else {
            if (!sourceFeature || !intersectionFeature) {
                onShowWarning(true);
            } else {
                onRunIntersectionProcess();
            }
        }
    };
    return (
        <>
            <div className="map-templates-all">
                <Form>
                    <FormGroup>
                        <ControlLabel>
                            <Message msgId="GeoProcessing.tool" />
                        </ControlLabel>
                    </FormGroup>
                    <FormGroup>
                        <Select
                            disabled={runningProcess}
                            clearable={false}
                            value={selectedTool}
                            onChange={handleOnChangeTool}
                            options={processes.map(({optionItem}) => {
                                return {
                                    value: optionItem.value,
                                    label: getMessageById(messages, optionItem.labelMsgId)
                                };
                            })} />
                    </FormGroup>


                    {selectedTool === GPT_TOOL_BUFFER ? <Buffer/> : null}
                    {selectedTool === GPT_TOOL_INTERSECTION ? <Intersection/> : null}

                </Form>
                <div className="run">
                    <Button
                        disabled={
                            runningProcess ||
                            (selectedTool === GPT_TOOL_BUFFER ? !(sourceLayerId && distance && areAllWPSAvailableForSourceLayer) :
                                !(isIntersectionEnabled && intersectionLayerId && sourceLayerId && areAllWPSAvailableForSourceLayer && areAllWPSAvailableForIntersectionLayer)) ||
                            isIntersectionLayerInvalid ||
                            isSourceLayerInvalid
                        }
                        onClick={handleRunAction}
                    >
                        <Message msgId={"GeoProcessing.run"} />
                        {runningProcess ? <Loader size={14} style={{margin: '0 auto'}}/> : null}
                    </Button>
                    <InfoPopover
                        bsStyle={isIntersectionLayerInvalid || isSourceLayerInvalid ? "danger" : "info"}
                        text={
                            isIntersectionLayerInvalid || isSourceLayerInvalid ?
                                <Message msgId={"GeoProcessing.tooltip.invalidLayers"}
                                /> : <Message msgId={selectedTool === GPT_TOOL_INTERSECTION ?
                                    "GeoProcessing.tooltip.fillRequiredDataIntersection" :
                                    "GeoProcessing.tooltip.fillRequiredDataBuffer"}
                                />
                        }
                    />
                    <ConfirmModal
                        show={showWarning}
                        onClose={handleCloseWarningModal}
                        onConfirm={handleConfirmRunProcess}
                        title={<Message msgId="GeoProcessing.warningTitle" />}
                        fitContent
                        confirmText={<Message msgId="GeoProcessing.warningConfirmText" />}
                        cancelText={<Message msgId="GeoProcessing.warningCancel" />}
                    >
                        <div className="ms-detail-body">
                            <Message msgId="GeoProcessing.warningBody" />
                        </div>
                    </ConfirmModal>
                </div>
            </div>
        </>
    );

};

MainComp.propTypes = {
    areAllWPSAvailableForSourceLayer: PropTypes.bool,
    areAllWPSAvailableForIntersectionLayer: PropTypes.bool,
    distance: PropTypes.number,
    intersectionLayerId: PropTypes.string,
    isIntersectionEnabled: PropTypes.bool,
    selectedTool: PropTypes.string,
    showHighlightLayers: PropTypes.bool,
    sourceLayerId: PropTypes.string,
    sourceFeature: PropTypes.object,
    intersectionFeature: PropTypes.object,
    runningProcess: PropTypes.bool,
    isIntersectionLayerInvalid: PropTypes.bool,
    isSourceLayerInvalid: PropTypes.bool,
    onReset: PropTypes.func,
    onRunBufferProcess: PropTypes.func,
    onRunIntersectionProcess: PropTypes.func,
    onSetSelectedTool: PropTypes.func,
    onToggleHighlightLayers: PropTypes.func
};

MainComp.contextTypes = {
    messages: PropTypes.object
};

const MainCompConnected = connect(
    createSelector(
        [
            areAllWPSAvailableForSourceLayerSelector,
            areAllWPSAvailableForIntersectionLayerSelector,
            distanceSelector,
            intersectionLayerIdSelector,
            isIntersectionEnabledSelector,
            selectedToolSelector,
            sourceLayerIdSelector,
            runningProcessSelector,
            showHighlightLayersSelector,
            sourceFeatureSelector,
            intersectionFeatureSelector,
            isIntersectionLayerInvalidSelector,
            isSourceLayerInvalidSelector
        ],
        (
            areAllWPSAvailableForSourceLayer,
            areAllWPSAvailableForIntersectionLayer,
            distance,
            intersectionLayerId,
            isIntersectionEnabled,
            selectedTool,
            sourceLayerId,
            runningProcess,
            showHighlightLayers,
            sourceFeature,
            intersectionFeature,
            isIntersectionLayerInvalid,
            isSourceLayerInvalid
        ) => ({
            areAllWPSAvailableForSourceLayer,
            areAllWPSAvailableForIntersectionLayer,
            distance,
            intersectionLayerId,
            isIntersectionEnabled,
            selectedTool,
            sourceLayerId,
            runningProcess,
            showHighlightLayers,
            sourceFeature,
            intersectionFeature,
            isIntersectionLayerInvalid,
            isSourceLayerInvalid
        })),
    {
        onReset: reset,
        onRunBufferProcess: runBufferProcess,
        onRunIntersectionProcess: runIntersectionProcess,
        onSetSelectedTool: setSelectedTool,
        onToggleHighlightLayers: toggleHighlightLayers
    })(MainComp);

export default MainCompConnected;
