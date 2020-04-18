/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { SET_CONTROL_PROPERTY } from '../controls';
import {
    updateFlexibleLayoutType,
    resizeFlexibleLayoutPanel,
    setActivePlugin
} from '../flexiblelayout';

describe('Test correctness of the flexiblelayout actions', () => {
    it('updateLayoutType action', () => {
        const VALUE = 'lg';
        const action = updateFlexibleLayoutType(VALUE);
        expect(action.type).toBe(SET_CONTROL_PROPERTY);
        expect(action.control).toBe('flexibleLayout');
        expect(action.property).toBe('type');
        expect(action.value).toBe(VALUE);
    });
    it('resizeLayoutPanel thunk with menu id', () => {
        const DATA = { width: 300, height: '100%' };
        const MENU_ID = 'menu-id';
        const getState = () => ({
            controls: {
                flexibleLayout: {
                    panelSizes: {
                        previousId: { width: 0, height: 0 }
                    }
                }
            }
        });
        resizeFlexibleLayoutPanel(MENU_ID, DATA)((action) => {
            expect(action.type).toBe(SET_CONTROL_PROPERTY);
            expect(action.control).toBe('flexibleLayout');
            expect(action.property).toBe('panelSizes');
            expect(action.value).toEqual({
                previousId: { width: 0, height: 0 },
                [MENU_ID]: DATA
            });
        }, getState);
    });
    it('resizeLayoutPanel thunk with name param layout structure', () => {
        const DATA = { width: 300, height: '100%' };
        const NAME = 'name';
        const MENU_ID = 'menu-id';
        const getState = () => ({
            controls: {
                flexibleLayout: {
                    structure: {
                        [MENU_ID]: [ NAME, 'otherName' ]
                    },
                    panelSizes: {
                        [MENU_ID]: {
                            otherName: { width: 0, height: 0 }
                        }
                    }
                }
            }
        });
        resizeFlexibleLayoutPanel(NAME, DATA)((action) => {
            expect(action.type).toBe(SET_CONTROL_PROPERTY);
            expect(action.control).toBe('flexibleLayout');
            expect(action.property).toBe('panelSizes');
            expect(action.value).toEqual({
                [MENU_ID]: {
                    otherName: { width: 0, height: 0 },
                    [NAME]: DATA
                }
            });
        }, getState);
    });
    it('setActivePlugin thunk toggle', () => {
        const NAME = 'name';
        const getState = () => ({
            controls: {
                flexibleLayout: {
                    activePlugins: [],
                    structure: {
                        leftMenu: ['name']
                    }
                }
            }
        });
        setActivePlugin(NAME)((action) => {
            expect(action.type).toBe(SET_CONTROL_PROPERTY);
            expect(action.control).toBe('flexibleLayout');
            expect(action.property).toBe('activePlugins');
            expect(action.value).toEqual([ NAME ]);
        }, getState);
    });

    it('setActivePlugin thunk forces disable', () => {
        const NAME = 'name';
        const ENABLE = false;
        const getState = () => ({
            controls: {
                flexibleLayout: {
                    activePlugins: [],
                    structure: {
                        leftMenu: ['name']
                    }
                }
            }
        });
        setActivePlugin(NAME, ENABLE)((action) => {
            expect(action.type).toBe(SET_CONTROL_PROPERTY);
            expect(action.control).toBe('flexibleLayout');
            expect(action.property).toBe('activePlugins');
            expect(action.value).toEqual([]);
        }, getState);
    });

    it('setActivePlugin thunk toggles different menu', () => {
        const NAME = 'name';
        const getState = () => ({
            controls: {
                flexibleLayout: {
                    activePlugins: ['other'],
                    structure: {
                        leftMenu: ['name'],
                        rightMenu: ['other']
                    }
                }
            }
        });
        setActivePlugin(NAME)((action) => {
            expect(action.type).toBe(SET_CONTROL_PROPERTY);
            expect(action.control).toBe('flexibleLayout');
            expect(action.property).toBe('activePlugins');
            expect(action.value).toEqual([ NAME, 'other' ]);
        }, getState);
    });
});
