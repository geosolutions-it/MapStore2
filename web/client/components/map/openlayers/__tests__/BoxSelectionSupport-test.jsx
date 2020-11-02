/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import BoxSelectionSupport from '../BoxSelectionSupport';

const testHandlers = {
    onBoxEnd: () => {}
};

let fakeMap;

describe('Test BoxSelectionSupport', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="map"></div><div id="container"></div>';
        fakeMap = {
            addLayer: () => {},
            getView: () => ({getProjection: () => ({getCode: () => "EPSG:3857"})}),
            disableEventListener: () => {},
            addInteraction: () => {},
            enableEventListener: () => {},
            removeInteraction: () => {},
            removeLayer: () => {},
            getInteractions: () => ({
                getLength: () => 0
            })
        };

        // Mock useEffect implementation to run given callback synchronously
        expect.spyOn(React, "useEffect").andCall(f => f());
        setTimeout(done);
    });

    afterEach((done) => {
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should add interactions from map when status is start', () => {
        const addInteractionSpy = expect.spyOn(fakeMap, 'addInteraction');
        ReactDOM.render(<BoxSelectionSupport status="start" map={fakeMap}/>, document.getElementById("container"));
        expect(addInteractionSpy).toHaveBeenCalled();

        // add select and dragBox interactions
        expect(addInteractionSpy.calls.length).toBe(2);
    });

    it('should remove interactions from map when status is end', () => {
        const removeInteractionSpy = expect.spyOn(fakeMap, 'removeInteraction');
        ReactDOM.render(<BoxSelectionSupport status="end" map={fakeMap}/>, document.getElementById("container"));
        expect(removeInteractionSpy).toHaveBeenCalled();

        // remove select and dragBox interactions
        expect(removeInteractionSpy.calls.length).toBe(2);
    });

});
