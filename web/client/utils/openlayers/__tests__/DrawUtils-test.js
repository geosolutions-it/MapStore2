/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const {createOLGeometry, isPolygon} = require('../DrawUtils');
const expect = require('expect');


describe('DrawUtils openlayers', () => {

    it('test createOLGeometry defaults', () => {
        const geom = createOLGeometry();
        expect(geom).toExist();
        expect(geom.getType()).toBe("Polygon");
    });
    it('test createOLGeometry LineString', () => {
        // empty geom
        const type = "LineString";
        const coordinates = [[1, 1], [0, 0]];

        let geom = createOLGeometry({type});
        expect(geom).toExist();
        expect(geom.getType()).toBe(type);
        expect(geom.getCoordinates().length).toBe(0);

        geom = createOLGeometry({type, coordinates});
        expect(geom).toExist();
        expect(geom.getType()).toBe(type);
        expect(geom.getCoordinates().length).toBe(coordinates.length);
        expect(geom.getCoordinates()).toEqual(coordinates);
    });
    it('test createOLGeometry Point', () => {
        // empty geom
        const type = "Point";
        const coordinates = [1, 1];

        let geom = createOLGeometry({type});
        expect(geom).toExist();
        expect(geom.getType()).toBe(type);
        expect(geom.getCoordinates().length).toBe(0);

        geom = createOLGeometry({type, coordinates});
        expect(geom).toExist();
        expect(geom.getType()).toBe(type);
        expect(geom.getCoordinates().length).toBe(coordinates.length);
        expect(geom.getCoordinates()).toEqual(coordinates);
    });
    it('test createOLGeometry MultiPoint', () => {
        // empty geom
        const type = "MultiPoint";
        const coordinates = [[1, 1], [0, 0]];

        let geom = createOLGeometry({type});
        expect(geom).toExist();
        expect(geom.getType()).toBe(type);
        expect(geom.getCoordinates().length).toBe(0);

        geom = createOLGeometry({type, coordinates});
        expect(geom).toExist();
        expect(geom.getType()).toBe(type);
        expect(geom.getCoordinates().length).toBe(coordinates.length);
        expect(geom.getCoordinates()).toEqual(coordinates);
    });
    it('test createOLGeometry MultiLineString', () => {
        // empty geom
        const type = "MultiLineString";
        const coordinates = [ [[1, 1], [0, 0]], [[21, 21], [20, 20]]];

        let geom = createOLGeometry({type});
        expect(geom).toExist();
        expect(geom.getType()).toBe(type);
        expect(geom.getCoordinates().length).toBe(0);

        geom = createOLGeometry({type, coordinates});
        expect(geom).toExist();
        expect(geom.getType()).toBe(type);
        expect(geom.getCoordinates().length).toBe(coordinates.length);
        expect(geom.getCoordinates()).toEqual(coordinates);
    });
    it('test createOLGeometry MultiPolygon', () => {
        // empty geom
        const type = "MultiPolygon";
        const coordinates = [[ [[1, 1], [0, 0]], [[21, 21], [20, 20]]]];

        let geom = createOLGeometry({type});
        expect(geom).toExist();
        expect(geom.getType()).toBe(type);
        expect(geom.getCoordinates().length).toBe(0);

        geom = createOLGeometry({type, coordinates});
        expect(geom).toExist();
        expect(geom.getType()).toBe(type);
        expect(geom.getCoordinates().length).toBe(coordinates.length);
        expect(geom.getCoordinates()).toEqual(coordinates);
    });
    it('test createOLGeometry Circle', () => {
        // empty geom
        const type = "Polygon";
        const radius = 100;
        const center = {x: 1, y: 1};

        let geom = createOLGeometry({type});
        expect(geom).toExist();
        expect(geom.getType()).toBe(type);
        expect(geom.getCoordinates().length).toBe(0);

        geom = createOLGeometry({type, radius, center});
        expect(geom).toExist();
        expect(geom.getType()).toBe(type);
        expect(geom.getCoordinates().length).toBe(1);
        expect(geom.getCoordinates()[0].length).toBe(101);
    });

    it('test isPolygon', () => {
        expect(isPolygon()).toBeFalsy();
    });

});
