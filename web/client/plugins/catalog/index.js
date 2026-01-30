/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { createPlugin } from '../../utils/PluginsUtils';
import Message from '../../components/I18N/Message';
import { setControlProperty } from '../../actions/controls';
import Catalog from './containers/Catalog';
import { Glyphicon } from 'react-bootstrap';
import { burgerMenuSelector } from '../../selectors/controls';
import API from '../../api/catalog';

export default createPlugin('Catalog', {
    component: Catalog,
    containers: {
        SidebarMenu: {
            name: 'metadataexplorer',
            position: 5,
            text: <Message msgId="catalog.title" />,
            tooltip: "catalog.tooltip",
            icon: <Glyphicon glyph="folder-open" />,
            action: setControlProperty.bind(null, "metadataexplorer", "enabled", true, true),
            selector: (state) => ({
                style: {
                    display: burgerMenuSelector(state) ? 'none' : null
                }
            }),
            toggle: true,
            priority: 1,
            doNotHide: true
        },
    },
    reducers: {
        reducers: { catalog: require('../../reducers/catalog').default },
    },
    epics: require('../../epics/catalog').default(API)
})