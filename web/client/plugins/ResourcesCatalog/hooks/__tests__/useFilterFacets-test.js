/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import useFilterFacets from '../useFilterFacets';
import expect from 'expect';
import { act } from 'react-dom/test-utils';
import { waitFor } from '@testing-library/react';

const Component = (props) => {
    const { fields } = useFilterFacets(props);
    return <ul>{fields.map((field, idx) => <li key={idx}>{field.label}</li>)}</ul>;
};

describe('useFilterFacets', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should not send the request if the facet property is missing', () => {
        act(() => {
            ReactDOM.render(<Component
                query={{}}
                fields={[{ label: 'test' }]}
                request={() => Promise.resolve(null)}
            />, document.getElementById("container"));
        });
        expect(document.querySelector('ul').children.length).toBe(1);
    });
    it('should send the request if the facet property is available in a field item', (done) => {
        act(() => {
            ReactDOM.render(<Component
                query={{}}
                visible
                fields={[{ facet: 'test' }]}
                request={() => Promise.resolve({ fields: [{ label: 'test', facet: 'test' }] })}
            />, document.getElementById("container"));
        });
        expect(document.querySelector('ul').children.length).toBe(1);
        expect(document.querySelector('ul').children[0].innerHTML).toBe('');
        waitFor(() => expect(document.querySelector('ul').children[0].innerHTML).toBe('test'))
            .then(() => done());
    });
});
