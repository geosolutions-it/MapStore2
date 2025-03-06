/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


import React, { useEffect, useState } from 'react';
import { Nav, NavItem, Glyphicon, ButtonGroup, Alert, ControlLabel } from "react-bootstrap";
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import isFunction from 'lodash/isFunction';
import capitalize from 'lodash/capitalize';
import { ANNOTATIONS } from '../utils/AnnotationsUtils';
import { registerRowViewer } from '../../../utils/MapInfoUtils';
import MSButton from '../../../components/misc/Button';
import tooltip from '../../../components/misc/enhancers/tooltip';
import { updateNode } from '../../../actions/layers';
import {
    cancelCloseAnnotations,
    confirmCloseAnnotations,
    download,
    editAnnotation,
    removeAnnotation
} from '../actions/annotations';
import { getSelectedAnnotationLayer } from '../selectors/annotations';
import { createControlEnabledSelector } from '../../../selectors/controls';
import { mapLayoutValuesSelector } from '../../../selectors/maplayout';
import { setControlProperty } from '../../../actions/controls';
import Message from '../../../components/I18N/Message';
import AnnotationsFields from '../components/AnnotationsFields';
import { DEFAULT_TARGET_ID } from '../constants';
import ConfirmDialog from '../../../components/layout/ConfirmDialog';
import Portal from '../../../components/misc/Portal';
import { mapSelector } from '../../../selectors/map';
import VisibilityLimitsForm from '../../../components/TOC/fragments/settings/VisibilityLimitsForm';

const Button = tooltip(MSButton);

function AnnotationsInfoViewer({
    fields,
    onEdit = () => {},
    onRemove = () => {},
    onDownload = () => {},
    ...layer
}) {
    const [removeModal, setRemoveModal] = useState(false);
    return (
        <div>
            <div>
                <ButtonGroup>
                    <Button
                        className="square-button-md"
                        bsStyle="primary"
                        tooltipId="annotations.edit"
                        onClick={() => onEdit(layer.id)}
                    >
                        <Glyphicon glyph="pencil"/>
                    </Button>
                    <Button
                        className="square-button-md"
                        bsStyle="primary"
                        tooltipId="annotations.remove"
                        onClick={() => setRemoveModal(true)}
                    >
                        <Glyphicon glyph="trash"/>
                    </Button>
                    <Button
                        className="square-button-md"
                        bsStyle="primary"
                        tooltipId="annotations.downloadcurrenttooltip"
                        onClick={() => onDownload([layer])}
                    >
                        <Glyphicon glyph="download"/>
                    </Button>
                </ButtonGroup>
            </div>
            <AnnotationsFields
                preview
                properties={{
                    title: layer?.title,
                    description: layer?.description,
                    ...layer?.options
                }}
                fields={fields}
            />
            <Portal>
                <ConfirmDialog
                    show={removeModal}
                    onCancel={() => setRemoveModal(false)}
                    onConfirm={() => {
                        onRemove(layer.id);
                        setRemoveModal(false);
                    }}
                    variant="danger"
                    preventHide
                    titleId={"annotations.undoDeleteFeature"}
                    confirmId={`annotations.confirm`}
                    cancelId={`annotations.cancel`}>
                </ConfirmDialog>
            </Portal>
        </div>
    );
}

const ConnectedAnnotationsInfoViewer = connect(
    () => ({}),
    {
        onRemove: removeAnnotation,
        onDownload: download,
        onEdit: editAnnotation
    }
)(AnnotationsInfoViewer);

