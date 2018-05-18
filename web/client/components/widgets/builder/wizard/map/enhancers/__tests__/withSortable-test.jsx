/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const withSortable = require('../withSortable');

describe('withSortable enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('withSortable rendering with defaults', (done) => {
        const Sink = withSortable(createSink( props => {
            expect(props).toExist();
            props.onSort('GROUP', [1, 0]);
        }));
        ReactDOM.render(<Sink
            map={{ groups: [{ id: 'GROUP' }], layers: [{ id: "LAYER_1", group: "GROUP", options: {} }, { id: "LAYER_2", group: "GROUP", options: {} }] }}
            updateMapEntries={({layers}) => {
                expect(layers.length).toBe(2);
                expect(layers[0].id).toBe("LAYER_2");
                done();
            }}/>, document.getElementById("container"));
    });
});
