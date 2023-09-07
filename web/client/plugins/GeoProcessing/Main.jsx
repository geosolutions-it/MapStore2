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
import find from 'lodash/find';
import { createSelector } from 'reselect';
import { processes } from './processes';

import Message from '../../components/I18N/Message';

import Buffer from './Buffer';
import Intersection from './Intersection';
import {
    reset,
    setSelectedTool,
    GPT_TOOL_BUFFER,
    GPT_TOOL_INTERSECTION
} from '../../actions/geoProcessing';
import {
    runningProcessSelector,
    selectedToolSelector
} from '../../selectors/geoProcessing';

import { getMessageById } from '../../utils/LocaleUtils';

const MainComp = ({
    runningProcess,
    selectedTool,
    onReset,
    onSetSelectedTool
},  {messages}) => {
    const getProcessById = processId => find(processes, ({id}) => id === processId);
    const handleOnChangeTool = (sel) => {
        onSetSelectedTool(sel?.value || "");
        if ((sel?.value) !== selectedTool) {
            onReset();
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
                    {/* add here new processes */}
                    {selectedTool === GPT_TOOL_BUFFER ? <Buffer process={getProcessById(GPT_TOOL_BUFFER)}/> : null}
                    {selectedTool === GPT_TOOL_INTERSECTION ? <Intersection process={getProcessById(GPT_TOOL_INTERSECTION)}/> : null}
                </Form>
            </div>
        </>
    );

};

MainComp.propTypes = {
    selectedTool: PropTypes.string,
    runningProcess: PropTypes.bool,
    onReset: PropTypes.func,
    onSetSelectedTool: PropTypes.func
};

MainComp.contextTypes = {
    messages: PropTypes.object
};

const MainCompConnected = connect(
    createSelector(
        [
            selectedToolSelector,
            runningProcessSelector
        ],
        (
            selectedTool,
            runningProcess
        ) => ({
            selectedTool,
            runningProcess
        })),
    {
        onReset: reset,
        onSetSelectedTool: setSelectedTool
    })(MainComp);

export default MainCompConnected;
