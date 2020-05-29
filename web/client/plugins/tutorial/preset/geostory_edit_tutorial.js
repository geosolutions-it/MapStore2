/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = [
    {
        translation: "geostoryIntro",
        selector: "#intro-tutorial"
    },
    {
        translation: "geostoryViewHeader",
        selector: "#mapstore-navbar",
        position: "bottom"
    },
    {
        translationHTML: "geostoryEditSidebar",
        selector: ".ms-geostory-builder",
        position: "right"
    }, {
        translationHTML: "geostoryEditSidebarToolbar",
        selector: ".ms-geostory-builder-header",
        position: "bottom",
        action: {
            back: {
                type: 'GEOSTORY:TOGGLE_SETTINGS_PANEL',
                withSave: false
            }
        }
    },
    {
        translationHTML: "geostoryEditSidebarSettings",
        selector: ".ms-geostory-builder",
        position: "right",
        action: {
            next: {
                type: 'GEOSTORY:TOGGLE_SETTINGS_PANEL',
                withSave: false
            },
            back: {
                type: 'GEOSTORY:TOGGLE_SETTINGS_PANEL',
                withSave: false
            }
        }
    }, {
        translationHTML: "geostoryEditContainer",
        selector: ".ms-geostory",
        position: "auto",
        action: {
            next: {
                type: 'GEOSTORY:TOGGLE_SETTINGS_PANEL',
                withSave: false
            }
        }
    }, {
        translationHTML: "geostoryEditAddbar",
        selector: ".ms-sections-container > section",
        position: "auto"
    }, {
        translationHTML: "geostoryEditMediaEditor",
        selector: ".ms-geostory",
        position: "bottom"
    }
];
