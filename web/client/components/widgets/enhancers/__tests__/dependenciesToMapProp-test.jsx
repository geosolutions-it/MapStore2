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

import dependenciesToMapProp from '../dependenciesToMapProp';

describe('dependenciesToMapProp enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('dependenciesToMapProp rendering with defaults', (done) => {
        const Sink = dependenciesToMapProp('center')(createSink( props => {
            expect(props.map.center.x).toBe(1);
            expect(props.map.center.y).toBe(1);
            done();
        }));
        ReactDOM.render(<Sink map={{center: {x: 1, y: 1}}} dependencies={{center: {x: 2, y: 2}}}/>, document.getElementById("container"));
    });
    it('dependenciesToMapProp rendering with mapSync', (done) => {
        const Sink = dependenciesToMapProp('center')(createSink(props => {
            expect(props.map.center.x).toBe(2);
            expect(props.map.center.y).toBe(2);
            done();
        }));
        ReactDOM.render(<Sink mapSync map={{ center: { x: 1, y: 1 } }} dependencies={{ center: { x: 2, y: 2 } }} />, document.getElementById("container"));
    });
});
