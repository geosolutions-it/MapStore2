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
const handleNodeFiltering = require('../handleNodeFiltering');

describe('handleNodeFiltering enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('handleNodeFiltering rendering nodes defaults', (done) => {
        const Sink = handleNodeFiltering(createSink( props => {
            expect(props).toExist();
            expect(props.nodes).toExist();
            expect(props.nodes[0]).toExist();
            expect(props.nodes[0].showComponent).toBe(true);
            done();
        }));
        ReactDOM.render(<Sink nodes={[{ id: "node1", nodes: [{id: "node1.1"}]}]}/>, document.getElementById("container"));
    });
});
