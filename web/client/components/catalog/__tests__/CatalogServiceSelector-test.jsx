/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import CatalogServiceSelector from '../CatalogServiceSelector';

describe('Test CatalogServiceEditor', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the component with defaults', () => {
        ReactDOM.render(<CatalogServiceSelector services={[]} />, document.getElementById("container"));
        expect(document.getElementById('container')).toBeTruthy();
        expect(document.querySelector('input')).toBeTruthy();
        expect(document.querySelector('.glyphicon-pencil')).toBeFalsy();
        expect(document.querySelector('.glyphicon-plus')).toBeFalsy();
    });
    it('test isValidServiceSelected', () => {
        ReactDOM.render(<CatalogServiceSelector services={[]} canEdit />, document.getElementById("container"));
        expect(document.getElementById('container')).toBeTruthy();
        expect(document.querySelector('input')).toBeTruthy();
        expect(document.querySelector('.glyphicon-pencil')).toBeFalsy();
        expect(document.querySelector('.glyphicon-plus')).toBeTruthy();
    });
    it('test isValidServiceSelected & canEdit', () => {
        ReactDOM.render(<CatalogServiceSelector services={[]} isValidServiceSelected canEdit />, document.getElementById("container"));
        expect(document.getElementById('container')).toBeTruthy();
        expect(document.querySelector('input')).toBeTruthy();
        expect(document.querySelector('.glyphicon-pencil')).toBeTruthy();
        expect(document.querySelector('.glyphicon-plus')).toBeTruthy();
    });
});
