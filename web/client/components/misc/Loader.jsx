/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const sizeToClass = size => size > 100
    ? 'full'
    : size > 40
        ? 'medium'
        : 'small';
const React = require('react');
module.exports = ({ size, style = {}, className}) => (<div className={className}
    style={{ width: size, height: size, overflow: "hidden", ...style }}>
    <div className={`mapstore-${sizeToClass(size)}-size-loader`}></div>
</div>);
