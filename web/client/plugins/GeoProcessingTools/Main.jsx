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

import Message from '../../components/I18N/Message';
import Button from '../../components/misc/Button';
import Loader from '../../components/misc/Loader';
import SwitchButton from '../../components/misc/switch/SwitchButton';
import ConfirmModal from '../../components/resources/modals/ConfirmModal';
import InfoPopover from '../../components/widgets/widget/InfoPopover';
import Buffer from './Buffer';
import Intersection from './Intersection';
import {
    runBufferProcess,
    runIntersectionProcess,
    setSelectedTool,
    toggleHighlightLayers,
    GPT_TOOL_BUFFER,
    GPT_TOOL_INTERSECTION
} from '../../actions/geoProcessingTools';
import {
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
} from '../../selectors/geoProcessingTools';

import { getMessageById } from '../../utils/LocaleUtils';

const MainComp = ({
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
    onRunBufferProcess,
    onRunIntersectionProcess,
    onSetSelectedTool,
    onToggleHighlightLayers
},  {messages}) => {
    const [showWarning, onShowWarning] = useState(false);
    const handleOnChangeTool = (sel) => {
        onSetSelectedTool(sel?.value || "");
    };
    const handleConfirmRunProcess = () => {
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
    const handleOnToggleHighlightLayers = () => {
        onToggleHighlightLayers();
    };
    const handleRunAction = () => {
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
                            <Message msgId="GeoProcessingTools.tool" />
                        </ControlLabel>
                    </FormGroup>
                    <FormGroup>
                        <Select
                            disabled={runningProcess}
                            clearable={false}
                            value={selectedTool}
                            onChange={handleOnChangeTool}
                            options={[{
                                value: GPT_TOOL_BUFFER,
                                label: getMessageById(messages, "GeoProcessingTools.bufferTool")
                            }, {
                                value: GPT_TOOL_INTERSECTION,
                                label: getMessageById(messages, "GeoProcessingTools.intersectionTool")
                            }]} />
                    </FormGroup>
                    {selectedTool === GPT_TOOL_BUFFER ? <Buffer/> : null}
                    {selectedTool === GPT_TOOL_INTERSECTION ? <Intersection/> : null}
                    <FormGroup>
                        <ControlLabel>
                            <Message msgId="GeoProcessingTools.highlight" />
                        </ControlLabel>
                    </FormGroup>
                    <FormGroup>
                        <SwitchButton
                            disabled={runningProcess}
                            checked={showHighlightLayers}
                            onClick={handleOnToggleHighlightLayers}
                        />
                    </FormGroup>
                </Form>
                <div className="run">
                    <Button
                        disabled={
                            runningProcess ||
                            (selectedTool === GPT_TOOL_BUFFER ? !(sourceLayerId && distance) : !(isIntersectionEnabled && intersectionLayerId && sourceLayerId)) ||
                            isIntersectionLayerInvalid || isSourceLayerInvalid
                        }
                        onClick={handleRunAction}
                    >
                        <Message msgId={"GeoProcessingTools.run"} />
                        {runningProcess ? <Loader size={14} style={{margin: '0 auto'}}/> : null}
                    </Button>
                    <InfoPopover
                        bsStyle={isIntersectionLayerInvalid || isSourceLayerInvalid ? "danger" : "info"}
                        text={
                            isIntersectionLayerInvalid || isSourceLayerInvalid ?
                                <Message msgId={"GeoProcessingTools.tooltip.invalidLayers"}
                                /> : <Message msgId={selectedTool === GPT_TOOL_INTERSECTION ?
                                    "GeoProcessingTools.tooltip.fillRequiredDataIntersection" :
                                    "GeoProcessingTools.tooltip.fillRequiredDataBuffer"}
                                />
                        }
                    />

                    <ConfirmModal
                        show={showWarning}
                        onClose={handleCloseWarningModal}
                        onConfirm={handleConfirmRunProcess}
                        title={<Message msgId="GeoProcessingTools.tooltip.warningTitle" />}
                        fitContent
                        confirmText={<Message msgId="GeoProcessingTools.tooltip.warningConfirmText" />}
                        cancelText={<Message msgId="GeoProcessingTools.tooltip.warningCancel" />}
                    >
                        <div className="ms-detail-body">
                            <Message msgId="GeoProcessingTools.tooltip.warningBody" />
                        </div>
                    </ConfirmModal>
                </div>
            </div>
        </>
    );

};

MainComp.propTypes = {
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
        onRunBufferProcess: runBufferProcess,
        onRunIntersectionProcess: runIntersectionProcess,
        onSetSelectedTool: setSelectedTool,
        onToggleHighlightLayers: toggleHighlightLayers
    })(MainComp);

export default MainCompConnected;
