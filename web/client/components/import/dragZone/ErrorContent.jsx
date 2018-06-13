/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { Glyphicon, Alert } = require('react-bootstrap');
const DropText = require('./DropText');
const Message = require('../../I18N/Message');
const errorMessages = {
    "FILE_NOT_SUPPORTED": <Message msgId="mapImport.errors.fileNotSupported" />
};
const toErrorMessage = error =>
        error
            ? errorMessages[error.message]
            || errorMessages[error]
        || <span><Message msgId="mapImport.errors.unknownError" />:<Alert bsStyle="warning">{error.message}</Alert></span>
        : <Message msgId="mapImport.errors.unknownError" />;

module.exports = ({ error, ...props }) => (<div style={{
        margin: 'auto',
        maxWidth: 550
    }}>
        <div>
            <Glyphicon
                glyph="exclamation-mark"
                style={{
                    fontSize: 80
                }}/>
        </div>
        <h5>
            {toErrorMessage(error)}
        </h5>
        {/*<h4 className="text-danger" style={{backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: 12}}>
            !!Mockup Message -
            Here additional message eg. error on shapefile parsing
            - Mockup Message!!
            </h4>*/}
        <DropText {...props}/>
        </div>);
