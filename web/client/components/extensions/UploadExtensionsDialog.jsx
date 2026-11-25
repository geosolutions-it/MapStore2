/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon, Tooltip, OverlayTrigger, Alert } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import Spinner from 'react-spinkit';

import Button from '../misc/Button';
import Modal from '../misc/Modal';
import Message from '../I18N/Message';

const PluginError = ({ error }) => (
    <OverlayTrigger placement="top" overlay={<Tooltip id="upload-error">{error.message}</Tooltip>}>
        <Glyphicon glyph="warning-sign"/>
    </OverlayTrigger>
);

const PluginToUpload = ({ plugin, onRemove }) => (
    <div className="uploading-file">
        {plugin.error ? <Glyphicon glyph="remove" /> : <Glyphicon glyph="ok"/>}
        <span className="plugin-name">{plugin.name}</span>
        <span className="upload-remove" onClick={onRemove}><Glyphicon glyph="trash" /></span>
        <span className="upload-error">{plugin.error && <PluginError error={plugin.error} />}</span>
        {plugin.warning ? <div className="upload-warning">{plugin.warning}</div> : null}
    </div>
);

/**
 * Dialog to upload the zip files of extensions.
 * @prop {object[]} toUpload checked files `[{ name, file, error, warning }]`, `warning` is shown under the file
 * @prop {function} onDrop called with the dropped files, to check them
 * @prop {function} onRemove called with the index of a file to remove from the list
 * @prop {function} onInstall called to install the files without errors
 * @prop {function} onClose called to close the dialog
 * @prop {boolean} isUploading shows a spinner while the files are installed
 * @prop {object} uploadStatus result of the last upload `{ result: "ok"|"error", error }`
 */
function UploadExtensionsDialog({ toUpload, onDrop, onRemove, onInstall, onClose, isUploading, uploadStatus }) {
    return (<Modal show>
        <Modal.Header key="dialogHeader">
            <Modal.Title><Message msgId="contextCreator.configurePlugins.uploadTitle" /></Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {isUploading ? <Spinner/> : <div className="configure-plugins-step-upload">
                <Dropzone
                    key="dropzone"
                    rejectClassName="dropzone-danger"
                    className="dropzone"
                    activeClassName="active"
                    onDrop={onDrop}>
                    <div style={{ display: "flex", alignItems: "center", width: "100%", height: "100%", justifyContent: "center" }}>
                        <span style={{ textAlign: "center" }}>
                            <Message msgId="contextCreator.configurePlugins.uploadLabel"/>
                        </span>
                    </div>
                </Dropzone>
                <div className="uploads-list">
                    {toUpload.map((plugin, idx) => <PluginToUpload key={plugin.name} plugin={plugin} onRemove={() => onRemove(idx)} />)}
                </div>
                {uploadStatus?.result === "error" && <Alert bsStyle="danger"><Message msgId="contextCreator.configurePlugins.uploadError"/>{uploadStatus.error.message}</Alert>}
                {uploadStatus?.result === "ok" && <Alert bsStyle="info"><Message msgId="contextCreator.configurePlugins.uploadOk"/></Alert>}
            </div>}
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={onClose}><Message msgId="contextCreator.configurePlugins.cancelUpload"/></Button>
            <Button bsStyle="primary" onClick={onInstall} disabled={toUpload.filter(f => !f.error).length === 0}><Message msgId="contextCreator.configurePlugins.install"/></Button>
        </Modal.Footer>
    </Modal>);
}

UploadExtensionsDialog.propTypes = {
    toUpload: PropTypes.array,
    onDrop: PropTypes.func,
    onRemove: PropTypes.func,
    onInstall: PropTypes.func,
    onClose: PropTypes.func,
    isUploading: PropTypes.bool,
    uploadStatus: PropTypes.object
};

UploadExtensionsDialog.defaultProps = {
    toUpload: [],
    onDrop: () => {},
    onRemove: () => {},
    onInstall: () => {},
    onClose: () => {}
};

export default UploadExtensionsDialog;
