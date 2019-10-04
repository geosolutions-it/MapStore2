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
const mapToNodes = require('../mapToNodes');

describe('mapToNodes enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('mapToNodes rendering with defaults', (done) => {
        const Sink = mapToNodes(createSink( props => {
            expect(props).toExist();
            expect(props.nodes).toExist();
            expect(props.nodes.length).toBe(1);
            const gNode = props.nodes[0];
            expect(gNode.name).toBe("GGG");
            expect(gNode.title).toBe("GGG");
            expect(gNode.id).toBe("GGG");
            expect(gNode.nodes.length).toBe(1);
            const lNode = gNode.nodes[0];
            expect(lNode.id).toBe("LAYER");
            expect(lNode.name).toBe("LAYER");
            expect(lNode.group).toBe("GGG");
            expect(lNode.options).toExist();
            done();
        }));
        ReactDOM.render(<Sink
            map={{ groups: [{ id: 'GGG' }], layers: [{ id: "LAYER", name: "LAYER", group: "GGG", options: {} }] }}
        />, document.getElementById("container"));
    });
});
