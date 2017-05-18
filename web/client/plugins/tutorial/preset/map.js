/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const I18N = require('../../../components/I18N/I18N');
const CesiumTooltip = require('../CesiumTooltip');

module.exports = [
    // remove comment to enable intro/autostart
    /*{
        translation: 'intro',
        selector: '#intro-tutorial'
    },*/
    {
        translationHTML: 'drawerMenu',
        selector: '#drawer-menu-button'
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
        translation: 'cesiumNavigation',
        selector: '#distanceLegendDiv .navigation-controls'
    },
    {
        translation: 'zoomInButton',
        selector: '#zoomin-btn',
        position: 'top'
    },
    {
        translation: 'zoomOutButton',
        selector: '#zoomout-btn',
        position: 'top'
    },
    {
        translation: 'fullscreen',
        selector: '#fullscreen-btn',
        position: 'top'
    },
    {
        translation: 'identifyButton',
        selector: '#identifyBar-container',
        position: 'top'
    }
];
