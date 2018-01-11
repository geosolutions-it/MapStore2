/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {pure, compose} = require('recompose');
const emptyState = require('../misc/enhancers/emptyState');
module.exports =
    compose(
        pure,
        emptyState(
            ({widgets = []} = {}) => widgets.length === 0,
            () => ({
                glyph: "dashboard",
                title: "The dashboard is empty" // TODO i18n
            })
        )
    )(require('../widgets/view/WidgetsView'));
