
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
import FilterAccordion from '../FilterAccordion';
import { waitFor } from '@testing-library/react';
import { Simulate } from 'react-dom/test-utils';

describe('FilterAccordion component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        localStorage.removeItem('accordionsExpanded');
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<FilterAccordion />, document.getElementById('container'));
        const filterAccordion = document.querySelector('.ms-filter-accordion');
        expect(filterAccordion).toBeTruthy();
    });
    it('should expand and show the items', () => {
        ReactDOM.render(<FilterAccordion
            items={[
                { name: 'Item 1' },
                { name: 'Item 2' }
            ]}
            content={(items) => {
                return <ul>{items.map((item, idx) => <li key={idx}>{item.name}</li>)}</ul>;
            }}
        />, document.getElementById('container'));
        const filterAccordion = document.querySelector('.ms-filter-accordion');
        expect(filterAccordion).toBeTruthy();
        expect(filterAccordion.querySelectorAll('li').length).toBe(0);
        Simulate.click(document.querySelector('button'));
        expect(filterAccordion.querySelectorAll('li').length).toBe(2);
    });
    it('should expand and show loaded items', (done) => {
        ReactDOM.render(<FilterAccordion
            loadItems={() => {
                return Promise.resolve({
                    items: [
                        { name: 'Item 1' },
                        { name: 'Item 2' }
                    ]
                });
            }}
            content={(items) => {
                return <ul>{items.map((item, idx) => <li key={idx}>{item.name}</li>)}</ul>;
            }}
        />, document.getElementById('container'));
        const filterAccordion = document.querySelector('.ms-filter-accordion');
        expect(filterAccordion).toBeTruthy();
        Simulate.click(document.querySelector('button'));
        waitFor(() => expect(filterAccordion.querySelectorAll('li').length).toBe(2))
            .then(() => {
                done();
            })
            .catch(done);
    });
});
