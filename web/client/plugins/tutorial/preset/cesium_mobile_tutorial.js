/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import I18N from '../../../components/I18N/I18N';
import CesiumTooltip from '../../../components/tutorial/steps/CesiumTooltip';

export default [
    {
        translation: 'introCesium',
        selector: '#intro-tutorial'
    },
    {
        title: <I18N.Message msgId="tutorial.cesium.title"/>,
        text: <CesiumTooltip touch/>,
        selector: '#map .cesium-viewer'
    },
    {
        translation: 'drawerMenu',
        selector: '.ms-drawer-menu-button'
    },
    {
        translation: 'home',
        selector: '#home-button'
    },
    {
        translation: 'searchButton',
        selector: '#search-help'
    },
    {
        translation: 'burgerMenu',
        selector: '#mapstore-burger-menu'
    }
];
