/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { withProps, compose } = require('recompose');
/**
 * Returns an enhancer that add `stepButtons` for viewport connection to a wizard toolbar
 * @param {function} showCondition parses props to allow visualization of the buttons (if other connect condition are satisfied)
 */
module.exports = (showCondition = () => true) => compose(
    withProps(({
        disableMultiDependencySupport,
        stepButtons = [],
        toggleConnection = () => { },
        availableDependencies = [],
        canConnect,
        connected,
        ...props
    }) => ({
        stepButtons: [...stepButtons, {
            onClick: () => toggleConnection(availableDependencies),
            disabled: disableMultiDependencySupport,
            visible: !!showCondition(props) && !!canConnect && availableDependencies.length > 0,
            bsStyle: connected ? "success" : "primary",
            glyph: connected ? "plug" : "unplug",
            tooltipId: connected
                ? "widgets.builder.wizard.clearConnection"
                : availableDependencies.length === 1
                    ? "widgets.builder.wizard.connectToTheMap"
                    : "widgets.builder.wizard.connectToAMap"
        }
        ]
    }))
);
