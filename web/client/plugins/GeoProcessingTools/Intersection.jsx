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
import IntersectionLayer from './IntersectionLayer';
import SourceLayer from './SourceLayer';
import {
    setIntersectionFirstAttribute,
    setIntersectionSecondAttribute,
    setIntersectionMode,
    setIntersectionPercentagesEnabled,
    setIntersectionAreasEnabled
} from '../../actions/geoProcessingTools';
import {
    runningProcessSelector,
    firstAttributesToRetainSelector,
    secondAttributesToRetainSelector,
    intersectionModeSelector,
    percentagesEnabledSelector,
    areasEnabledSelector
} from '../../selectors/geoProcessingTools';

const Intersection = ({
    firstAttributesToRetain,
    secondAttributesToRetain,
    intersectionMode,
    percentagesEnabled,
    areasEnabled,
    runningProcess,
    onSetIntersectionFirstAttribute,
    onSetIntersectionSecondAttribute,
    onSetIntersectionMode,
    onSetIntersectionPercentagesEnabled,
    onSetIntersectionAreasEnabled
}) => {
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

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

            <SourceLayer/>
            <IntersectionLayer/>
            <SwitchPanel
                disabled={runningProcess}
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
                            disabled={runningProcess}
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
                            disabled={runningProcess}
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
                        disabled={runningProcess}
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
                        disabled={runningProcess}
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
                        disabled={runningProcess}
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
    areasEnabled: PropTypes.bool,
    firstAttributesToRetain: PropTypes.string,
    intersectionMode: PropTypes.string,
    percentagesEnabled: PropTypes.bool,
    runningProcess: PropTypes.bool,
    secondAttributesToRetain: PropTypes.string,

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
            runningProcessSelector,
            firstAttributesToRetainSelector,
            secondAttributesToRetainSelector,
            intersectionModeSelector,
            percentagesEnabledSelector,
            areasEnabledSelector
        ],
        (
            runningProcess,
            firstAttributesToRetain,
            secondAttributesToRetain,
            intersectionMode,
            percentagesEnabled,
            areasEnabled
        ) => ({
            runningProcess,
            firstAttributesToRetain,
            secondAttributesToRetain,
            intersectionMode,
            percentagesEnabled,
            areasEnabled
        })),
    {
        onSetIntersectionFirstAttribute: setIntersectionFirstAttribute,
        onSetIntersectionSecondAttribute: setIntersectionSecondAttribute,
        onSetIntersectionMode: setIntersectionMode,
        onSetIntersectionPercentagesEnabled: setIntersectionPercentagesEnabled,
        onSetIntersectionAreasEnabled: setIntersectionAreasEnabled
    })(Intersection);

export default IntersectionConnected;
