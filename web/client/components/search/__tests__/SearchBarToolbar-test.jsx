/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import SearchBarToolbar from '../SearchBar';

describe('SearchBarToolbar component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('SearchBarToolbar with defaults', () => {
        ReactDOM.render(<SearchBarToolbar/>, document.getElementById("container"));
        const rootSpan = document.getElementsByClassName('search-toolbar-options')[0];
        expect(rootSpan).toExist();
    });
});
