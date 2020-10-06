/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import { find } from 'lodash';

import PrintUtils from '../PrintUtils';
import ConfigUtils from '../ConfigUtils';
import { KVP1, REST1 } from '../../test-resources/layers/wmts';
import { poi as TMS110_1 } from '../../test-resources/layers/tms';
import { BasemapAT, NASAGIBS, NLS_CUSTOM_URL } from '../../test-resources/layers/tileprovider';


const layer = {
    url: "http://mygeoserver",
    name: "my:layer",
    type: "wms",
    params: { myparam: "myvalue" }
};

const layerSottoPasso = {
    id: 'DBT:SOTTOPASSO__6',
    type: 'wms',
    url: 'http://localhost:8081/geoserver-test/wms'
};

const layerFilterSottoPasso = {
    groupFields: [
        {
            id: 1,
            logic: 'OR',
            index: 0
        }
    ],
    filterFields: [
        {
            rowId: 1563970241851,
            groupId: 1,
            attribute: 'TIPO',
            operator: '=',
            value: 2,
            type: 'number',
            fieldOptions: {
                valuesCount: 0,
                currentPage: 1
            },
            exception: null
        }
    ],
    spatialField: {
        method: null,
        operation: 'INTERSECTS',
        geometry: null,
        attribute: 'GEOMETRY'
    }
};
const filterObjSottoPasso = {
    featureTypeName: 'DBT:SOTTOPASSO',
    filterType: 'OGC',
    ogcVersion: '1.1.0',
    pagination: {
        startIndex: 0,
        maxFeatures: 20
    },
    groupFields: [
        {
            id: 1,
            logic: 'AND',
            index: 0
        }
    ],
    filterFields: [
        {
            attribute: 'ID_OGGETTO',
            rowId: 1563970257711,
            type: 'number',
            groupId: 1,
            operator: '<',
            value: 44
        }
    ]
};

const featurePoint = {
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
};

const featureLine = {
    "type": "Feature",
    "geometry": {
        "type": "LineString",
        "coordinates": [
            -112.50042920000001,
            42.22829164089942,
            -113.50042920000001,
            42.22829164089942,
            -114.50042920000001,
            42.22829164089942
        ]
    },
    "properties": {
        "serial_num": "12C324776"
    },
    "id": 0
};

const featureCollection = {
    "type": "FeatureCollection",
    "features": [featureLine],
    "style": {
        "weight": 3,
        "radius": 10,
        "opacity": 1,
        "fillOpacity": 0.1,
        "color": "rgb(0, 0, 255)",
        "fillColor": "rgb(0, 0, 255)"
    }
};
const vectorLayer = {
    "type": "vector",
    "visibility": true,
    "group": "Local shape",
    "id": "web2014all_mv__14",
    "name": "web2014all_mv",
    "hideLoading": true,
    "features": [featurePoint],
    "style": {
        "weight": 3,
        "radius": 10,
        "opacity": 1,
        "fillOpacity": 0.1,
        "color": "rgb(0, 0, 255)",
        "fillColor": "rgb(0, 0, 255)"
    }
};

const annotationsVectorLayer = {
    "type": "vector",
    "visibility": true,
    "group": "Local shape",
    "id": "annotations",
    "name": "web2014all_mv",
    "hideLoading": true,
    "features": [featureCollection],
    "style": {
        "weight": 3,
        "radius": 10,
        "opacity": 1,
        "fillOpacity": 0.1,
        "color": "rgb(0, 0, 255)",
        "fillColor": "rgb(0, 0, 255)"
    }
};

