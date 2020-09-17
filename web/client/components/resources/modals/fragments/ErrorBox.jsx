/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const DEFAULT_MESSAGES = {
    "FORMAT": "map.errorFormat",
    "SIZE": "map.errorSize",
    409: "dashboard.errors.resourceAlreadyExists",
    403: "dashboard.errors.forbidden",
    405: "dashboard.errors.forbidden405"
};

const Message = require('../../../I18N/Message');
const { Row } = require('react-bootstrap');
const errorString = err => typeof err === 'string' ? err : (err.statusText || err.message);
const errorCode = err => typeof err === 'string' ? err : err.status;
const errorData = err => typeof err === 'string' ? undefined : err;
const errorMessage = error => {
    const code = errorCode(error);
    return <Message msgId={DEFAULT_MESSAGES[code] || errorString(error)} msgParams={errorData(error)} />;
};

module.exports = ({ errors = []}) => {
    return (<Row>
        {errors.length > 0 ?
            <div className="dropzone-errorBox alert-danger">
                {errors.map(error =>
                    (<div key={"error" + errorString(error)} className={"error" + errorString(error)}>
                        {errorMessage(error)}
                    </div>))}
            </div>
            : null}
    </Row>);
};
