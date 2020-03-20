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

import SearchBar from '../SearchBar';

describe('SearchBar component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('SearchBar with defaults', () => {
        ReactDOM.render(<SearchBar showAdvancedSearchPanel/>, document.getElementById("container"));
        const rootDiv = document.getElementsByClassName('MapSearchBar')[0];
        expect(rootDiv).toExist();
        const advancedPanel = document.getElementsByClassName('advanced-search-panel')[0];
        expect(advancedPanel).toExist();
    });
});
