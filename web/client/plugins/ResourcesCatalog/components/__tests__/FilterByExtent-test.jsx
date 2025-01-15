
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
import FilterByExtent from '../FilterByExtent';
import { waitFor } from '@testing-library/react';

describe('FilterByExtent component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', (done) => {
        ReactDOM.render(<FilterByExtent />, document.getElementById('container'));
        const filterByExtent = document.querySelector('.ms-filter-by-extent');
        expect(filterByExtent).toBeTruthy();
        waitFor(() => expect(document.querySelector('#ms-filter-by-extent-map')).toBeTruthy())
            .then(() => {
                const mapContainerNode = document.querySelector('.ms-filter-by-extent-map');
                expect(mapContainerNode.style.pointerEvents).toBe('none');
                expect(mapContainerNode.style.opacity).toBe('0.4');
                done();
            })
            .catch(done);
    });
    it('should enable map when extent is provided', (done) => {
        ReactDOM.render(<FilterByExtent
            extent="-10,-10,10,10"
        />, document.getElementById('container'));
        const filterByExtent = document.querySelector('.ms-filter-by-extent');
        expect(filterByExtent).toBeTruthy();
        waitFor(() => expect(document.querySelector('#ms-filter-by-extent-map')).toBeTruthy())
            .then(() => {
                const mapContainerNode = document.querySelector('.ms-filter-by-extent-map');
                expect(mapContainerNode.style.pointerEvents).toBe('auto');
                expect(mapContainerNode.style.opacity).toBe('1');
                done();
            })
            .catch(done);
    });
});
