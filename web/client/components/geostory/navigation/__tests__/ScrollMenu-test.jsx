/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import STORY from '../../../../test-resources/geostory/sampleStory_1.json';
import { navigableItemsSelectorCreator } from '../../../../selectors/geostory';

import ScrollMenu from '../ScrollMenu';

describe('ScrollMenu component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Rendering with defaults', () => {
        ReactDOM.render(<ScrollMenu items={navigableItemsSelectorCreator()({geostory: {currentStory: STORY}})} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-horizontal-menu');
        expect(el).toExist();
        const menuItems = container.querySelectorAll('.ms-menu-item');
        expect(menuItems).toExist();
        expect(menuItems.length).toBe(5);
    });
    it('should fire scrollTo on menu item click', (done) => {
        const ITEMS = [{
            id: 'item_01',
            title: 'Item 1'
        }, {
            id: 'item_02',
            title: 'Item 2'
        }, {
            id: 'item_03',
            title: 'Item 3'
        }, {
            id: 'item_04',
            title: 'Item 4'
        }, {
            id: 'item_05',
            title: 'Item 5'
        }];
        ReactDOM.render(
            <div style={{ width: 100, height: 50 }}>
                <ScrollMenu
                    items={ITEMS}
                    currentPage={{
                        sectionId: 'item_02'
                    }}
                    scrollTo={(id) => {
                        expect(id).toBe('item_01');
                        done();
                    }}/>
            </div>,
            document.getElementById("container"));

        const container = document.getElementById('container');
        const scrollMenuNode = container.querySelector('.ms-horizontal-menu');
        expect(scrollMenuNode).toExist();
        const menuItemNode = scrollMenuNode.querySelectorAll('.ms-menu-item');
        expect(menuItemNode.length).toBe(5);
        Simulate.click(menuItemNode[0]);
    });
    it('should move item in view', (done) => {

        const ITEMS = [{
            id: 'item_01',
            title: 'Item 1'
        }, {
            id: 'item_02',
            title: 'Item 2'
        }, {
            id: 'item_03',
            title: 'Item 3'
        }, {
            id: 'item_04',
            title: 'Item 4'
        }, {
            id: 'item_05',
            title: 'Item 5'
        }];

        act(() => {
            ReactDOM.render(
                <div key="scroll-menu" style={{ width: 100, height: 50 }}>
                    <ScrollMenu
                        items={ITEMS}
                        transition={0}
                        updateTimeDebounceTime={0}
                        currentPage={{
                            sectionId: 'item_05'
                        }}/>
                </div>,
                document.getElementById("container"));
        });

        const container = document.getElementById('container');
        const scrollMenuNode = container.querySelector('.ms-horizontal-menu');
        expect(scrollMenuNode).toExist();
        const menuItemNode = scrollMenuNode.querySelectorAll('.ms-menu-item');
        const item5Node = menuItemNode[4];
        let item5BoundingClientRect = item5Node.getBoundingClientRect();
        const START_LEFT = item5BoundingClientRect.left;

        setTimeout(() => {
            try {
                expect(menuItemNode.length).toBe(5);
                item5BoundingClientRect = item5Node.getBoundingClientRect();
                expect(item5BoundingClientRect.left < START_LEFT).toBeTruthy();
            } catch (e) {
                done(e);
            }
            done();
        }, 50);
    });

    it('should show left and right button', () => {

        const ITEMS = [{
            id: 'item_01',
            title: 'Item 1'
        }, {
            id: 'item_02',
            title: 'Item 2'
        }, {
            id: 'item_03',
            title: 'Item 3'
        }, {
            id: 'item_04',
            title: 'Item 4'
        }, {
            id: 'item_05',
            title: 'Item 5'
        }];

        act(() => {
            ReactDOM.render(
                <div key="scroll-menu" style={{ width: 100, height: 50 }}>
                    <ScrollMenu
                        items={ITEMS}
                        transition={0}
                        updateTimeDebounceTime={0}
                        currentPage={{
                            sectionId: 'item_05'
                        }}/>
                </div>,
                document.getElementById("container"));
        });

        const container = document.getElementById('container');
        const scrollMenuNode = container.querySelector('.ms-horizontal-menu');
        expect(scrollMenuNode).toExist();
        const rightArrowNode = scrollMenuNode.querySelector('.glyphicon-chevron-right');
        expect(rightArrowNode).toExist();
        let leftArrowNode = scrollMenuNode.querySelector('.glyphicon-chevron-left');
        expect(leftArrowNode).toBe(null);

        act(() => {
            Simulate.click(rightArrowNode);
        });

        leftArrowNode = scrollMenuNode.querySelector('.glyphicon-chevron-left');
        expect(leftArrowNode).toExist();
    });
});
