/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {connect} = require('react-redux');
const {toggleControl} = require('../actions/controls');

const BackgroundSelectorPlugin = connect((state) => ({
    layers: state.layers && state.layers.flat && state.layers.flat.filter((layer) => layer.group === "background") || [],
    enabled: state.controls && state.controls.backgroundSelector && state.controls.backgroundSelector.enabled || false
}), {
    onToggle: toggleControl.bind(null, 'backgroundSelector', null)
})(require('../components/background/BackgroundSelector'));

module.exports = {
    BackgroundSelectorPlugin,
    reducers: {}
};
