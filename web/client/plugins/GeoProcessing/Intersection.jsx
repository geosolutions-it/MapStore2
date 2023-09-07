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

import SwitchButton from '../../components/misc/switch/SwitchButton';
import Message from '../../components/I18N/Message';
import FormControl from '../../components/misc/DebouncedFormControl';
import SwitchPanel from '../../components/misc/switch/SwitchPanel';
import IntersectionLayer from './IntersectionLayer';
import SourceLayer from './SourceLayer';
import {
    runProcess,
    setIntersectionFirstAttribute,
    setIntersectionSecondAttribute,
    setIntersectionMode,
    setIntersectionPercentagesEnabled,
    setIntersectionAreasEnabled,
    toggleHighlightLayers
} from '../../actions/geoProcessing';
import {
    areAllWPSAvailableForSourceLayerSelector,
    areAllWPSAvailableForIntersectionLayerSelector,
    areasEnabledSelector,
    firstAttributeToRetainSelector,
    intersectionModeSelector,
    isIntersectionLayerInvalidSelector,
    isIntersectionEnabledSelector,
    isSourceLayerInvalidSelector,
    sourceLayerIdSelector,
    intersectionLayerIdSelector,
    percentagesEnabledSelector,
    runningProcessSelector,
    secondAttributeToRetainSelector,
    showHighlightLayersSelector,
    sourceFeatureSelector,
    intersectionFeatureSelector
} from '../../selectors/geoProcessing';

