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
        ReactDOM.render(<Sink selectedMapId={'MAP_ID'} maps={[{center: {x: 1, y: 1}, mapId: 'MAP_ID'}]} dependencies={{center: {x: 2, y: 2}}}/>, document.getElementById("container"));
    });
    it('dependenciesToMapProp rendering with mapSync', (done) => {
        const Sink = dependenciesToMapProp('center')(createSink(props => {
            expect(props.map.center.x).toBe(2);
            expect(props.map.center.y).toBe(2);
            done();
        }));
        ReactDOM.render(<Sink mapSync selectedMapId={'MAP_ID'} maps={[{center: {x: 1, y: 1}, mapId: 'MAP_ID'}]} dependencies={{ center: { x: 2, y: 2 } }} />, document.getElementById("container"));
    });
    it('dependenciesToMapProp for center rendering with selectedMapId and mapSync', (done) => {
        const Sink = dependenciesToMapProp('center')(createSink(props => {
            expect(props.map.center.x).toBe(2);
            expect(props.map.center.y).toBe(2);
            expect(props.maps).toEqual([{"center": {"x": 2, "y": 2}, "mapId": "MAP_ID"}]);
            done();
        }));
        ReactDOM.render(<Sink mapSync selectedMapId={'MAP_ID'} maps={[{center: {x: 1, y: 1}, mapId: 'MAP_ID'}]} dependencies={{ center: { x: 2, y: 2 } }} />, document.getElementById("container"));
    });
    it('dependenciesToMapProp rendering for zoom with selectedMapId and mapSync', (done) => {
        const Sink = dependenciesToMapProp('zoom')(createSink(props => {
            expect(props.mapSync).toBeTruthy();
            expect(props.maps).toEqual([{zoom: 7, mapId: "MAP_ID"}]);
            expect(props.map.zoom).toBe(7);
            done();
        }));
        ReactDOM.render(<Sink mapSync selectedMapId={'MAP_ID'} maps={[{zoom: 8, mapId: 'MAP_ID'}]} dependencies={{ zoom: 7 }} />, document.getElementById("container"));
    });
});
