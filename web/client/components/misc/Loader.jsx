/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');

const sizeToClass = size => size > 100
    ? 'full'
    : size > 40
        ? 'medium'
        : 'small';

const Loader = ({ size, style = {}, className, hidden }) => (<div className={className}
    style={{ width: size, height: size, overflow: "hidden", ...style }}>
    {!hidden && <div className={`mapstore-${sizeToClass(size)}-size-loader`}></div>}
</div>);

Loader.propTypes = {
    size: PropTypes.number,
    className: PropTypes.string,
    style: PropTypes.object
};

module.exports = Loader;
