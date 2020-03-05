/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { getPluginForTest } from './pluginsTestUtils';

import BurgerMenu from '../BurgerMenu';

describe('BurgerMenu plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('BurgerMenu', () => {
        const { Plugin } = getPluginForTest(BurgerMenu, {});
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
        const burgerMenuSpan = document.getElementById('mapstore-burger-menu');
        expect(burgerMenuSpan).toExist();
        const liEls = document.querySelectorAll('.dropdown-menu > li');
        expect(liEls.length).toBe(2);
    });
    it('BurgerMenu items with children', () => {
        const { Plugin } = getPluginForTest(BurgerMenu, {});
        const items = [{
            name: 'test',
            position: 1,
            text: 'Test Item',
            children: [{
                name: 'testchild',
                position: 1,
                text: 'Test Child'
            }]
        }];
        ReactDOM.render(<Plugin items={items}/>, document.getElementById("container"));
        const burgerMenuSpan = document.getElementById('mapstore-burger-menu');
        expect(burgerMenuSpan).toExist();
        const liEls = document.querySelectorAll('.dropdown-menu > li');
        expect(liEls.length).toBe(1);
        const submenuDiv = liEls[0].querySelector('.burger-menu-submenu');
        expect(submenuDiv).toExist();
        expect(submenuDiv.querySelectorAll('.burger-menu-submenu li').length).toBe(1);
    });
});