const Intersection = ({
    areAllWPSAvailableForIntersectionLayer,
    areAllWPSAvailableForSourceLayer,
    areasEnabled,
    firstAttributeToRetain,
    intersectionFeature,
    intersectionLayerId,
    intersectionMode,
    isIntersectionEnabled,
    isIntersectionLayerInvalid,
    isSourceLayerInvalid,
    percentagesEnabled,
    process,
    runningProcess,
    secondAttributeToRetain,
    showHighlightLayers,
    sourceFeature,
    sourceLayerId,
    onSetIntersectionFirstAttribute,
    onSetIntersectionSecondAttribute,
    onSetIntersectionMode,
    onSetIntersectionPercentagesEnabled,
    onSetIntersectionAreasEnabled,
    onToggleHighlightLayers,
    onRunProcess
}) => {
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
    const [showWarning, onShowWarning] = useState(false);

    const handleOnChangeFirstAttributeToRetain = (val) => {
        onSetIntersectionFirstAttribute(val);
    };
    const handleOnChangeSecondAttributeToRetain = (val) => {
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
    const handleOnToggleHighlightLayers = () => {
        onToggleHighlightLayers();
    };
    const handleConfirmRunProcess = () => {
        if (showHighlightLayers) {
            onToggleHighlightLayers();
        }
        process.run();
        onShowWarning(false);
    };
    const handleCloseWarningModal = () => {
        onShowWarning(false);
    };
    return (
        <>

            <SourceLayer/>
            <IntersectionLayer/>
            <SwitchPanel
                disabled={runningProcess}
                useToolbar
                title={<Message msgId="GeoProcessing.advancedSettings" />}
                expanded={showAdvancedSettings}
                onSwitch={setShowAdvancedSettings}>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="GeoProcessing.firstAttributeToRetain" />
                    </ControlLabel>
                </FormGroup>
                <FormGroup>
                    <InputGroup>
                        <FormControl
                            disabled={runningProcess}
                            type="text"
                            value={firstAttributeToRetain}
                            onChange={handleOnChangeFirstAttributeToRetain}
                        />
                    </InputGroup>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="GeoProcessing.secondAttributeToRetain" />
                    </ControlLabel>
                </FormGroup>
                <FormGroup>
                    <InputGroup>
                        <FormControl
                            disabled={runningProcess}
                            type="text"
                            value={secondAttributeToRetain}
                            onChange={handleOnChangeSecondAttributeToRetain}
                        />
                    </InputGroup>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="GeoProcessing.intersectionMode" />
                    </ControlLabel>
                </FormGroup>
                <FormGroup>
                    <Select
                        disabled={runningProcess}
                        clearable
                        value={intersectionMode}
                        noResultsText={<Message msgId="GeoProcessing.noMatchedMode" />}
                        onChange={handleOnChangeIntersectionMode}
                        options={[
                            {value: "INTERSECTION", label: <Message msgId="GeoProcessing.INTERSECTION" />},
                            {value: "FIRST", label: <Message msgId="GeoProcessing.FIRST" />},
                            {value: "SECOND", label: <Message msgId="GeoProcessing.SECOND" />}
                        ]}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="GeoProcessing.percentagesEnabled" />
                    </ControlLabel>
                </FormGroup>
                <FormGroup>
                    <Select
                        disabled={runningProcess}
                        clearable={false}
                        value={percentagesEnabled}
                        onChange={handleOnChangePercentagesEnabled}
                        options={[
                            {value: "true", label: <Message msgId="GeoProcessing.true" />},
                            {value: "false", label: <Message msgId="GeoProcessing.false" />}
                        ]}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="GeoProcessing.areasEnabled" />
                    </ControlLabel>
                </FormGroup>
                <FormGroup>
                    <Select
                        disabled={runningProcess}
                        clearable={false}
                        value={areasEnabled}
                        onChange={handleOnChangeAreasEnabled}
                        options={[
                            {value: "true", label: <Message msgId="GeoProcessing.true" />},
                            {value: "false", label: <Message msgId="GeoProcessing.false" />}
                        ]}
                    />
                </FormGroup>
            </SwitchPanel>
            <FormGroup className="highlight">
                <SwitchButton
                    disabled={runningProcess}
                    checked={showHighlightLayers}
                    onClick={handleOnToggleHighlightLayers}
                />
                <ControlLabel>
                    <Message msgId="GeoProcessing.highlight" />
                </ControlLabel>
            </FormGroup>
            <process.RunComponent
                areAllWPSAvailableForIntersectionLayer={areAllWPSAvailableForIntersectionLayer}
                areAllWPSAvailableForSourceLayer={areAllWPSAvailableForSourceLayer}
                intersectionFeature={intersectionFeature}
                intersectionLayerId={intersectionLayerId}
                isIntersectionLayerInvalid={isIntersectionLayerInvalid}
                isSourceLayerInvalid={isSourceLayerInvalid}
                onRunProcess={onRunProcess}
                onToggleHighlightLayers={onToggleHighlightLayers}
                onShowWarning={onShowWarning}
                runningProcess={runningProcess}
                showHighlightLayers={showHighlightLayers}
                sourceFeature={sourceFeature}
                sourceLayerId={sourceLayerId}
                isIntersectionEnabled={isIntersectionEnabled}
                {...process.actions}
            />
            <process.ConfirmModal
                showWarning={showWarning}
                handleCloseWarningModal={handleCloseWarningModal}
                handleConfirmRunProcess={handleConfirmRunProcess}
            />
        </>
    );

};

Intersection.propTypes = {
    areasEnabled: PropTypes.bool,
    firstAttributeToRetain: PropTypes.string,
    intersectionMode: PropTypes.string,
    isIntersectionLayerInvalid: PropTypes.bool,
    isSourceLayerInvalid: PropTypes.bool,
    isIntersectionEnabled: PropTypes.bool,
    percentagesEnabled: PropTypes.bool,
    runningProcess: PropTypes.bool,
    process: PropTypes.object,
    sourceLayerId: PropTypes.string,
    intersectionLayerId: PropTypes.string,
    secondAttributeToRetain: PropTypes.string,
    showHighlightLayers: PropTypes.bool,
    areAllWPSAvailableForSourceLayer: PropTypes.bool,
    areAllWPSAvailableForIntersectionLayer: PropTypes.bool,
    sourceFeature: PropTypes.object,
    intersectionFeature: PropTypes.object,

    onSetIntersectionFirstAttribute: PropTypes.func,
    onSetIntersectionSecondAttribute: PropTypes.func,
    onSetIntersectionMode: PropTypes.func,
    onSetIntersectionPercentagesEnabled: PropTypes.func,
    onSetIntersectionAreasEnabled: PropTypes.func,
    onToggleHighlightLayers: PropTypes.func,
    onRunProcess: PropTypes.func
};

Intersection.contextTypes = {
    messages: PropTypes.object
};
// [ ] add toc layer list in combobox, on selection make the check
const IntersectionConnected = connect(
    createSelector(
        [
            areAllWPSAvailableForSourceLayerSelector,
            areAllWPSAvailableForIntersectionLayerSelector,
            runningProcessSelector,
            firstAttributeToRetainSelector,
            secondAttributeToRetainSelector,
            intersectionModeSelector,
            isIntersectionEnabledSelector,
            sourceLayerIdSelector,
            intersectionLayerIdSelector,
            isIntersectionLayerInvalidSelector,
            isSourceLayerInvalidSelector,
            percentagesEnabledSelector,
            areasEnabledSelector,
            showHighlightLayersSelector,
            sourceFeatureSelector,
            intersectionFeatureSelector
        ],
        (
            areAllWPSAvailableForSourceLayer,
            areAllWPSAvailableForIntersectionLayer,
            runningProcess,
            firstAttributeToRetain,
            secondAttributeToRetain,
            intersectionMode,
            isIntersectionEnabled,
            sourceLayerId,
            intersectionLayerId,
            isIntersectionLayerInvalid,
            isSourceLayerInvalid,
            percentagesEnabled,
            areasEnabled,
            showHighlightLayers,
            sourceFeature,
            intersectionFeature
        ) => ({
            areAllWPSAvailableForSourceLayer,
            areAllWPSAvailableForIntersectionLayer,
            runningProcess,
            firstAttributeToRetain,
            secondAttributeToRetain,
            intersectionMode,
            isIntersectionEnabled,
            sourceLayerId,
            intersectionLayerId,
            isIntersectionLayerInvalid,
            isSourceLayerInvalid,
            percentagesEnabled,
            areasEnabled,
            showHighlightLayers,
            sourceFeature,
            intersectionFeature
        })),
    {
        onSetIntersectionFirstAttribute: setIntersectionFirstAttribute,
        onSetIntersectionSecondAttribute: setIntersectionSecondAttribute,
        onSetIntersectionMode: setIntersectionMode,
        onSetIntersectionPercentagesEnabled: setIntersectionPercentagesEnabled,
        onSetIntersectionAreasEnabled: setIntersectionAreasEnabled,
        onToggleHighlightLayers: toggleHighlightLayers,
        onRunProcess: runProcess
    })(Intersection);

export default IntersectionConnected;
