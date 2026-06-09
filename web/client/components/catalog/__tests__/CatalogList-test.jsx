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
import CatalogList from '../datasets/CatalogList';

describe('CatalogList component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default empty records', () => {
        ReactDOM.render(<CatalogList
            records={[]}
            getRecordStatus={() => ({ isChecked: false, disabled: false, loading: false })}
        />, document.getElementById('container'));
        const list = document.querySelector('.ms-catalog-list');
        expect(list).toBeTruthy();
    });
});
