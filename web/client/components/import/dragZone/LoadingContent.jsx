/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const Loader = require('../../misc/Loader');
const Message = require('../../I18N/Message');

module.exports = () => (<div style={{
    margin: 'auto',
    maxWidth: 550
}}>
    <Loader
        size={80}
        color="#ffffff"
        style={{
            margin: 'auto'
        }}/>
    <h4>
        <Message msgId="loading" />
    </h4>
</div>);
