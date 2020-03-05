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
const onMapViewChanges = require('../onMapViewChanges');

describe('onMapViewChanges enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('onMapViewChanges rendering with defaults', () => {
        const Sink = onMapViewChanges(createSink( props => {
            expect(props.eventHandlers.onMapViewChanges).toBeTruthy();
            setTimeout(props.eventHandlers.onMapViewChanges("CENTER", "ZOOM", { bbox: { x: 2 } }, "SIZE", "mapStateSource", "projection"));

        }));
        const actions = {
            onMapViewChanges: () => {}
        };
        const spy = expect.spyOn(actions, 'onMapViewChanges');
        ReactDOM.render(<Sink map={{ bbox: { x: 1, y: 1 }, test: "TEST" }} onMapViewChanges={actions.onMapViewChanges} />, document.getElementById("container"));
        expect(spy).toHaveBeenCalled();
        const map = spy.mock.calls[0][0];
        expect(map).toBeTruthy();
        expect(map.center).toBeTruthy();
        expect(map.zoom).toBeTruthy();
        expect(map.bbox).toBeTruthy();
        expect(map.size).toBeTruthy();
        expect(map.mapStateSource).toBeTruthy();
        expect(map.projection).toBeTruthy();
    });

});
