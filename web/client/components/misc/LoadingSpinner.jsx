/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Loader = require('./Loader');
module.exports = ({ style = {display: 'inline-block'} } = {}) => <div style={style} className="mapstore-inline-loader" />;
