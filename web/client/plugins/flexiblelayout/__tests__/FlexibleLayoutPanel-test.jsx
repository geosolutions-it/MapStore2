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
import FlexibleLayoutPanel from '../FlexibleLayoutPanel';
import ReactTestUtils from 'react-dom/test-utils';

// styles needed for layout structure
import './flexiblelayout-test-style.less';

describe('FlexibleLayoutPanel Component', () => {
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
        ReactDOM.render(<FlexibleLayoutPanel />, document.getElementById('container'));
        const layoutPanelNode = document.querySelector('.ms-flexible-layout-panel');
        expect(layoutPanelNode).toExist();
        const dragHandlerNode = layoutPanelNode.querySelector('.ms-flexible-layout-panel-handle');
        expect(dragHandlerNode).toExist();
    });
    it('render component with resizable disabled', () => {
        ReactDOM.render(<FlexibleLayoutPanel resizeDisabled />, document.getElementById('container'));
        const layoutPanelNode = document.querySelector('.ms-flexible-layout-panel');
        expect(layoutPanelNode).toExist();
        const dragHandlerNode = layoutPanelNode.querySelector('.ms-flexible-layout-panel-handle');
        expect(dragHandlerNode).toBe(null);
    });

    it('should drag from custom handler mouse', () => {
        const TEST_CHILD_CLASS = 'test-child';
        ReactDOM.render(<FlexibleLayoutPanel
            active
            defaultWidth={100}
            defaultHeight={500}>
            <div className={TEST_CHILD_CLASS}></div>
        </FlexibleLayoutPanel>, document.getElementById('container'));
        const layoutPanelNode = document.querySelector('.ms-flexible-layout-panel');
        expect(layoutPanelNode).toExist();
        const layoutPanelBody = layoutPanelNode.querySelector(`.${TEST_CHILD_CLASS}`);
        expect(layoutPanelBody.clientWidth).toBe(100);
        const dragHandlerNode = document.querySelector('.ms-flexible-layout-panel-handle');
        expect(dragHandlerNode).toExist();

        ReactTestUtils.Simulate.mouseDown(dragHandlerNode, { button: 0, clientX: 100, clientY: 0 });
        ReactTestUtils.Simulate.mouseUp(dragHandlerNode, { button: 0, clientX: 200, clientY: 0 });
        expect(layoutPanelNode.querySelector(`.${TEST_CHILD_CLASS}`).clientWidth).toBe(200);
    });

    it('should drag from custom handler touch', () => {
        const TEST_CHILD_CLASS = 'test-child';
        ReactDOM.render(<FlexibleLayoutPanel
            defaultWidth={100}
            defaultHeight={500}>
            <div className={TEST_CHILD_CLASS}></div>
        </FlexibleLayoutPanel>, document.getElementById('container'));
        const layoutPanelNode = document.querySelector('.ms-flexible-layout-panel');
        expect(layoutPanelNode).toExist();
        const layoutPanelBody = layoutPanelNode.querySelector(`.${TEST_CHILD_CLASS}`);
        expect(layoutPanelBody.clientWidth).toBe(100);
        const dragHandlerNode = layoutPanelNode.querySelector('.ms-flexible-layout-panel-handle');
        expect(dragHandlerNode).toExist();
        ReactTestUtils.Simulate.touchStart(dragHandlerNode, { button: 0, clientX: 100, clientY: 0 });
        ReactTestUtils.Simulate.touchEnd(dragHandlerNode, { button: 0, clientX: 200, clientY: 0 });
        expect(layoutPanelBody.clientWidth).toBe(200);
    });
});
