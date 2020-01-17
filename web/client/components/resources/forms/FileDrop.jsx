/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import DropZone from 'react-dropzone';
import {Glyphicon} from 'react-bootstrap';

import Message from '../../I18N/Message';

export default ({
    acceptedFileName,
    label,
    status = "clear", // "accepted" or "rejected" or "clear"
    errorMessage,
    clearMessage,
    onDrop = () => {},
    onClear = () => {},
    onError = () => {}
}) => (
    <div className="dropzone-filedrop-container">
        <label className="control-label"><Message msgId={label}/></label>
        <DropZone multiple={false} className={`dropzone alert alert-info${status === 'accepted' ? ' filedrop-accepted' : ''}`} rejectClassName="alert-danger"
            onDrop={(...args) => onDrop(onError, ...args)}>
            {status === 'accepted' && <div className="dropzone-filedrop-remove" onClick={(e) => {e.stopPropagation(); onClear();}}>
                <Glyphicon glyph="remove"/>
            </div>}
            <div className="dropzone-content">
                <Glyphicon glyph={status === 'clear' ? 'upload' : status === 'accepted' ? 'ok-circle' : 'remove-circle'}/>
                {status === 'accepted' ? <span>{acceptedFileName}</span> : null}
                {status === 'rejected' ? errorMessage : null}
                {status === 'clear' ? clearMessage : null}
            </div>
        </DropZone>
    </div>
);
