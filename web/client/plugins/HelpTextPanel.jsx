/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {connect} = require('react-redux');

module.exports = connect((state) => ({
    isVisible: state.controls && state.controls.help && state.controls.help.enabled,
    helpText: state.help && state.help.helpText
}))(require('../components/help/HelpTextPanel'));
