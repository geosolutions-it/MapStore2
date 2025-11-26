/*
* Copyright 2022, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import {lastActiveToolSelector, sidebarIsActiveSelector, isSidebarWithFullHeight} from "../sidebarmenu";

describe('SidebarMenu SELECTORS', () => {
    it('should test lastActiveToolSelector', () => {
        const state = {
            sidebarmenu: {
                lastActiveItem: 'mapCatalog'
            }
        };

        expect(lastActiveToolSelector(state)).toEqual(state.sidebarmenu.lastActiveItem);
    });
    it('should test sidebarIsActiveSelector', () => {
        const state = {
            controls: {
                sidebarMenu: {
                    enabled: true
                }
            }
        };

        expect(sidebarIsActiveSelector(state)).toEqual(state.controls.sidebarMenu.enabled);
    });
    describe('isSidebarWithFullHeight', () => {
        it('should return true when dashboard is available and map editor is not open', () => {
            const state = {
                dashboard: {
                    editor: {
                        available: true
                    }
                },
                mapEditor: {
                    open: false,
                    owner: null
                }
            };
            expect(isSidebarWithFullHeight(state)).toBe(true);
        });
        it('should return false when dashboard is available but map editor is open with widgetInlineEditor owner', () => {
            const state = {
                dashboard: {
                    editor: {
                        available: true
                    }
                },
                mapEditor: {
                    open: true,
                    owner: "widgetInlineEditor"
                }
            };
            expect(isSidebarWithFullHeight(state)).toBe(false);
        });
        it('should return true when dashboard is available and map editor is open with inlineEditor owner (geostory)', () => {
            const state = {
                dashboard: {
                    editor: {
                        available: true
                    }
                },
                mapEditor: {
                    open: true,
                    owner: "inlineEditor"
                }
            };
            expect(isSidebarWithFullHeight(state)).toBe(true);
        });
        it('should return false when dashboard is not available', () => {
            const state = {
                dashboard: {
                    editor: {
                        available: false
                    }
                },
                mapEditor: {
                    open: false,
                    owner: null
                }
            };
            expect(isSidebarWithFullHeight(state)).toBe(false);
        });
        it('should return false when dashboard state is missing', () => {
            const state = {
                mapEditor: {
                    open: false,
                    owner: null
                }
            };
            expect(isSidebarWithFullHeight(state)).toBe(false);
        });
        it('should return false when mapEditor state is missing', () => {
            const state = {
                dashboard: {
                    editor: {
                        available: true
                    }
                }
            };
            expect(isSidebarWithFullHeight(state)).toBe(true);
        });
        it('should return false when state is empty', () => {
            const state = {};
            expect(isSidebarWithFullHeight(state)).toBe(false);
        });
    });
});
