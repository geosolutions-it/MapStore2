/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const uuid = require('uuid');

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
        translation: "geostoryViewNavItems",
        selector: ".ms-geostory-navigation-navigable-items",
        position: "bottom"
    },
    {
        translation: "geostoryViewNavTitle",
        selector: ".ms-geostory-navigation-title",
        position: "bottom"
    },
    {
        translation: "geostoryViewNavLogo",
        selector: ".ms-geostory-navigation-logo",
        position: "bottom"
    },
    {
        translation: "geostoryViewContent",
        selector: ".ms-geostory",
        position: "auto"
    },
    {
        translation: "geostoryViewEditButton",
        selector: ".ms-geostory-navigation-toolbar #edit-story",
        position: "bottom",
        action: {
            back: {
                type: "GEOSTORY:CHANGE_MODE",
                mode: "view"
            }
        }
    }, {
        translationHTML: "geostoryEditSidebar",
        selector: ".ms-geostory-builder",
        position: "right",
        action: {
            next: {
                type: "GEOSTORY:CHANGE_MODE",
                mode: "edit"
            }
        }
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
        translation: "geostoryEditContainer",
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
        position: "auto",
        action: {
            back: {
                type: 'MEDIA_EDITOR:HIDE',
                owner: 'geostory'
            }
        }
    }, {
        translationHTML: "geostoryEditMediaEditor",
        selector: ".ms-geostory",
        position: "auto",
        action: {
            next: {
                type: 'GEOSTORY:ADD',
                id: uuid(),
                path: 'sections',
                position: 'title_section_id1',
                element: {
                    id: uuid(),
                    type: 'paragraph',
                    title: 'Media Section',
                    contents: [
                        {
                            id: uuid(),
                            type: 'column',
                            contents: [
                                {
                                    id: uuid(),
                                    type: 'media',
                                    size: 'medium',
                                    align: 'center'
                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
];
