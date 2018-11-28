/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {compose, withProps} = require('recompose');

/**
 * Support widget hiding. Add the hide button to the widget tools.
 * Needs `withTools` enhancer inner component.
 */
module.exports = () =>
compose(
        withProps(({ widgetTools = [], toolsOptions = {}, updateProperty = () => { }, hide= false}) => ({
        widgetTools: [
            ...widgetTools,
            {
                glyph: hide ? "eye-close" : "eye-open",
                visible: !!toolsOptions.showHide,
                style: {
                    paddingLeft: 4,
                    paddingRight: 4,
                    color: !hide ? "grey" : undefined,
                    opacity: !hide ? 0.5 : 1
                },
                onClick: () => updateProperty("hide", !hide)
            }
        ]}
    ))
);
