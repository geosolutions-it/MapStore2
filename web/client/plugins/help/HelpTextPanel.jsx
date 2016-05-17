/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const {connect} = require('react-redux');
const assign = require('object-assign');
const {Glyphicon} = require('react-bootstrap');

const HelpTextPanel = connect((state) => ({
    isVisible: state.controls && state.controls.help && state.controls.help.enabled,
    helpText: state.help && state.help.helpText
}))(require('../../components/help/HelpTextPanel'));

module.exports = {
    HelpPlugin: assign(HelpTextPanel, {
        Toolbar: {
            name: 'help',
            position: 1000,
            icon: <Glyphicon glyph="question-sign"/>,
            tooltip: "help",
            toggle: true
        }
    }),
    reducers: {}
};
