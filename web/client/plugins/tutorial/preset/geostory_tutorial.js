/**
 * Copyright 2018, GeoSolutions Sas.
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
        selector: ".ms-geostory-navigation-toolbar > div > span > button",
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
                id: 'ac60fc28-fcb1-4500-99e5-06213bcbaca8',
                path: 'sections',
                position: 'title_section_id1',
                element: {
                    id: 'dc9dcad7-1af3-41ea-9a3c-c31d1fc6e361',
                    type: 'paragraph',
                    title: 'Media Section',
                    contents: [
                        {
                            id: 'cff45afc-98c3-4280-845d-7455129f6c1b',
                            type: 'column',
                            contents: [
                                {
                                    id: 'ffa8e8a8-8947-4c11-833d-cfdf5ead12d3',
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
