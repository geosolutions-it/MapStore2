/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {withProps, compose} = require('recompose');
const viewportConnect = require('./viewportConnect');
/**
 * Returns an enhancer that add `stepButtons` for viewport connection to a wizard toolbar
 * @param {function} showCondition parses props to allow visualization of the buttons (if other connect condition are satisfied)
 */
module.exports = (showCondition = () => true) => compose(
    viewportConnect,
    withProps(({
            stepButtons = [],
            toggleConnection = () => { },
            availableDependencies = [],
            canConnect,
            connected,
            ...props
        }) => ({
            stepButtons: [{
                    onClick: () => toggleConnection(availableDependencies),
                    disabled: availableDependencies.length > 1, // TODO: remove when support multi map
                    visible: showCondition(props) && canConnect && availableDependencies.length > 0,
                    bsStyle: connected ? "success" : "primary",
                    glyph: connected ? "plug" : "unplug",
                tooltipId: connected
                    ? "widgets.builder.wizard.clearConnection"
                    : availableDependencies.length === 1
                        ? "widgets.builder.wizard.connectToTheMap"
                        : "connection to multiple maps not supported yet" // TODO: "widgets.builder.wizard.connectToAMap"
                }, ...stepButtons
            ]
        }))
);
