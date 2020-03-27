/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';
import expect from 'expect';
import withSelectedNode from '../withSelectedNode';
import {isEmpty, isNull} from 'lodash';

describe('withSelectedNode enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('withSelectedNode selecting node from default group', (done) => {
        const Sink = withSelectedNode(createSink( (props) => {

            expect(props).toExist();
            expect(props.editNode).toExist();
            expect(isEmpty(props.nodes)).toBe(false);
            expect(isEmpty(props.selectedNode)).toBe(false);
            expect(props.selectedNode).toEqual({id: "layer1"});
            done();
        }));
        const nodeVal = {nodes: [{id: "Default", nodes: [{id: "layer1" }]}, {id: "Meteo", nodes: [{id: "layer2" }]}]};
        ReactDOM.render( <Sink nodes={nodeVal} editNode={"layer1"} />, document.getElementById("container"));
    });

    it('withSelectedNode selecting node from a subgroup of Default', (done) => {
        const Sink = withSelectedNode(createSink( (props) => {
            expect(props).toExist();
            expect(props.editNode).toExist();
            expect(isEmpty(props.nodes)).toBe(false);
            expect(isEmpty(props.selectedNode)).toBe(false);
            expect(isNull(props.selectedNode)).toBe(false);
            expect(props.selectedNode).toEqual({id: "layer2"});
            expect(props.selectedNode).toNotEqual({id: "layer1"});
            done();
        }));
        const nodeVal = {nodes: [{id: "Default", nodes: [{id: "layer1"}]}, {id: "Meteo", nodes: [{id: "layer2"}]}]};
        ReactDOM.render(<Sink nodes={nodeVal} editNode={"layer2"} />, document.getElementById("container"));
    });

    it('withSelectedNode selecting node from other group', (done) => {
        const Sink = withSelectedNode(createSink( (props) => {
            expect(props).toExist();
            expect(props.editNode).toExist();
            expect(isEmpty(props.nodes)).toBe(false);
            expect(isEmpty(props.selectedNode)).toBe(false);
            expect(isNull(props.selectedNode)).toBe(false);
            expect(props.selectedNode).toEqual({id: "layer2"});
            done();
        }));
        const nodeVal = {nodes: [{id: "Default"}, {id: "someotherGroup", nodes: [{id: "layer1"}, {id: "Meteo", nodes: [{id: "layer2"}]}]}]};
        ReactDOM.render(<Sink nodes={nodeVal} editNode={"layer2"} />, document.getElementById("container"));
    });
});
