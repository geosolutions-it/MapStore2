/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { compose, withState, lifecycle, withHandlers } from 'recompose';
import { FormControl, FormGroup, ControlLabel, InputGroup, Glyphicon, Tooltip } from 'react-bootstrap';
import Spinner from 'react-spinkit';

import Message from '../../../I18N/Message';
import OverlayTrigger from '../../../misc/OverlayTrigger';

const LayerNameEditField = ({
    enableOverlayTrigger,
    element = {},
    enableLayerNameEditFeedback = false,
    layerName = '',
    editingLayerName = false,
    layerError,
    waitingForLayerLoading = false,
    waitingForLayerLoad = false,
    setLayerName = () => {},
    setWaitingForLayerLoading = () => {},
    setEditingLayerName = () => {},
    onUpdateEntry = () => {}
}) => {
    const editButton = (
        <InputGroup.Addon className="btn" onClick={() => {
            if (editingLayerName) {
                if (layerName !== element.name) {
                    onUpdateEntry('name', {target: {value: layerName}});
                    if (enableLayerNameEditFeedback) {
                        setWaitingForLayerLoading(true);
                    } else {
                        setEditingLayerName(false);
                    }
                } else {
                    setEditingLayerName(false);
                }
            } else {
                setEditingLayerName(true);
            }
        }}>
            {waitingForLayerLoading || waitingForLayerLoad ?
                <Spinner noFadeIn style={{width: '18px', height: '18px'}} spinnerName="circle"/> :
                <Glyphicon glyph={editingLayerName ? "ok" : "pencil"}/>
            }
        </InputGroup.Addon>
    );

    const overlayTriggerNameEdit = button => (
        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-layer-name-edit">
            <Message msgId={`layerProperties.tooltip.${editingLayerName ? 'confirm' : 'edit'}LayerName`}/>
        </Tooltip>}>
            {button}
        </OverlayTrigger>
    );

    return (
        <FormGroup validationState={layerError && !waitingForLayerLoad && !waitingForLayerLoading ? 'error' : null}>
            <ControlLabel><Message msgId="layerProperties.name" /></ControlLabel>
            <InputGroup>
                <FormControl
                    value={layerName}
                    key="name"
                    type="text"
                    disabled={!editingLayerName}
                    onChange={evt => setLayerName(evt.target.value)} />
                {enableOverlayTrigger ? overlayTriggerNameEdit(editButton) : editButton}
            </InputGroup>
        </FormGroup>
    );
};

export default compose(
    withState('enableOverlayTrigger', 'setEnableOverlayTrigger', true),
    withState('overlayTriggerDelayID', 'setOverlayTriggerDelayID'),
    withState('layerName', 'setLayerName', ''),
    withState('editingLayerName', 'setEditingLayerName', false),
    withState('waitingForLayerLoading', 'setWaitingForLayerLoading', false),
    withState('waitingForLayerLoad', 'setWaitingForLayerLoad', false),
    withState('layerError', 'setLayerError'),
    withHandlers({
        setEditingLayerName: ({ editingLayerName = false, overlayTriggerDelayID, setEditingLayerName = () => {}, setOverlayTriggerDelayID = () => {}, setEnableOverlayTrigger = () => {} }) => editing => {
            if (editingLayerName !== editing) {
                if (overlayTriggerDelayID) {
                    clearTimeout(overlayTriggerDelayID);
                }
                setEnableOverlayTrigger(false);
                setOverlayTriggerDelayID(setTimeout(() => {
                    setEnableOverlayTrigger(true);
                }, 250));
            }
            setEditingLayerName(editing);
        }
    }),
    lifecycle({
        componentDidMount() {
            this.props.setLayerName(this.props.element?.name);
        },
        componentDidUpdate() {
            const {
                element = {},
                waitingForLayerLoading,
                waitingForLayerLoad,
                setWaitingForLayerLoad = () => {},
                setWaitingForLayerLoading = () => {},
                setEditingLayerName = () => {},
                setLayerError = () => {}
            } = this.props;

            if (waitingForLayerLoading && element.loading) {
                setWaitingForLayerLoading(false);
                setWaitingForLayerLoad(true);
            } else if (waitingForLayerLoad && !element.loading) {
                setWaitingForLayerLoad(false);
                setLayerError(element.loadingError);
                setEditingLayerName(!!element.loadingError);
            }
        }
    })
)(LayerNameEditField);
