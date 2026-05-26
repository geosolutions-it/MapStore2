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
import CatalogContentView from '../datasets/CatalogContentView';

describe('CatalogContentView component', () => {
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
        ReactDOM.render(<CatalogContentView
            records={[]}
            total={0}
            selectedLayers={[]}
            getRecordStatus={() => ({ isChecked: false, disabled: false, loading: false })}
        />, document.getElementById('container'));
        const node = document.querySelector('.ms-catalog-content-view');
        expect(node).toBeTruthy();
    });
});
