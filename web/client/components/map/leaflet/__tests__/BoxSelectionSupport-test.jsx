/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const L = require('leaflet');

import BoxSelectionSupport from '../BoxSelectionSupport';

describe('Leaflet BoxSelectionSupport', () => {
    let msNode;

    beforeEach((done) => {
        // Mock useEffect implementation to run given callback synchronously
        expect.spyOn(React, "useEffect").andCall(f => f());
        document.body.innerHTML = '<div id="map" style="heigth: 100px; width: 100px"></div><div id="ms"></div>';
        msNode = document.getElementById('ms');
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(msNode);
        document.body.innerHTML = '';
        msNode = undefined;
        setTimeout(done);
    });

    it('should call the onBoxEnd function when draw:created is fired', () => {
        let map = L.map("map", {
            center: [51.505, -0.09],
            zoom: 13
        });

        const actions = {
            onBoxEnd: () => {}
        };

        const spyOnBoxEnd = expect.spyOn(actions, 'onBoxEnd');
        const cmp = ReactDOM.render(<BoxSelectionSupport map={map} status="start" {...actions} />, msNode);
        expect(cmp).toBe(null); // using a stateless component, ReactDOM.render() returns null
        map.fire('draw:created');
        expect(spyOnBoxEnd).toHaveBeenCalled();
    });
});

