/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const draw = require('../draw');
const {GEOMETRY_CHANGED, SET_CURRENT_STYLE} = require('../../actions/draw');


describe('Test the draw reducer', () => {

    it('returns the initial state on unrecognized action', () => {

        const initialState = {
            drawStatus: null,
            drawOwner: null,
            drawMethod: null,
            features: []
        };

        let state = draw(initialState, {type: 'UNKNOWN'});
        expect(state).toBe(initialState);
    });

    it('Change the drawing status', () => {
        let testAction = {
            type: "CHANGE_DRAWING_STATUS",
            status: "start",
            method: "Circle",
            owner: "queryform",
            features: []
        };

        let initialState = {
            drawStatus: null,
            drawOwner: null,
            drawMethod: null,
            features: []
        };

        let state = draw(initialState, testAction);
        expect(state).toExist();

        expect(state.drawStatus).toBe("start");
        expect(state.drawOwner).toBe("queryform");
        expect(state.drawMethod).toBe("Circle");
        expect(state.features.length).toBe(0);
    });

    it('FeatureGrid GEOMETRY_CHANGED', () => {
        const style = {
            fill: {
                color: "red"
            }
        };
        let testAction = {
            type: SET_CURRENT_STYLE,
            currentStyle: style
        };
        let state = draw({}, testAction);
        expect(state.currentStyle).toExist();
        expect(state.currentStyle).toBe(style);
    });
    it('FeatureGrid GEOMETRY_CHANGED', () => {
        const feature = {
            geometry: {
                type: "Point",
                coordinates: []
            }
        };
        let testAction = {
            type: GEOMETRY_CHANGED,
            features: [feature]
        };
        let state = draw({}, testAction);
        expect(state.tempFeatures).toExist();
        expect(state.tempFeatures[0]).toBe(feature);
    });
});
