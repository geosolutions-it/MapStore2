/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const PrintUtils = require('../PrintUtils');

const layer = {
    url: "http://mygeoserver",
    name: "my:layer",
    type: "wms",
    params: {myparam: "myvalue"}
};

const vectorLayer = {
    "type": "vector",
    "visibility": true,
    "group": "Local shape",
    "id": "web2014all_mv__14",
    "name": "web2014all_mv",
    "hideLoading": true,
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -112.50042920000001,
                    42.22829164089942
                ]
            },
            "properties": {
                "serial_num": "12C324776"
            },
            "id": 0
        }
    ],
    "style": {
        "weight": 3,
        "radius": 10,
        "opacity": 1,
        "fillOpacity": 0.1,
        "color": "rgb(0, 0, 255)",
        "fillColor": "rgb(0, 0, 255)"
    }
};
const mapFishVectorLayer = {
    "type": "Vector",
    "name": "web2014all_mv",
    "opacity": 1,
    "styleProperty": "ms_style",
    "styles": {
        "1": {
            "fillColor": "rgb(0, 0, 255)",
            "fillOpacity": 0.1,
            "pointRadius": 10,
            "strokeColor": "rgb(0, 0, 255)",
            "strokeOpacity": 1,
            "strokeWidth": 3
        }
    },
    "geoJson": {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -12523490.492568726,
                        5195238.005360028
                    ]
                },
                "properties": {
                    "serial_num": "12C324776",
                    "ms_style": 1
                },
                "id": 0
            }
        ]
    }
};

const testSpec = {
    "antiAliasing": true,
    "iconSize": 24,
    "legendDpi": 96,
    "fontFamily": "Verdana",
    "fontSize": 8,
    "bold": false,
    "italic": false,
    "resolution": "96",
    "name": "",
    "description": "",
    "sheet": "A2",
    "includeLegend": true,
    "twoPages": true,
    "center": {
        "x": 8.930511,
        "y": 44.417107,
        "crs": "EPSG:4326"
    },
    "zoom": 11,
    "scaleZoom": 3,
    "scale": 50000,
    "layers": [
        {
            "group": "background",
            "source": "osm",
            "name": "mapnik",
            "title": "Open Street Map",
            "type": "osm",
            "visibility": true,
            "singleTile": false,
            "dimensions": [],
            "id": "mapnik__0",
            "loading": false,
            "loadingError": false
        }
    ],
    "projection": "EPSG:900913",
    "size": {
        "height": 462,
        "width": 368
    }
};
describe('PrintUtils', () => {

    it('custom params are applied to wms layers', () => {

        const specs = PrintUtils.getMapfishLayersSpecification([layer], {}, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].customParams.myparam).toExist();
        expect(specs[0].customParams.myparam).toBe("myvalue");
    });
    it('vector layer generation for print', () => {
        const specs = PrintUtils.getMapfishLayersSpecification([vectorLayer], {projection: "EPSG:3857"}, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].geoJson.features[0].geometry.coordinates[0], mapFishVectorLayer).toBe(mapFishVectorLayer.geoJson.features[0].geometry.coordinates[0]);
    });
    it('vector layer generation for legend', () => {
        const specs = PrintUtils.getMapfishLayersSpecification([layer], {projection: "EPSG:3857"}, 'legend');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
    });
    it('vector layer default point style', () => {
        const style = PrintUtils.getOlDefaultStyle({features: [{geometry: {type: "Point"}}]});
        expect(style).toExist();
        expect(style.pointRadius).toBe(5);
    });
    it('vector layer default marker style', () => {
        const style = PrintUtils.getOlDefaultStyle({styleName: "marker", features: [{geometry: {type: "Point"}}]});
        expect(style).toExist();
        expect(style.externalGraphic).toExist();
    });
    it('vector layer default polygon style', () => {
        const style = PrintUtils.getOlDefaultStyle({features: [{geometry: {type: "Polygon"}}]});
        expect(style).toExist();
        expect(style.strokeWidth).toBe(3);

    });
    it('vector layer default line style', () => {
        const style = PrintUtils.getOlDefaultStyle({features: [{geometry: {type: "LineString"}}]});
        expect(style).toExist();
        expect(style.strokeWidth).toBe(3);
    });
    it('toAbsoluteUrl', () => {
        const url = PrintUtils.toAbsoluteURL("/geoserver", "http://localhost:8080");
        expect(url).toExist();
        expect(url).toBe("http://localhost:8080/geoserver");
        expect(PrintUtils.toAbsoluteURL("//someurl/geoserver").indexOf("http")).toBe(0);
    });
    it('getMapSize', () => {
        expect(PrintUtils.getMapSize()).toExist(); // check defaults
        expect(PrintUtils.getMapSize({map: {width: 200, height: 200}}, 150).height).toBe(150);
        expect(PrintUtils.getMapSize({rotation: true, map: {width: 200, height: 100}}, 200).height).toBe(400);
    });
    it('getNearestZoom', () => {
        const scales = [1000, 1000, 1000000, 10000000];
        expect(PrintUtils.getNearestZoom(0, scales)).toBe(0);
    });
    it('getMapfishPrintSpecification', () => {
        const printSpec = PrintUtils.getMapfishPrintSpecification(testSpec);
        expect(printSpec).toExist();
        expect(printSpec.dpi).toBe(96);
        expect(printSpec.layers.length).toBe(1);
    });
});
