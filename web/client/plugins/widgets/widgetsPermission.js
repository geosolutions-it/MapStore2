/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const {compose, withProps, defaultProps} = require('recompose');
const editOptions = require('./editOptions');

/**
 * enhancers to manage widgets permissions.
 */
module.exports = {
    /*
    * Hide hidden widgets (Widgets with property `hide=true`) in tray for users has not access to them.
    * Uses `toolsOptions` property. See `editOptions` enhancer
    */
    filterHiddenWidgets: compose(
        defaultProps({
            "toolsOptions": {
                "seeHidden": "user.role===ADMIN"
            }
        }),
        // allow to customize toolsOptions object, with rules. see `accessRuleParser`
        editOptions("toolsOptions", { asObject: true }),
        withProps(({ widgets, toolsOptions = { seeHidden: false } }) => ({
            widgets: toolsOptions.seeHidden ? widgets : widgets.filter(w => !w.hide)
        }))
    )
};
