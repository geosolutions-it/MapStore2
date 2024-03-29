/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';

import handleNodeSelection from '../handleNodeSelection';

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
            expect(props).toBeTruthy();
            expect(props.onNodeSelect).toBeTruthy();
            props.onNodeSelect('LAYER', 'layer');
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
