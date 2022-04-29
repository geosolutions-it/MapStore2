/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import SidebarMenu from "../SidebarMenu";
import { getPluginForTest } from './pluginsTestUtils';

describe('SidebarMenu Plugin', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
    });

    it('default configuration', () => {
        document.getElementById('container').style.height = '600px';
        const { Plugin } = getPluginForTest(SidebarMenu, {});
        const items = [{
            name: 'test',
            position: 1,
            text: 'Test Item'
        }, {
            name: 'test2',
            position: 2,
            text: 'Test Item 2'
        }];
        ReactDOM.render(<Plugin items={items}/>, document.getElementById("container"));
        const sidebarMenuContainer = document.getElementById('mapstore-sidebar-menu-container');
        expect(sidebarMenuContainer).toExist();
        const elements = document.querySelectorAll('#mapstore-sidebar-menu > button, #mapstore-sidebar-menu #extra-items + .dropdown-menu li');
        expect(elements.length).toBe(2);
    });
});
