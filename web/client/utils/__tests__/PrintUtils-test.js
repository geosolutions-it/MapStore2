/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const PrintUtils = require('../PrintUtils');
const ConfigUtils = require('../ConfigUtils');

const layer = {
    url: "http://mygeoserver",
    name: "my:layer",
    type: "wms",
    params: {myparam: "myvalue"}
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
const vectorLayer = {
    "type": "vector",
    "visibility": true,
    "group": "Local shape",
    "id": "web2014all_mv__14",
    "name": "web2014all_mv",
    "hideLoading": true,
    "features": [ featurePoint ],
    "style": {
        "weight": 3,
        "radius": 10,
        "opacity": 1,
        "fillOpacity": 0.1,
        "color": "rgb(0, 0, 255)",
        "fillColor": "rgb(0, 0, 255)"
    }
};
let vector2 = {...vectorLayer};
delete vector2.style;
let vectorWithFtCollInside = {...vectorLayer, features: [{
    type: "FeatureCollection",
    features: [featurePoint]
}]};

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

const tileProviderLayer = {
    "type": "tileprovider",
    "visibility": true,
    "url": "https://nls-{s}.tileserver.com/nls/{z}/{x}/{y}.jpg",
    "title": "NLS_API",
    "options": {
        "subdomains": [
            "0",
            "1",
            "2",
            "3"
        ]
    },
    "provider": "custom",
    "name": "custom",
    "id": "custom__7",
    "loading": false,
    "previousLoadingError": false,
    "loadingError": false
};
const wmtsLayer = {
    "type": "wmts",
    "requestEncoding": "KVP",
    "style": "poi",
    "format": "image/png",
    "url": "https://gs-stable.geo-solutions.it/geoserver/gwc/service/wmts",
    "capabilitiesURL": "https://gs-stable.geo-solutions.it/geoserver/gwc/service/wmts",
    "dimensions": [],
    "name": "gs:ny_poi",
    "title": "poi",
    "matrixIds": {
        "EPSG:4326": [
            {
                "identifier": "EPSG:4326:0",
                "ranges": {
                    "cols": {
                        "min": "0",
                        "max": "0"
                    },
                    "rows": {
                        "min": "0",
                        "max": "0"
                    }
                }
            }
        ]
    },
    "description": "poi",
    "tileMatrixSet": [
        {
            "ows:Identifier": "EPSG:4326",
            "ows:SupportedCRS": "urn:ogc:def:crs:EPSG::4326",
            "TileMatrix": [
                {
                    "ows:Identifier": "EPSG:4326:0",
                    "ScaleDenominator": "2.795411320143589E8",
                    "TopLeftCorner": "90.0 -180.0",
                    "TileWidth": "256",
                    "TileHeight": "256",
                    "MatrixWidth": "2",
                    "MatrixHeight": "1"
                }
            ]
        },
        {
            "ows:Identifier": "EPSG:900913",
            "ows:SupportedCRS": "urn:ogc:def:crs:EPSG::900913",
            "TileMatrix": [
                {
                    "ows:Identifier": "EPSG:900913:0",
                    "ScaleDenominator": "5.590822639508929E8",
                    "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                    "TileWidth": "256",
                    "TileHeight": "256",
                    "MatrixWidth": "1",
                    "MatrixHeight": "1"
                },
                {
                    "ows:Identifier": "EPSG:900913:1",
                    "ScaleDenominator": "2.7954113197544646E8",
                    "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                    "TileWidth": "256",
                    "TileHeight": "256",
                    "MatrixWidth": "2",
                    "MatrixHeight": "2"
                }
            ]
        }
    ],
    "bbox": {
        "crs": "EPSG:4326",
        "bounds": {
            "minx": "-74.0118315772888",
            "miny": "40.70754683896324",
            "maxx": "-74.00153046439813",
            "maxy": "40.719885123828675"
        }
    },
    "links": [],
    "params": {},
    "allowedSRS": {
        "EPSG:4326": true,
        "EPSG:900913": true
    },
    "id": "gs:ny_poi__8",
    "loading": false,
    "previousLoadingError": false,
    "loadingError": false
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
describe.only('PrintUtils', () => {
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
        const specs = PrintUtils.getMapfishLayersSpecification([vectorLayer], {projection: "EPSG:3857"}, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].geoJson.features[0].geometry.coordinates[0], mapFishVectorLayer).toBe(mapFishVectorLayer.geoJson.features[0].geometry.coordinates[0]);
    });
    it('wms layer generation for legend', () => {
        const specs = PrintUtils.getMapfishLayersSpecification([layer], {projection: "EPSG:3857"}, 'legend');
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
        expect(style.strokeDashstyle).toBe("dash");
        expect(style.strokeLinecap).toBe("round");
        expect(style.strokeColor).toBe("#0000FF");
        expect(style.fillColor).toBe("#0000FF");
        expect(style.fillOpacity).toBe(0.1);
        expect(style.strokeOpacity).toBe(1);
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
        expect(printSpec.geodetic).toBe(false);
    });
    it('from rgba to rgb', () => {
        const rgb = PrintUtils.rgbaTorgb("rgba(255, 255, 255, 0.1)");
        expect(rgb).toExist();
        expect(rgb).toBe("rgb(255, 255, 255)");
    });
    it('WMTS layer generation for print', () => {
        const printSpec = PrintUtils.getMapfishLayersSpecification([wmtsLayer], {projection: "EPSG:900913"}, 'map');
        expect(printSpec.length).toBe(1);
        const [spec] = printSpec;
        expect(spec.matrixIds).toExist();
        expect(spec.matrixIds[0].identifier).toContain("EPSG:900913");
        expect(spec.matrixSet).toExist();
        expect(spec.matrixSet).toBe("EPSG:900913");
        expect(spec.requestEncoding).toExist();
        expect(spec.requestEncoding).toBe('KVP');
    });
    it('get MatrixIds for WMTS', () => {
        const matrixIds = PrintUtils.getWMTSMatrixIds(wmtsLayer);
        expect(matrixIds.length > 0).toBe(true);
        const [matrixId] = matrixIds;
        expect(matrixId.identifier).toExist();
        expect(matrixId.identifier).toContain("EPSG:900913");
        expect(matrixId.matrixSize).toExist();
        expect(matrixId.matrixSize).toEqual([1, 1]);
        expect(matrixId.resolution).toExist();
        expect(matrixId.tileSize).toExist();
        expect(matrixId.tileSize).toEqual([256, 256]);
        expect(matrixId.topLeftCorner).toExist();
    });
    it('Tile provider layer generation for print', () => {
        const printSpec = PrintUtils.getMapfishLayersSpecification([tileProviderLayer], {projection: "EPSG:900913"}, 'map');
        expect(printSpec.length).toBe(1);
        const [spec] = printSpec;
        expect(spec.baseURL).toNotContain("/{z}/{x}/{y}");
        expect(spec.type).toBe('xyz');
        expect(spec.maxExtent.length > 0).toBe(true);
        expect(spec.tileSize).toExist();
        expect(spec.tileSize).toEqual([256, 256]);
        expect(spec.resolutions.length > 0).toBe(true);
        expect(spec.extension).toEqual("jpg");
    });
    it('get TileProvider layer specification from custom provider', () => {
        const customTileProviderLayer = {
            url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
            options: {"subdomains": ["0", "1", "2", "3"]},
            provider: "custom"
        };
        const tileProviderLayerSpec = PrintUtils.getTileProviderLayerSpec(customTileProviderLayer);
        expect(tileProviderLayerSpec.baseURL).toNotContain("/{z}/{x}/{y}");
        expect(tileProviderLayerSpec.tileSize).toExist();
        expect(tileProviderLayerSpec.resolutions.length > 0).toBe(true);
        expect(tileProviderLayerSpec.extension).toEqual("png");
        expect(tileProviderLayerSpec.type).toEqual("xyz");
    });
    it('get TileProvider layer specification for existing provider', () => {
        const customTileProviderLayer = {
            url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
            provider: "Stamen.Watercolor"
        };
        const tileProviderLayerSpec = PrintUtils.getTileProviderLayerSpec(customTileProviderLayer);
        expect(()=> { throw new URL(tileProviderLayerSpec);}).toExist();
        expect(tileProviderLayerSpec.baseURL).toNotContain("/{z}/{x}/{y}");
        expect(tileProviderLayerSpec.tileSize).toExist();
        expect(tileProviderLayerSpec.resolutions.length > 0).toBe(true);
        expect(tileProviderLayerSpec.extension).toEqual("png");
        expect(tileProviderLayerSpec.type).toEqual("xyz");
    });
});
