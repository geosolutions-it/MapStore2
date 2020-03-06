/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import MapCatalogPanel from '../MapCatalogPanel';

describe('MapCatalogPanel component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('MapCatalogPanel with defaults', () => {
        ReactDOM.render(<MapCatalogPanel/>, document.getElementById('container'));
        const rootDiv = document.getElementsByClassName('map-catalog-panel')[0];
        expect(rootDiv).toExist();
    });
});
