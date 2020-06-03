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

import DefaultViewer from '../DefaultViewer';

describe('DefaultViewer component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('DefaultViewer default rendering', () => {
        ReactDOM.render(<DefaultViewer/>, document.getElementById('container'));
        expect(document.getElementsByClassName('spinner')[0]).toExist();
    });
    it('DefaultViewer with some HTML detailsText', () => {
        const detailsText = '<p id="defaultviewer-test-element">Text</p>';
        ReactDOM.render(<DefaultViewer detailsText={detailsText}/>, document.getElementById('container'));
        const testElement = document.getElementById('defaultviewer-test-element');
        expect(testElement).toExist();
        expect(testElement.textContent).toBe('Text');
        expect(testElement.tagName).toBe('P');
    });
});

