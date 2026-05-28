
/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import FiltersForm from '../FiltersForm';

describe('FilterForm component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<FiltersForm />, document.getElementById('container'));
        const filtersForm = document.querySelector('.ms-filters-form');
        expect(filtersForm).toBeTruthy();
    });
    it('should disable clear button when query only contains defaultQuery keys', () => {
        ReactDOM.render(
            <FiltersForm
                query={{ f: 'featured' }}
                defaultQuery={{ f: 'featured' }}
            />,
            document.getElementById('container')
        );
        const clearButton = document.querySelector('.ms-filters-form button');
        expect(clearButton).toBeTruthy();
        expect(clearButton.disabled).toBe(true);
    });
    it('should enable clear button when query has keys beyond defaultQuery', () => {
        ReactDOM.render(
            <FiltersForm
                query={{ f: 'featured', filter: 'someTerm' }}
                defaultQuery={{ f: 'featured' }}
            />,
            document.getElementById('container')
        );
        const clearButton = document.querySelector('.ms-filters-form button');
        expect(clearButton).toBeTruthy();
        expect(clearButton.disabled).toBe(false);
    });
    it('should disable clear button when query only contains built-in excluded keys and defaultQuery keys', () => {
        ReactDOM.render(
            <FiltersForm
                query={{ d: '1', page: '2', sort: 'name', f: 'featured' }}
                defaultQuery={{ f: 'featured' }}
            />,
            document.getElementById('container')
        );
        const clearButton = document.querySelector('.ms-filters-form button');
        expect(clearButton).toBeTruthy();
        expect(clearButton.disabled).toBe(true);
    });
    it('should disable clear button with empty query and empty defaultQuery', () => {
        ReactDOM.render(
            <FiltersForm
                query={{}}
                defaultQuery={{}}
            />,
            document.getElementById('container')
        );
        const clearButton = document.querySelector('.ms-filters-form button');
        expect(clearButton).toBeTruthy();
        expect(clearButton.disabled).toBe(true);
    });
});
