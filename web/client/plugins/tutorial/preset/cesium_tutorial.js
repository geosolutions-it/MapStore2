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
    {
        translation: 'introCesium',
        selector: '#intro-tutorial'
    },
    {
        title: <I18N.Message msgId="tutorial.cesium.title"/>,
        text: <CesiumTooltip/>,
        selector: '#map .cesium-viewer',
        position: 'bottom'
    },
    {
        translation: 'cesiumCompass',
        selector: '#distanceLegendDiv .compass'
    },
    {
        translationHTML: 'drawerMenu',
        selector: '.ms-drawer-menu-button'
    },
    {
        translation: 'searchBar',
        selector: '#map-search-bar'
    },
    {
        translation: 'home',
        selector: '#home-button'
    },
    {
        translation: 'burgerMenu',
        selector: '#mapstore-burger-menu'
    },
    {
        translation: 'fullscreen',
        selector: '#fullscreen-btn',
        position: 'top'
    },
    {
        translation: 'identifyButton',
        selector: '#navigationBar-container .glyphicon.glyphicon-option-horizontal',
        position: 'top'
    }
];
