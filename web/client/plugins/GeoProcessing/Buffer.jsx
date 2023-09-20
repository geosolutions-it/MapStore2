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

import InfoPopover from '../../components/widgets/widget/InfoPopover';
import SwitchButton from '../../components/misc/switch/SwitchButton';
import Message from '../../components/I18N/Message';
import FormControl from '../../components/misc/DebouncedFormControl';
import SwitchPanel from '../../components/misc/switch/SwitchPanel';
import SourceLayer from './SourceLayer';
import {
    runProcess,
    setBufferDistance,
    setBufferDistanceUom,
    setBufferQuadrantSegments,
    setBufferCapStyle,
    toggleHighlightLayers
} from '../../actions/geoProcessing';
import {
    areAllWPSAvailableForSourceLayerSelector,
    distanceSelector,
    distanceUomSelector,
    quadrantSegmentsSelector,
    capStyleSelector,
    isSourceLayerInvalidSelector,
    sourceLayerIdSelector,
    sourceFeatureSelector,
    runningProcessSelector,
    showHighlightLayersSelector
} from '../../selectors/geoProcessing';
import tooltip from '../../components/misc/enhancers/tooltip';
import { getMessageById } from '../../utils/LocaleUtils';

const Addon = tooltip(InputGroup.Addon);
const Buffer = ({
    areAllWPSAvailableForSourceLayer,
    distance,
    distanceUom,
    quadrantSegments,
    capStyle,
    isSourceLayerInvalid,
    process,
    runningProcess,
    showHighlightLayers,
    sourceLayerId,
    sourceFeature,
    onRunProcess,
    onSetBufferDistance,
    onSetBufferDistanceUom,
    onSetBufferQuadrantSegments,
    onSetBufferCapStyle,
    onToggleHighlightLayers
}, {messages}) => {
    const [showBufferAdvancedSettings, setShowBufferAdvancedSettings] =
    useState(false);
    const [showWarning, onShowWarning] = useState(false);

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
    const handleOnToggleHighlightLayers = () => {
        onToggleHighlightLayers();
    };

    // confirm modal
    const handleConfirmRunProcess = () => {
        if (showHighlightLayers) {
            onToggleHighlightLayers();
        }
        process.actions.runProcessConfirm({
            onShowWarning,
            onRunProcess
        });
    };
    const handleCloseWarningModal = () => {
        onShowWarning(false);
    };
    return (
        <>
            <SourceLayer/>
            <div className="gpt-distance">
                <div className="value">
                    <FormGroup>
                        <ControlLabel>
                            <Message msgId="GeoProcessing.distance" />
                        </ControlLabel>
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
                                noResultsText={<Message msgId="GeoProcessing.noMatchedLayer" />}
                                onChange={handleOnChangeBufferDistanceUom}
                                options={[
                                    {value: "m", label: <Message msgId="GeoProcessing.m" />},
                                    {value: "km", label: <Message msgId="GeoProcessing.km" />}
                                ]} />
                        </InputGroup>
                    </FormGroup>
                </div>
            </div>
            <SwitchPanel
                disabled={runningProcess}
                useToolbar
                title={<Message msgId="GeoProcessing.advancedSettings" />}
                expanded={showBufferAdvancedSettings}
                onSwitch={setShowBufferAdvancedSettings}>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="GeoProcessing.quadrantSegments" />
                    </ControlLabel>
                    <InputGroup>
                        <FormControl
                            disabled={runningProcess}
                            type="number"
                            value={quadrantSegments}
                            onChange={handleOnChangeBufferQuadrantSegments}
                        />
                        <Addon>
                            <InfoPopover
                                bsStyle={"info"}
                                placement="left"
                                text={getMessageById(messages, "GeoProcessing.quadrantSegmentsTooltip")}
                            />
                        </Addon>
                    </InputGroup>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="GeoProcessing.capStyle" />
                    </ControlLabel>
                    <InputGroup>
                        <Select
                            disabled={runningProcess}
                            clearable
                            value={capStyle}
                            noResultsText={<Message msgId="GeoProcessing.noMatchedStyle" />}
                            onChange={handleOnChangeBufferCapStyle}
                            options={[
                                {value: "Round", label: <Message msgId="GeoProcessing.round" />},
                                {value: "Flat", label: <Message msgId="GeoProcessing.flat" />},
                                {value: "Square", label: <Message msgId="GeoProcessing.square" />}
                            ]}
                        />
                        <Addon>
                            <InfoPopover
                                bsStyle={"info"}
                                placement="left"
                                text={getMessageById(messages, "GeoProcessing.capStyleTooltip")}
                            />
                        </Addon>
                    </InputGroup>
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
                areAllWPSAvailableForSourceLayer={areAllWPSAvailableForSourceLayer}
                runningProcess={runningProcess}
                isSourceLayerInvalid={isSourceLayerInvalid}
                sourceLayerId={sourceLayerId}
                distance={distance}
                showHighlightLayers={showHighlightLayers}
                sourceFeature={sourceFeature}
                onRunProcess={onRunProcess}
                onToggleHighlightLayers={onToggleHighlightLayers}
                onShowWarning={onShowWarning}
                messages={messages}
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

Buffer.propTypes = {
    areAllWPSAvailableForSourceLayer: PropTypes.bool,
    distance: PropTypes.number,
    distanceUom: PropTypes.string,
    quadrantSegments: PropTypes.number,
    capStyle: PropTypes.string,
    isSourceLayerInvalid: PropTypes.bool,
    sourceLayerId: PropTypes.string,
    sourceFeature: PropTypes.object,
    process: PropTypes.object,
    runningProcess: PropTypes.bool,
    showHighlightLayers: PropTypes.bool,
    onSetBufferDistance: PropTypes.func,
    onRunProcess: PropTypes.func,
    onSetBufferDistanceUom: PropTypes.func,
    onSetBufferQuadrantSegments: PropTypes.func,
    onSetBufferCapStyle: PropTypes.func,
    onToggleHighlightLayers: PropTypes.func
};

const BufferConnected = connect(
    createSelector(
        [
            areAllWPSAvailableForSourceLayerSelector,
            distanceSelector,
            distanceUomSelector,
            isSourceLayerInvalidSelector,
            sourceLayerIdSelector,
            sourceFeatureSelector,
            quadrantSegmentsSelector,
            capStyleSelector,
            runningProcessSelector,
            showHighlightLayersSelector
        ],
        (
            areAllWPSAvailableForSourceLayer,
            distance,
            distanceUom,
            isSourceLayerInvalid,
            sourceLayerId,
            sourceFeature,
            quadrantSegments,
            capStyle,
            runningProcess,
            showHighlightLayers
        ) => ({
            areAllWPSAvailableForSourceLayer,
            distance,
            distanceUom,
            isSourceLayerInvalid,
            sourceLayerId,
            sourceFeature,
            quadrantSegments,
            capStyle,
            runningProcess,
            showHighlightLayers
        })),
    {
        onSetBufferDistance: setBufferDistance,
        onSetBufferDistanceUom: setBufferDistanceUom,
        onSetBufferQuadrantSegments: setBufferQuadrantSegments,
        onSetBufferCapStyle: setBufferCapStyle,
        onToggleHighlightLayers: toggleHighlightLayers,
        onRunProcess: runProcess
    })(Buffer);

Buffer.contextTypes = {
    messages: PropTypes.object
};

export default BufferConnected;