const measurementVectorLayer = {
    "type": "vector",
    "visibility": true,
    "group": "Local shape",
    "id": "aaa",
    "name": "Measurements",
    "hideLoading": true,
    "features": [featureCollection],
    "style": {
        "weight": 3,
        "radius": 10,
        "opacity": 1,
        "fillOpacity": 0.1,
        "color": "rgb(0, 0, 255)",
        "fillColor": "rgb(0, 0, 255)"
    }
};
let vector2 = { ...vectorLayer };
delete vector2.style;
let vectorWithFtCollInside = {
    ...vectorLayer, features: [{
        type: "FeatureCollection",
        features: [featurePoint]
    }]
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
let rules;
describe('PrintUtils', () => {
    beforeEach(() => {
        rules = ConfigUtils.getConfigProp('authenticationRules');
        ConfigUtils.setConfigProp('useAuthenticationRules', false);
    });
    afterEach(() => {
        ConfigUtils.setConfigProp('authenticationRules', rules);
    });

    it('custom params are applied to wms layers', () => {

        const specs = PrintUtils.getMapfishLayersSpecification([layer], {}, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].customParams.myparam).toExist();
        expect(specs[0].customParams.myparam).toBe("myvalue");
    });
    it('vector layer generation for print', () => {
        const specs = PrintUtils.getMapfishLayersSpecification([vectorLayer], { projection: "EPSG:3857" }, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].geoJson.features[0].geometry.coordinates[0], mapFishVectorLayer).toBe(mapFishVectorLayer.geoJson.features[0].geometry.coordinates[0]);
    });
    it('vector layer from annotations are preprocessed for printing', () => {
        const specs = PrintUtils.getMapfishLayersSpecification([annotationsVectorLayer], { projection: "EPSG:3857" }, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].geoJson.features[0].properties.ms_style.strokeColor).toBe("rgb(0, 0, 255)");
    });
    it('vector layer from measurements are preprocessed for printing', () => {
        const specs = PrintUtils.getMapfishLayersSpecification([measurementVectorLayer], { projection: "EPSG:3857" }, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].geoJson.features[0].properties.ms_style.strokeColor).toBe("rgb(0, 0, 255)");
    });
    it('wms layer generation for legend', () => {
        const specs = PrintUtils.getMapfishLayersSpecification([layer], { projection: "EPSG:3857" }, 'legend');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
    });
    it('toOpenLayers2Style for vector layer wich contains a FeatureCollection using the default style', () => {
        const style = PrintUtils.toOpenLayers2Style(vectorWithFtCollInside, null, "FeatureCollection");
        expect(style).toExist();

        expect(style.strokeColor).toBe("#0000FF");
        expect(style.strokeOpacity).toBe(1);
        expect(style.strokeWidth).toBe(1);
        expect(style.pointRadius).toBe(5);
        expect(style.fillColor).toBe("#0000FF");
        expect(style.fillOpacity).toBe(0.1);
    });
    it('toOpenLayers2Style for vector layer using a default LineString style', () => {
        const style = PrintUtils.toOpenLayers2Style(vector2, null, "LineString");
        expect(style).toExist();
        expect(style.strokeColor).toBe("#0000FF");
        expect(style.strokeOpacity).toBe(1);
        expect(style.strokeWidth).toBe(3);
    });
    it('toOpenLayers2Style for vector layer using a default MultiPolygon style', () => {
        const style = PrintUtils.toOpenLayers2Style(vector2, null, "MultiPolygon");
        expect(style).toExist();
        expect(style.strokeColor).toBe("#0000FF");
        expect(style.fillColor).toBe("#0000FF");
        expect(style.fillOpacity).toBe(0.1);
        expect(style.strokeOpacity).toBe(1);
        expect(style.strokeLinecap).toBe("round");
        expect(style.strokeDashstyle).toBe("dash");
        expect(style.strokeWidth).toBe(3);
    });

    it('custom params include security token for wms layers', () => {
        ConfigUtils.setConfigProp('authenticationRules', [
            {
                "urlPattern": ".*geoserver.*",
                "method": "test",
                "authkeyParamName": "authkey",
                "token": "mykey"
            }
        ]);
        ConfigUtils.setConfigProp('useAuthenticationRules', true);
        const specs = PrintUtils.getMapfishLayersSpecification([layer], {}, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].customParams.authkey).toExist();
        expect(specs[0].customParams.authkey).toBe("mykey");
    });
    it('custom params include layerFilter and filterObj', () => {
        const specs = PrintUtils.getMapfishLayersSpecification([{
            ...layerSottoPasso,
            layerFilter: layerFilterSottoPasso,
            filterObj: filterObjSottoPasso
        }], {}, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].customParams.CQL_FILTER).toExist();
        expect(specs[0].customParams.CQL_FILTER).toBe(`(("TIPO" = '2')) AND (("ID_OGGETTO" < '44'))`);
    });
    it('custom params include cql_filter', () => {
        const specs = PrintUtils.getMapfishLayersSpecification([{
            ...layerSottoPasso,
            filterObj: filterObjSottoPasso
        }], {}, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].customParams.CQL_FILTER).toExist();
        expect(specs[0].customParams.CQL_FILTER).toBe(`("ID_OGGETTO" < '44')`);
    });
    it('custom params include layerFilter', () => {
        const specs = PrintUtils.getMapfishLayersSpecification([{
            ...layerSottoPasso,
            layerFilter: layerFilterSottoPasso
        }], {}, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].customParams.CQL_FILTER).toExist();
        expect(specs[0].customParams.CQL_FILTER).toBe(`("TIPO" = '2')`);
    });
    it('wms layer generation for legend includes scale', () => {
        const specs = PrintUtils.getMapfishLayersSpecification([layer], testSpec, 'legend');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].classes.length).toBe(1);
        expect(specs[0].classes[0].icons.length).toBe(1);
        expect(specs[0].classes[0].icons[0].indexOf('SCALE=50000') !== -1).toBe(true);
    });
    it('vector layer default point style', () => {
        const style = PrintUtils.getOlDefaultStyle({ features: [{ geometry: { type: "Point" } }] });
        expect(style).toExist();
        expect(style.pointRadius).toBe(5);
    });
    it('vector layer default marker style', () => {
        const style = PrintUtils.getOlDefaultStyle({ styleName: "marker", features: [{ geometry: { type: "Point" } }] });
        expect(style).toExist();
        expect(style.externalGraphic).toExist();
    });
    it('vector layer default polygon style', () => {
        const style = PrintUtils.getOlDefaultStyle({ features: [{ geometry: { type: "Polygon" } }] });
        expect(style).toExist();
        expect(style.strokeWidth).toBe(3);
        expect(style.strokeDashstyle).toBe("dash");
        expect(style.strokeLinecap).toBe("round");
        expect(style.strokeColor).toBe("#0000FF");
        expect(style.fillColor).toBe("#0000FF");
        expect(style.fillOpacity).toBe(0.1);
        expect(style.strokeOpacity).toBe(1);
    });
    it('vector layer default line style', () => {
        const style = PrintUtils.getOlDefaultStyle({ features: [{ geometry: { type: "LineString" } }] });
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
        expect(PrintUtils.getMapSize({ map: { width: 200, height: 200 } }, 150).height).toBe(150);
        expect(PrintUtils.getMapSize({ rotation: true, map: { width: 200, height: 100 } }, 200).height).toBe(400);
    });
    it('getNearestZoom', () => {
        const scales = [10000000, 1000000, 10000, 1000];
        expect(PrintUtils.getNearestZoom(18, scales)).toBe(2);
    });
    it('getNearestZoom fractional zoom', () => {
        const scales = [10000000, 1000000, 10000, 1000];
        expect(PrintUtils.getNearestZoom(18.3, scales)).toBe(2);
    });
    it('getMapfishPrintSpecification', () => {
        const printSpec = PrintUtils.getMapfishPrintSpecification(testSpec);
        expect(printSpec).toExist();
        expect(printSpec.dpi).toBe(96);
        expect(printSpec.layers.length).toBe(1);
        expect(printSpec.geodetic).toBe(false);
    });
    it('from rgba to rgb', () => {
        const rgb = PrintUtils.rgbaTorgb("rgba(255, 255, 255, 0.1)");
        expect(rgb).toExist();
        expect(rgb).toBe("rgb(255, 255, 255)");
    });
    describe('specCreators', () => {
        describe('opacity', () => {
            const testBase = {
                wms: layer,
                wmts: KVP1,
                vector: vectorLayer,
                tms: TMS110_1,
                tileprovider: BasemapAT,
                osm: {
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
            };
            it('check opacity for all layers to be 1 for undefined, therwise its value', () => {
                Object.keys(PrintUtils.specCreators).map( k => {
                    const fun = PrintUtils.specCreators[k].map;
                    // 0 must remain
                    expect(fun({ ...(testBase[k] || {}), opacity: 0 }, { projection: "EPSG:900913" }).opacity).toEqual(0);
                    expect(fun({ ...(testBase[k] || {}), opacity: 0.5 }, { projection: "EPSG:900913" }).opacity).toEqual(0.5);
                    expect(fun({ ...(testBase[k] || {}), opacity: undefined }, { projection: "EPSG:900913" }).opacity).toEqual(1);

                } );
            });
        });
        describe('WMTS', () => {
            const checkMatrixIds = (layerSpec, tileMatrixSet) => layerSpec.matrixIds.map((mid, index) => {
                const tileMatrixEntry = tileMatrixSet.TileMatrix[index];
                expect(mid.identifier).toEqual(tileMatrixEntry["ows:Identifier"]);
                expect(mid.matrixSize[0] + "").toEqual(tileMatrixEntry.MatrixHeight);
                expect(mid.matrixSize[1] + "").toEqual(tileMatrixEntry.MatrixWidth);
                expect(mid.tileSize[0] + "").toEqual(tileMatrixEntry.TileWidth);
                expect(mid.tileSize[1] + "").toEqual(tileMatrixEntry.TileHeight);
                expect(mid.resolution).toExist();
                expect((mid.topLeftCorner[0] + "").indexOf("-20037508.34") === 0).toBe(true);
                expect((mid.topLeftCorner[1] + "").indexOf("20037508") === 0).toBe(true);
            });
            it('KVP WMTS', () => {
                const testLayer = KVP1;
                const layerSpec = PrintUtils.specCreators.wmts.map(testLayer, { projection: "EPSG:900913" });
                expect(layerSpec.type).toEqual("WMTS");
                expect(layerSpec.format).toExist();
                expect(layerSpec.baseURL).toEqual(testLayer.url);
                expect(layerSpec.matrixSet).toEqual("EPSG:900913");
                expect(layerSpec.requestEncoding).toBe("KVP");
                const tileMatrixSet = find(testLayer.tileMatrixSet, { "ows:Identifier": layerSpec.matrixSet }); // the one with Identifier === matrixSet;
                checkMatrixIds(layerSpec, tileMatrixSet);
            });
            it('REST WMTS', () => {
                const testLayer = REST1;
                const layerSpec = PrintUtils.specCreators.wmts.map(testLayer, { projection: "EPSG:900913" });
                expect(layerSpec.type).toEqual("WMTS");
                expect(layerSpec.format).toExist();
                expect(layerSpec.baseURL).toEqual(encodeURI(testLayer.url[0])); // must be encoded
                expect(layerSpec.matrixSet).toEqual("google3857");

                const tileMatrixSet = find(testLayer.tileMatrixSet, { "ows:Identifier": layerSpec.matrixSet }); // the one with Identifier === matrixSet;
                checkMatrixIds(layerSpec, tileMatrixSet);

                // REST part
                expect(layerSpec.requestEncoding).toBe("REST"); // Not RESTful
                expect(layerSpec.name).toBe(testLayer.name);

                // Style works as dimension from the URL {Style} entry
                expect(layerSpec.dimensions[0]).toBe("Style");
                expect(layerSpec.params.STYLE).toBe(testLayer.style);
                expect(layerSpec.style).toBe(testLayer.style);
                expect(layerSpec.version).toBe("1.0.0");
            });
        });
        describe('tileprovider', () => {
            it('BasemapAT', () => {
                const testLayer = BasemapAT;
                const layerSpec = PrintUtils.specCreators.tileprovider.map(testLayer, { projection: "EPSG:900913" });
                expect(layerSpec.type).toEqual("xyz");
                // string without subdomains or params
                expect(layerSpec.baseURL).toEqual("https://maps.wien.gv.at/basemap/geolandbasemap/normal/google3857/");
                // parameters should be passed in pathSpec
                expect(layerSpec.baseURL.indexOf(/\{[x,y,z]\}/)).toBeLessThan(0);
                expect(layerSpec.path_format).toBe("${z}/${y}/${x}.png"); // use the format of mapfish print for variables
                // mandatory values
                expect(layerSpec.maxExtent).toExist();
                expect(layerSpec.maxExtent).toExist();
                expect(layerSpec.tileSize).toExist();
                expect(layerSpec.resolutions).toExist();
                expect(layerSpec.extension).toBe("png");

            });
            it('BasemapAT', () => {
                const testLayer = NASAGIBS;
                const layerSpec = PrintUtils.specCreators.tileprovider.map(testLayer, { projection: "EPSG:900913" });
                expect(layerSpec.type).toEqual("xyz");
                // string without subdomains or params
                expect(layerSpec.baseURL).toEqual("https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default//GoogleMapsCompatible_Level8/");
                // parameter    s should be passed in pathSpec
                expect(layerSpec.baseURL.indexOf(/\{[x,y,z]\}/)).toBeLessThan(0);
                expect(layerSpec.path_format).toBe("${z}/${y}/${x}.jpg"); // use the format of mapfish print for variables
                // mandatory values
                expect(layerSpec.maxExtent).toExist();
                expect(layerSpec.maxExtent).toExist();
                expect(layerSpec.tileSize).toExist();
                expect(layerSpec.resolutions).toExist();
                expect(layerSpec.extension).toBe("jpg");

            });
            it('tileprovider with custom URL', () => {
                const testLayer = NLS_CUSTOM_URL;
                const layerSpec = PrintUtils.specCreators.tileprovider.map(testLayer, { projection: "EPSG:900913" });
                expect(layerSpec.type).toEqual("xyz");
                // string without subdomains or params
                expect(layerSpec.baseURL).toEqual("https://nls-0.tileserver.com/nls/");
                // parameter    s should be passed in pathSpec
                expect(layerSpec.baseURL.indexOf(/\{[x,y,z]\}/)).toBeLessThan(0);
                expect(layerSpec.path_format).toBe("${z}/${x}/${y}.jpg"); // use the format of mapfish print for variables
                // mandatory values
                expect(layerSpec.maxExtent).toExist();
                expect(layerSpec.maxExtent).toExist();
                expect(layerSpec.tileSize).toExist();
                expect(layerSpec.resolutions).toExist();
                expect(layerSpec.extension).toBe("jpg");

            });
        });
        describe('TMS', () => {
            it('TMS 1.0.0', () => {
                const testLayer = TMS110_1;
                const layerSpec = PrintUtils.specCreators.tms.map(testLayer, { projection: "EPSG:900913" });
                expect(layerSpec.type).toEqual("tms");
                expect(layerSpec.format).toExist();
                // baseURL should not have version in URL
                expect(layerSpec.baseURL).toEqual(encodeURI(testLayer.tileMapService).split("/1.0.0")[0]);
                expect(layerSpec.layer).toEqual(testLayer.tileMapUrl.split("/1.0.0/")[1]);
                expect(layerSpec.tileSize).toEqual(testLayer.tileSize);
                expect(layerSpec).toExist();
                expect(layerSpec.resolutions.length).toEqual(testLayer.tileSets.length);
                expect(layerSpec.format).toBe("png"); // format is mandatory
            });
        });
    });
});
