/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = [
    {
        translation: 'dashboardIntro',
        selector: '#intro-tutorial'
    },
    {
        translationHTML: 'dashboardContainer',
        selector: '.ms2-border-layout-content'
    },
    {
        translation: 'dashboardAddWidget',
        selector: '#ms-add-card-dashboard',
        position: 'right',
        action: {
            back: {
                type: 'DASHBOARD:SET_EDITING',
                editing: false
            },
            next: {
                type: 'DASHBOARD:SET_EDITING',
                editing: false
            }
        }
    },
    {
        translation: 'dashboardBuilder',
        selector: '.dashboard-editor.de-builder',
        position: 'right',
        action: {
            next: {
                type: 'WIDGETS:NEW'
            }
        }
    },
    {
        translationHTML: 'dashboardAddChart',
        selector: '.ms-widget-selector-chart',
        position: 'right'
    },
    {
        translationHTML: 'dashboardAddText',
        selector: '.ms-widget-selector-text',
        position: 'right'
    },
    {
        translationHTML: 'dashboardAddTable',
        selector: '.ms-widget-selector-table',
        position: 'right'
    },
    {
        translationHTML: 'dashboardAddCounter',
        selector: '.ms-widget-selector-counter',
        position: 'right'
    },
    {
        translationHTML: 'dashboardAddMap',
        selector: '.ms-widget-selector-map',
        position: 'right'
    },
    {
        translation: 'dashboardNav',
        selector: '#mapstore-navbar',
        position: 'bottom'
    }
];
