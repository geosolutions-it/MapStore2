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
import ReactTestUtils from 'react-dom/test-utils';

import Menu from '../Menu';
import './menu-test-style.less';

describe('Menu Component', function() {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<Menu />, document.getElementById('container'));
        const menuRoot = document.querySelector('.ms-menu');
        expect(menuRoot).toExist();
    });

    it('should not render swipe button when container is bigger than tabs container', (done) => {

        const TAB_BUTTON_PROPS = {
            style: {
                width: 30,
                height: 30
            }
        };
        const TABS = [
            {
                id: '001-tab',
                glyph: '001',
                btnProps: TAB_BUTTON_PROPS
            }
        ];

        ReactDOM.render(
            <Menu
                tabs={TABS}
                style={{
                    width: 256,
                    height: 128
                }}
            />
            , document.getElementById('container'));

        setTimeout(() => {
            const menuRoot = document.querySelector('.ms-menu');
            expect(menuRoot).toExist();
            const swipeButton = menuRoot.querySelector('.ms-swipe-btn');
            expect(swipeButton).toBe(null);
            done();
        }, 50);
    });

    it('should apply mirror ans overlay classes', () => {

        ReactDOM.render(<Menu mirror overlay />, document.getElementById('container'));
        const menuRoot = document.querySelector('.ms-menu.ms-mirror');
        expect(menuRoot).toExist();
        const tabsOverlay = menuRoot.querySelector('.ms-menu-tabs.ms-overlay');
        expect(tabsOverlay).toExist();
    });

    it('should render swipe button when container is smaller than tabs container (vertical direction)', (done) => {

        const TAB_BUTTON_PROPS = {
            style: {
                width: 30,
                height: 30
            }
        };
        const TABS = [
            {
                id: '001-tab',
                glyph: '001',
                btnProps: TAB_BUTTON_PROPS
            },
            {
                id: '002-tab',
                glyph: '002',
                btnProps: TAB_BUTTON_PROPS
            },
            {
                id: '003-tab',
                glyph: '003',
                btnProps: TAB_BUTTON_PROPS
            },
            {
                id: '004-tab',
                glyph: '004',
                btnProps: TAB_BUTTON_PROPS
            },
            {
                id: '005-tab',
                glyph: '005',
                btnProps: TAB_BUTTON_PROPS
            }
        ];

        const DELTA_SWIPE_SIZE = 10;

        ReactDOM.render(
            <Menu
                tabs={TABS}
                deltaSwipeSize={DELTA_SWIPE_SIZE}
                style={{
                    width: 256,
                    height: 128
                }}
            />
            , document.getElementById('container'));

        setTimeout(() => {
            try {
                const menuRoot = document.querySelector('.ms-menu');
                expect(menuRoot).toExist();
                let swipeButton = menuRoot.getElementsByClassName('ms-swipe-btn');
                expect(swipeButton.length).toBe(1);
                const menuTabsContainerNode = menuRoot.querySelector('.ms-menu-tabs-container');
                expect(menuTabsContainerNode.style.transform).toBe('translateY(0px)');

                expect(swipeButton[0].querySelector('.glyphicon-chevron-down')).toExist();
                ReactTestUtils.Simulate.click(swipeButton[0]);
                expect(menuTabsContainerNode.style.transform).toBe(`translateY(-${DELTA_SWIPE_SIZE}px)`);

                swipeButton = menuRoot.getElementsByClassName('ms-swipe-btn');
                expect(swipeButton.length).toBe(2);
                expect(swipeButton[0].querySelector('.glyphicon-chevron-up')).toExist();
                expect(swipeButton[1].querySelector('.glyphicon-chevron-down')).toExist();

                ReactTestUtils.Simulate.click(swipeButton[0]);
                expect(menuTabsContainerNode.style.transform).toBe(`translateY(0px)`);

            } catch (e) {
                done(e);
            }
            done();
        }, 50);
    });

    it('should render swipe button when container is smaller than tabs container (horizontal direction)', (done) => {

        const TAB_BUTTON_PROPS = {
            style: {
                width: 30,
                height: 30
            }
        };
        const TABS = [
            {
                id: '001-tab',
                glyph: '001',
                btnProps: TAB_BUTTON_PROPS
            },
            {
                id: '002-tab',
                glyph: '002',
                btnProps: TAB_BUTTON_PROPS
            },
            {
                id: '003-tab',
                glyph: '003',
                btnProps: TAB_BUTTON_PROPS
            },
            {
                id: '004-tab',
                glyph: '004',
                btnProps: TAB_BUTTON_PROPS
            },
            {
                id: '005-tab',
                glyph: '005',
                btnProps: TAB_BUTTON_PROPS
            }
        ];

        const DELTA_SWIPE_SIZE = 10;
        const DIRECTION = 'horizontal';

        ReactDOM.render(
            <Menu
                tabs={TABS}
                direction={DIRECTION}
                deltaSwipeSize={DELTA_SWIPE_SIZE}
                style={{
                    width: 128,
                    height: 256
                }}
            />
            , document.getElementById('container'));

        setTimeout(() => {
            try {
                const menuRoot = document.querySelector('.ms-menu');
                expect(menuRoot).toExist();
                let swipeButton = menuRoot.getElementsByClassName('ms-swipe-btn');
                expect(swipeButton.length).toBe(1);
                const menuTabsContainerNode = menuRoot.querySelector('.ms-menu-tabs-container');
                expect(menuTabsContainerNode.style.transform).toBe('translateX(0px)');

                expect(swipeButton[0].querySelector('.glyphicon-chevron-right')).toExist();
                ReactTestUtils.Simulate.click(swipeButton[0]);
                expect(menuTabsContainerNode.style.transform).toBe(`translateX(-${DELTA_SWIPE_SIZE}px)`);

                swipeButton = menuRoot.getElementsByClassName('ms-swipe-btn');
                expect(swipeButton.length).toBe(2);
                expect(swipeButton[0].querySelector('.glyphicon-chevron-left')).toExist();
                expect(swipeButton[1].querySelector('.glyphicon-chevron-right')).toExist();

                ReactTestUtils.Simulate.click(swipeButton[0]);
                expect(menuTabsContainerNode.style.transform).toBe(`translateX(0px)`);

            } catch (e) {
                done(e);
            }
            done();
        }, 50);
    });

});
