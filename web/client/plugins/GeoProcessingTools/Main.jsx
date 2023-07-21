/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
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
import InfoPopover from '../../components/widgets/widget/InfoPopover';
import Buffer from './Buffer';
import Intersection from './Intersection';
import {
    runBufferProcess,
    runIntersectionProcess,
    setSelectedTool,
    GPT_TOOL_BUFFER,
    GPT_TOOL_INTERSECTION
} from '../../actions/geoProcessingTools';
import {
    distanceSelector,
    sourceLayerIdSelector,
    runningProcessSelector,
    intersectionLayerIdSelector,
    isIntersectionEnabledSelector,
    selectedToolSelector
} from '../../selectors/geoProcessingTools';

import { getMessageById } from '../../utils/LocaleUtils';

const MainComp = ({
    distance,
    intersectionLayerId,
    isIntersectionEnabled,
    runningProcess,
    selectedTool,
    sourceLayerId,
    onRunBufferProcess,
    onRunIntersectionProcess,
    onSetSelectedTool
},  {messages}) => {

    const handleOnChangeTool = (sel) => {
        onSetSelectedTool(sel?.value || "");
    };
    const handleRunAction = () => {
        if (selectedTool === GPT_TOOL_BUFFER) {
            onRunBufferProcess();
        } else {
            onRunIntersectionProcess();
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
                </Form>
                <div className="run">
                    <Button
                        disabled={runningProcess || (selectedTool === GPT_TOOL_BUFFER ? !(sourceLayerId && distance) : !(isIntersectionEnabled && intersectionLayerId && sourceLayerId))}
                        onClick={handleRunAction}
                    >
                        <Message msgId={"GeoProcessingTools.run"} />
                        {runningProcess ? <Loader size={14} style={{margin: '0 auto'}}/> : null}
                    </Button>
                    <InfoPopover text={<Message msgId={isIntersectionEnabled ? "GeoProcessingTools.tooltip.intersectionDisabled" : "GeoProcessingTools.tooltip.fillRequiredData"} />} />

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
    sourceLayerId: PropTypes.string,
    runningProcess: PropTypes.bool,
    onRunBufferProcess: PropTypes.func,
    onRunIntersectionProcess: PropTypes.func,
    onSetSelectedTool: PropTypes.func
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
            runningProcessSelector
        ],
        (
            distance,
            intersectionLayerId,
            isIntersectionEnabled,
            selectedTool,
            sourceLayerId,
            runningProcess
        ) => ({
            distance,
            intersectionLayerId,
            isIntersectionEnabled,
            selectedTool,
            sourceLayerId,
            runningProcess
        })),
    {
        onRunBufferProcess: runBufferProcess,
        onRunIntersectionProcess: runIntersectionProcess,
        onSetSelectedTool: setSelectedTool
    })(MainComp);

export default MainCompConnected;
