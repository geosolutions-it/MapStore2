/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { Glyphicon } from 'react-bootstrap';
import assign from 'object-assign';
import ExpanderPlugin from '../components/buttons/ToggleButton';

/**
 * Expander plugin. Adds the '...' button to the Toolbar plugin to hide some buttons.
 * @name Expander
 * @class
 * @memberof plugins
 */
export default {
    ExpanderPlugin: assign(ExpanderPlugin, {
        Toolbar: {
            name: 'expand',
            position: 10000,
            alwaysVisible: true,
            tooltip: "expandtoolbar.tooltip",
            // it is visible when Toolbar allVisible property is set to false or when there are no other items to hide
            showWhen: ({ items = [] } = {}) => items.filter((i = {}) => !i.name !== 'expand' && !i.alwaysVisible).length > 1,
            icon: <Glyphicon glyph="option-horizontal"/>,
            toggle: true,
            toggleControl: 'toolbar',
            toggleProperty: 'expanded',
            priority: 1
        }
    }),
    reducers: {}
};
