/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import CatalogSearchInput from '../datasets/CatalogSearchInput';

describe('CatalogSearchInput component', () => {
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
        ReactDOM.render(<CatalogSearchInput
            searchText=""
            onChangeText={() => {}}
        />, document.getElementById('container'));
        const node = document.querySelector('.ms-resources-search-field');
        expect(node).toBeTruthy();
    });
});
