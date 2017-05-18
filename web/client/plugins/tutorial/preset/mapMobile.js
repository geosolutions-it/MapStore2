/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const I18N = require('../../../components/I18N/I18N');
const CesiumTooltip = require('../../../components/tutorial/steps/CesiumTooltip');

module.exports = [
    // remove comment to enable intro/autostart
    /*{
        translation: 'intro',
        selector: '#intro-tutorial'
    },*/
    {
        translation: 'drawerMenu',
        selector: '#drawer-menu-button'
    },
    {
        translation: 'searchButton',
        selector: '#search-help'
    },
    {
        translation: 'burgerMenu',
        selector: '#mapstore-burger-menu'
    },
    {
        title: <I18N.Message msgId="tutorial.cesium.title"/>,
        text: <CesiumTooltip touch={true}/>,
        selector: '#map .cesium-viewer',
        position: 'bottom'
    },
    {
        translation: 'home',
        selector: '#home-button'
    }
];
