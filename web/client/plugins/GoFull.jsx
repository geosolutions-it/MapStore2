/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {connect} = require('react-redux');

/**
 * GoFull plugin. Shows a button that opens full MapStore2 in a new tab. Try to find the `originalUrl` in configuration or tries to guess the mapId and creates the proper URL.
 * This plugins hides automatically if the originalUrl is not present in configuration and if the urlRegex do not match.
 * @prop {string} cfg.glyph the glyph icon for the button
 * @prop {string} cfg.tooltip messageId of the tooltip to use
 * @prop {string} cfg.urlRegex. A regex to parse the current location.href. This regex must match if the originalUrl is not defined.
 * @prop {string} cfg.urlReplaceString. The template to create the url link. Uses the `urlRegex` groups to create the final URL
 * @memberof plugins
 * @class GoFull
 */
const GoFullPlugin = connect(() => ({}))(require('../components/buttons/GoFullButton'));

const assign = require('object-assign');


module.exports = {
    GoFullPlugin: assign(GoFullPlugin, {
        Toolbar: {
            name: 'gofull',
            position: 1,
            toolStyle: "primary",
            tooltip: "fullscreen.viewLargerMap",
            tool: true,
            priority: 1
        }
    }),
    reducers: {}
};
