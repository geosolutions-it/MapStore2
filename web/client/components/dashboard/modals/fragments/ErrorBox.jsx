/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const errorMessages = { "FORMAT": "map.errorFormat", "SIZE": "map.errorSize" };

const Message = require('../../../I18N/Message');
const { Row } = require('react-bootstrap');
module.exports = ({errors = []}) => {
    return (<Row>
        {errors.length > 0 ?
            <div className="dropzone-errorBox alert-danger">
                <p><Message msgId="map.error" /></p>
                {errors.map((error) => <div key={"error" + error} className={"error" + error}><Message msgId={errorMessages[error]} /></div>)}
            </div>
        : null}
        </Row>);
};
