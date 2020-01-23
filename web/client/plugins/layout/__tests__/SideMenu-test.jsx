/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import SideMenu from '../SideMenu';

// styles needed for layout structure
import './layout-test-style.less';

describe('SideMenu Component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('render component with default configuration', () => {
        ReactDOM.render(<SideMenu />, document.getElementById('container'));
        const sideMenuNode = document.querySelector('.ms-menu-layout');
        expect(sideMenuNode).toExist();
    });
    it('render component with items and selected tab', () => {

        const ACTIVE_PLUGIN = '001';
        const ACTIVE_PLUGINS = [ ACTIVE_PLUGIN ];
        const ITEM_001_CLASS = 'item-001';
        const ITEM_002_CLASS = 'item-002';
        const ITEMS = [
            {
                name: ACTIVE_PLUGIN,
                position: 2,
                glyph: 'g-001',
                Component: () => <div className={ITEM_001_CLASS}/>
            },
            {
                name: '002',
                position: 1,
                glyph: 'g-002',
                Component: () => <div className={ITEM_002_CLASS}/>
            }
        ];
        ReactDOM.render(
            <SideMenu
                items={ITEMS}
                activePlugins={ACTIVE_PLUGINS}
            />, document.getElementById('container'));
        const sideMenuNode = document.querySelector('.ms-menu-layout');
        expect(sideMenuNode).toExist();

        const menuButtons = document.getElementsByClassName('ms-menu-btn');
        expect(menuButtons.length).toBe(2);

        expect(menuButtons[0].querySelector('.glyphicon-g-002')).toExist();
        expect(menuButtons[1].querySelector('.glyphicon-g-001')).toExist();

        const activeItem001Node = document.querySelector(`.${ITEM_001_CLASS}`);
        expect(activeItem001Node).toExist();
        const item002Node = document.querySelector(`.${ITEM_002_CLASS}`);
        expect(item002Node).toBe(null);
    });
});
