/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import Header from '../Header';
import expect from 'expect';

describe('Test for TopToolbar component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with defaults', () => {
        ReactDOM.render(<Header/>, document.getElementById('container'));
        const el = document.querySelector('.data-grid-top-toolbar');
        expect(el).toBeTruthy();
        const titleNode = document.querySelector('.data-grid-top-toolbar-title');
        expect(titleNode).toBeTruthy();
        const closeNode = document.querySelector('.glyphicon-1-close');
        expect(closeNode).toBeTruthy();
    });
    it('should render with children', () => {
        function Toolbar() {
            return <div id="toolbar"></div>;
        }
        ReactDOM.render(<Header><Toolbar /></Header>, document.getElementById('container'));
        const leftNode = document.querySelector('.data-grid-top-toolbar-left');
        expect(leftNode).toBeTruthy();
        const toolbarNode = leftNode.querySelector('#toolbar');
        expect(toolbarNode).toBeTruthy();
    });
    it('should hide the title with hideLayerTitle', () => {
        ReactDOM.render(<Header hideLayerTitle />, document.getElementById('container'));
        const titleNode = document.querySelector('.data-grid-top-toolbar-title');
        expect(titleNode).toBeFalsy();
    });
    it('should hide the title with hideCloseButton', () => {
        ReactDOM.render(<Header hideCloseButton />, document.getElementById('container'));
        const closeNode = document.querySelector('.glyphicon-1-close');
        expect(closeNode).toBeFalsy();
    });
});
