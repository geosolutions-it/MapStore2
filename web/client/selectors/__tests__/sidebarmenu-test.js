/*
* Copyright 2022, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import {lastActiveToolSelector, sidebarIsActiveSelector} from "../sidebarmenu";

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
});
