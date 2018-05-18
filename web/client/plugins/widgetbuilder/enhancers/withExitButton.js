/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {withProps} = require('recompose');
module.exports = (visible = ({step}) => step === 0, overrides = {}) => withProps(({ stepButtons = [], exitButton, ...props}) => ({
    stepButtons: [{
        ...exitButton,
        visible: visible({stepButtons, exitButton, ...props}),
        ...overrides
    }, ...stepButtons]
}));
