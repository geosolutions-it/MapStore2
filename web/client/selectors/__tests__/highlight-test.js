/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    selectedFeatures
} = require('../highlight');

const idFt1 = "idFt1";
const idFt2 = "idFt2";
const modeEdit = "edit";
let feature1 = {
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [1, 2]
    },
    id: idFt1,
    properties: {
        someProp: "someValue"
    }
};
let feature2 = {
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [1, 2]
    },
    id: idFt2,
    properties: {
        someProp: "someValue"
    }
};
const initialState = {
    featuregrid: {
        mode: modeEdit,
        select: [feature1, feature2],
        changes: [feature2]
    },
    highlight: {
        featuresPath: "featuregrid.select"
    }
};

describe('Test highlight selectors', () => {
    it('test if there are some selected features', () => {
        const features = selectedFeatures(initialState);
        expect(features).toExist();
        expect(features.length).toBe(2);
    });

    it('test if there are not some selected features', () => {
        initialState.featuregrid.select = [];
        const features = selectedFeatures(initialState);
        expect(features).toExist();
        expect(features.length).toBe(0);
    });
});