function AnnotationsPanel({
    targetId = DEFAULT_TARGET_ID,
    selected,
    style,
    enabled,
    onReady = () => {},
    onClose = () => {},
    onChange = () => {},
    onDownload = () => {},
    fields = [
        {
            name: 'title',
            type: 'text',
            validator: (val) => val,
            validateError: 'annotations.mandatory',
            showLabel: true,
            editable: true
        },
        {
            name: 'description',
            type: 'html',
            showLabel: true,
            editable: true
        }
    ],
    closeId,
    onCancel = () => {},
    activeClickEventListener,
    projection,
    resolutions,
    zoom
}) {
    const properties = {
        title: selected?.title,
        description: selected?.description,
        ...selected?.options
    };
    const [tab, setTab] = useState('properties');
    const [closeModal, setCloseModal] = useState(false);
    function validateFields() {
        return !fields.find((filed) => (isFunction(filed?.validator) ? !filed.validator(properties[filed.name]) : false));
    }
    function validateFeatures() {
        return !selected?.features?.length
            ? false
            : !selected.invalidFeatures;
    }
    useEffect(() => {
        registerRowViewer(ANNOTATIONS, (props) => <ConnectedAnnotationsInfoViewer  {...props} fields={fields} />);
        return () => {
            registerRowViewer(ANNOTATIONS, undefined);
        };
    }, []);

    useEffect(() => {
        setCloseModal(false);
        onReady(enabled);
        return () => {
            onReady(!enabled);
        };
    }, [enabled]);

    function handleClosePanel(event) {
        event.stopPropagation();
        if (validateFields() && validateFeatures()) {
            return onClose(selected);
        }
        return setCloseModal(true);
    }

    function handleCancelClose() {
        onCancel();
        setCloseModal(false);
    }
    function handleConfirmClose() {
        onClose(selected);
        setCloseModal(false);
    }

    useEffect(() => {
        if (closeId) {
            handleClosePanel();
        }
    }, [closeId]);

    if (!selected) {
        return null;
    }

    return (
        <div
            className="ms-annotations-panel"
            style={style}
        >
            <div className="ms-annotations-panel-header">
                <Button
                    onClick={(event) => handleClosePanel(event)}
                    className="square-button no-border"
                >
                    <Glyphicon glyph="1-close"/>
                </Button>
                <div className="ms-annotations-title">
                    <Message msgId="annotations.title" />
                </div>
                <div className="square-button text-primary">
                    <Glyphicon glyph="comment"/>
                </div>
            </div>
            <Nav bsStyle="tabs" activeKey={tab} className="ms-annotations-panel-nav">
                <NavItem
                    key="properties"
                    eventKey="properties"
                    onClick={() => setTab('properties')}>
                    <Message msgId="annotations.properties"/>
                    {' '}
                    <Glyphicon glyph={validateFields() ? 'ok-sign text-success' : 'exclamation-mark text-danger'}/>
                </NavItem>
                <NavItem
                    key="geometries"
                    eventKey="geometries"
                    onClick={() => setTab('geometries')}>
                    <Message msgId="annotations.geometries"/>
                    {' '}
                    <Glyphicon glyph={validateFeatures() ? 'ok-sign text-success' : 'exclamation-mark text-danger'}/>
                </NavItem>
                <NavItem
                    key="settings"
                    eventKey="settings"
                    onClick={() => setTab('settings')}>
                    <Message msgId="settings"/>
                </NavItem>
                <Button
                    className="square-button-md"
                    bsStyle="primary"
                    tooltipId="annotations.downloadcurrenttooltip"
                    disabled={!(validateFields() && validateFeatures())}
                    onClick={() => onDownload([selected])}
                >
                    <Glyphicon glyph="download"/>
                </Button>
            </Nav>
            <div className="ms-annotations-panel-body">
                <div className="ms-annotations-panel-content" style={tab === 'properties' ? {  } : { display: 'none' }}>
                    <AnnotationsFields
                        fields={fields}
                        properties={properties}
                        onChange={(newOptions) => {
                            const { title, description, ...options } = newOptions;
                            onChange(selected.id, 'layers', {
                                ...(title !== undefined && { title }),
                                ...(description !== undefined && { description }),
                                options: {
                                    ...selected.options,
                                    ...options
                                }
                            });
                        }}
                    />
                </div>
                <div id={targetId} style={tab === 'geometries' ? {} : { display: 'none' }} >
                </div>
                <div className="ms-annotations-panel-content" style={tab === 'settings' ? {  } : { display: 'none' }}>
                    <VisibilityLimitsForm
                        title={<ControlLabel><Message msgId="layerProperties.visibilityLimits.title"/></ControlLabel>}
                        layer={selected}
                        onChange={(options) => onChange(selected.id, 'layers', options)}
                        projection={projection}
                        resolutions={resolutions}
                        zoom={zoom}
                    />
                </div>
            </div>
            {activeClickEventListener && <Alert bsStyle="warning">
                <Message msgId="annotations.deactivatedMapInteraction" msgParams={{ pluginName: capitalize(activeClickEventListener) }}/>
            </Alert>}
            <Portal>
                <ConfirmDialog
                    show={closeModal}
                    onCancel={() => handleCancelClose()}
                    onConfirm={() => handleConfirmClose()}
                    variant="danger"
                    preventHide
                    titleId={"annotations.undo"}
                    confirmId={`annotations.confirm`}
                    cancelId={`annotations.cancel`}>
                </ConfirmDialog>
            </Portal>
        </div>
    );
}

const ConnectedAnnotationsPanel = connect(
    createSelector([
        createControlEnabledSelector(ANNOTATIONS),
        state => mapLayoutValuesSelector(state, { height: true }),
        getSelectedAnnotationLayer,
        mapSelector
    ],
    (enabled, style, selected, map) => ({
        enabled,
        style,
        selected: enabled ? selected : null,
        activeClickEventListener: map?.eventListeners?.click?.[0],
        projection: map?.projection,
        zoom: map?.zoom,
        resolutions: map?.resolutions
    })),
    {
        onClose: confirmCloseAnnotations,
        onCancel: cancelCloseAnnotations,
        onReady: setControlProperty.bind(null, ANNOTATIONS, 'ready'),
        onChange: updateNode,
        onDownload: download
    }
)(AnnotationsPanel);

export default ConnectedAnnotationsPanel;
