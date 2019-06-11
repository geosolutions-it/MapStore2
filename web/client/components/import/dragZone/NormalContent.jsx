/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { Glyphicon } = require('react-bootstrap');
const DropText = require('./DropText');


module.exports = (props) => (<div>
    <div>
        <Glyphicon
            glyph="upload"
            style={{
                fontSize: 80
            }} />
    </div>
    <DropText {...props} />
</div>);
