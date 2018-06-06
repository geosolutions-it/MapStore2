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

module.exports = ({ error }) => (<div style={{
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
            {error} not valid
        </h5>
        <h4 className="text-danger" style={{backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: 12}}>
            !!Mockup Message -
            Here additional message eg. error on shapefile parsing
            - Mockup Message!!
        </h4>
        <DropText />
        </div>);
