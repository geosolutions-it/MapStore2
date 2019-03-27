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
const handleNodeSelection = require('../handleNodeSelection');

describe('handleNodeSelection enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('handleNodeSelection rendering with defaults', (done) => {
        const Sink = handleNodeSelection(createSink( props => {
            expect(props).toExist();
            expect(props.onNodeSelect).toExist();
            props.onNodeSelect('LAYER', "layers");
            // after onNodeSelect call the selectedNodes array is populated
            if (props.selectedNodes && props.selectedNodes.length === 1) {
                expect(props.selectedNodes[0]).toBe('LAYER');
                done();
            }
        }));
        ReactDOM.render(<Sink
            map={{ groups: [{ id: 'GGG' }], layers: [{ id: "LAYER", group: "GGG", options: {} }] }}
        />, document.getElementById("container"));
    });
});
