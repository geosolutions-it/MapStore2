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
    FormGroup,
    InputGroup,
    ControlLabel
} from 'react-bootstrap';
import { connect } from 'react-redux';
import Select from 'react-select';
import { createSelector } from 'reselect';

import Message from '../../components/I18N/Message';
import FormControl from '../../components/misc/DebouncedFormControl';
import SwitchPanel from '../../components/misc/switch/SwitchPanel';
import SourceLayer from './SourceLayer';
import {
    runBufferProcess,
    setBufferDistance,
    setBufferDistanceUom,
    setBufferQuadrantSegments,
    setBufferCapStyle
} from '../../actions/geoProcessingTools';
import {
    distanceSelector,
    distanceUomSelector,
    quadrantSegmentsSelector,
    capStyleSelector,
    runningProcessSelector
} from '../../selectors/geoProcessingTools';

const Buffer = ({
    distance,
    distanceUom,
    quadrantSegments,
    capStyle,
    runningProcess,
    onSetBufferDistance,
    onSetBufferDistanceUom,
    onSetBufferQuadrantSegments,
    onSetBufferCapStyle
}) => {
    const [showBufferAdvancedSettings, setShowBufferAdvancedSettings] = useState(false);

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
            <SourceLayer/>
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
                                disabled={runningProcess}
                                type="number"
                                value={distance}
                                onChange={handleOnChangeBufferDistance}
                            />
                            <Select
                                clearable={false}
                                disabled={runningProcess}
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
                disabled={runningProcess}
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
                            disabled={runningProcess}
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
                        disabled={runningProcess}
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
    distance: PropTypes.number,
    distanceUom: PropTypes.string,
    quadrantSegments: PropTypes.number,
    capStyle: PropTypes.string,
    runningProcess: PropTypes.bool,
    onSetBufferDistance: PropTypes.func,
    onSetBufferDistanceUom: PropTypes.func,
    onSetBufferQuadrantSegments: PropTypes.func,
    onSetBufferCapStyle: PropTypes.func
};

const BufferConnected = connect(
    createSelector(
        [
            distanceSelector,
            distanceUomSelector,
            quadrantSegmentsSelector,
            capStyleSelector,
            runningProcessSelector
        ],
        (
            distance,
            distanceUom,
            quadrantSegments,
            capStyle,
            runningProcess
        ) => ({
            distance,
            distanceUom,
            quadrantSegments,
            capStyle,
            runningProcess
        })),
    {
        onRunBufferProcess: runBufferProcess,
        onSetBufferDistance: setBufferDistance,
        onSetBufferDistanceUom: setBufferDistanceUom,
        onSetBufferQuadrantSegments: setBufferQuadrantSegments,
        onSetBufferCapStyle: setBufferCapStyle
    })(Buffer);

export default BufferConnected;
