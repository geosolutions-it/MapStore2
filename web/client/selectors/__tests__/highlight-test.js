/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    selectedFeatures, filteredspatialObject, filteredspatialObjectCoord,
    filteredGeometry, filteredSpatialObjectId, filteredSpatialObjectCrs,
    filteredspatialObjectType, filteredFeatures, highlighedFeatures} = require('../highlight');

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

let feature3 = [{
    type: "Feature",
    geometry: {
        type: 'Polygon',
        coordinates: [ [ 0.000008983152841195214, 0.000017966305681987637 ] ]
    },
    style: {
        fillColor: '#FFFFFF',
        fillOpacity: '0.2',
        color: '#ffcc33'
    },
    id: 'spatial_object'
}];
const initialState = {
    featuregrid: {
        mode: modeEdit,
        select: [feature1, feature2],
        changes: [feature2],
        showFilteredObject: true,
        open: true
    },
    highlight: {
        featuresPath: "featuregrid.select"
    },
    query: {
        filterObj: {
            spatialField: {
                geometry: {
                    type: 'Polygon',
                    coordinates: [[ 1, 2]],
                    projection: 'EPSG:3857',
                    id: 'spatial_object'

                }
            }
        }
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
    it('test filteredspatialObject', () => {
        const spatialObject = initialState.query.filterObj.spatialField;
        const features = filteredspatialObject(initialState);
        expect(features).toExist();
        expect(features).toBe(spatialObject);
    });
    it('test filteredspatialObject with empty state', () => {
        expect(filteredspatialObject({})).toBe(undefined);
    });
    it('test filteredGeometry', () => {
        const geometry = initialState.query.filterObj.spatialField.geometry;
        const features = filteredGeometry(initialState);
        expect(features).toExist();
        expect(features).toBe(geometry);
    });
    it('test filteredspatialObjectCoord', () => {
        const coordinates = initialState.query.filterObj.spatialField.geometry.coordinates;
        const features = filteredspatialObjectCoord(initialState);
        expect(features).toExist();
        expect(features).toBe(coordinates);
    });
    it('test filteredSpatialObjectId', () => {
        const geometryId = initialState.query.filterObj.spatialField.geometry.id;
        const features = filteredSpatialObjectId(initialState);
        expect(features).toExist();
        expect(features).toBe(geometryId);
    });
    it('test filteredSpatialObjectCrs', () => {
        const geometryCrs = initialState.query.filterObj.spatialField.geometry.projection;
        const features = filteredSpatialObjectCrs(initialState);
        expect(features).toExist();
        expect(features).toBe(geometryCrs);
    });
    it('test filteredspatialObjectType', () => {
        const geometryType = initialState.query.filterObj.spatialField.geometry.type;
        const features = filteredspatialObjectType(initialState);
        expect(features).toExist();
        expect(features).toBe(geometryType);
    });
    it('test filteredFeatures', () => {
        const features = filteredFeatures(initialState);
        expect(features).toExist();
        expect(features).toEqual(feature3);
    });
    it('test highlighedFeatures', () => {
        const features = highlighedFeatures(initialState);
        const featuresSelected = initialState.featuregrid.select;
        const combinedFeatures = [...featuresSelected, ...feature3];
        expect(features).toExist();
        expect(features).toEqual(combinedFeatures);
    });
});
