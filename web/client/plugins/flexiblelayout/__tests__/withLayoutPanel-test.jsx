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
import withFlexibleLayoutPanel from '../withFlexibleLayoutPanel';

// styles needed for layout structure
import './flexiblelayout-test-style.less';

describe('withFlexibleLayoutPanel HOC', () => {
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
        const TITLE = 'title';
        const TEST_COMPONENT_CLASS = 'test-component';
        const TestComponent = withFlexibleLayoutPanel(({ title }) => {
            return <div className={TEST_COMPONENT_CLASS}>{title}</div>;
        });
        ReactDOM.render(<TestComponent title={TITLE}/>, document.getElementById('container'));
        const layoutPanel = document.querySelector('.ms-flexible-layout-panel');
        expect(layoutPanel).toBe(null);
        const testComponentNode = document.querySelector(`.${TEST_COMPONENT_CLASS}`);
        expect(testComponentNode).toExist();
        expect(testComponentNode.innerHTML).toBe(TITLE);
    });
    it('render component with flexibleLayoutPanelProps empty', () => {
        const TITLE = 'title';
        const TEST_COMPONENT_CLASS = 'test-component';
        const TestComponent = withFlexibleLayoutPanel(({ title }) => {
            return <div className={TEST_COMPONENT_CLASS}>{title}</div>;
        });
        ReactDOM.render(<TestComponent flexibleLayoutPanelProps={{}} title={TITLE}/>, document.getElementById('container'));
        const layoutPanel = document.querySelector('.ms-flexible-layout-panel');
        expect(layoutPanel).toExist();
        const testComponentNode = layoutPanel.querySelector(`.${TEST_COMPONENT_CLASS}`);
        expect(testComponentNode).toExist();
        expect(testComponentNode.innerHTML).toBe(TITLE);
        const dragHandlerNode = layoutPanel.querySelector('.ms-flexible-layout-panel-handle');
        expect(dragHandlerNode).toExist();
    });
    it('render component with resize disabled ', () => {
        const TITLE = 'title';
        const TEST_COMPONENT_CLASS = 'test-component';
        const TestComponent = withFlexibleLayoutPanel(({ title }) => {
            return <div className={TEST_COMPONENT_CLASS}>{title}</div>;
        });
        ReactDOM.render(
            <TestComponent
                title={TITLE}
                flexibleLayoutPanelProps={{
                    resizeDisabled: true
                }}
            />, document.getElementById('container'));
        const layoutPanel = document.querySelector('.ms-flexible-layout-panel');
        expect(layoutPanel).toExist();
        const testComponentNode = layoutPanel.querySelector(`.${TEST_COMPONENT_CLASS}`);
        expect(testComponentNode).toExist();
        expect(testComponentNode.innerHTML).toBe(TITLE);
        const dragHandlerNode = layoutPanel.querySelector('.ms-flexible-layout-panel-handle');
        expect(dragHandlerNode).toBe(null);
    });
});
