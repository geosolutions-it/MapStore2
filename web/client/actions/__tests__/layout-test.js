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
    updateLayoutType,
    resizeLayoutPanel,
    setActivePlugin
} from '../layout';

describe('Test correctness of the layout actions', () => {
    it('updateLayoutType action', () => {
        const VALUE = 'lg';
        const action = updateLayoutType(VALUE);
        expect(action.type).toBe(SET_CONTROL_PROPERTY);
        expect(action.control).toBe('layout');
        expect(action.property).toBe('type');
        expect(action.value).toBe(VALUE);
    });
    it('resizeLayoutPanel thunk', () => {
        const DATA = { width: 300, height: '100%' };
        const MENU_ID = 'menu_id';
        const getState = () => ({
            controls: {
                layout: {
                    panelSizes: {
                        previousId: { width: 0, height: 0 }
                    }
                }
            }
        });
        resizeLayoutPanel(DATA, MENU_ID)((action) => {
            expect(action.type).toBe(SET_CONTROL_PROPERTY);
            expect(action.control).toBe('layout');
            expect(action.property).toBe('panelSizes');
            expect(action.value).toEqual({
                previousId: { width: 0, height: 0 },
                [MENU_ID]: DATA
            });
        }, getState);
    });
    it('setActivePlugin thunk toggle', () => {
        const NAME = 'name';
        const getState = () => ({
            controls: {
                layout: {
                    activePlugins: [],
                    structure: {
                        leftMenu: ['name']
                    }
                }
            }
        });
        setActivePlugin(NAME)((action) => {
            expect(action.type).toBe(SET_CONTROL_PROPERTY);
            expect(action.control).toBe('layout');
            expect(action.property).toBe('activePlugins');
            expect(action.value).toEqual([ NAME ]);
        }, getState);
    });

    it('setActivePlugin thunk forces disable', () => {
        const NAME = 'name';
        const ENABLE = false;
        const getState = () => ({
            controls: {
                layout: {
                    activePlugins: [],
                    structure: {
                        leftMenu: ['name']
                    }
                }
            }
        });
        setActivePlugin(NAME, ENABLE)((action) => {
            expect(action.type).toBe(SET_CONTROL_PROPERTY);
            expect(action.control).toBe('layout');
            expect(action.property).toBe('activePlugins');
            expect(action.value).toEqual([]);
        }, getState);
    });

    it('setActivePlugin thunk toggles different menu', () => {
        const NAME = 'name';
        const getState = () => ({
            controls: {
                layout: {
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
            expect(action.control).toBe('layout');
            expect(action.property).toBe('activePlugins');
            expect(action.value).toEqual([ NAME, 'other' ]);
        }, getState);
    });
});
