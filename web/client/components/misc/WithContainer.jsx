/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root dir
 ectory of this source tree.
 */

const React = require('react');

const ConfigUtils = require('../../utils/ConfigUtils');

module.exports = (Component) => {
    return (props) => {
        return <Component {...props} container={document.querySelector('.' + (ConfigUtils.getConfigProp('themePrefix') || 'ms2') + " > div") || document.body}/>;
    };
};
