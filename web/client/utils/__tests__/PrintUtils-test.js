/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import { find } from 'lodash';

import {
    toOpenLayers2Style,
    getMapfishLayersSpecification,
    getOlDefaultStyle,
    toAbsoluteURL,
    getMapSize,
    getNearestZoom,
    getMapfishPrintSpecification,
    rgbaTorgb,
    specCreators,
    addTransformer,
    addMapTransformer,
    addValidator,
    getMapTransformerChain,
    getSpecTransformerChain,
    getValidatorsChain,
    getPrintVendorParams,
    resetDefaultPrintingService,
    getDefaultPrintingService,
    getLegendIconsSize,
    parseCreditRemovingTagsOrSymbol,
    getLayersCredits
} from '../PrintUtils';
import ConfigUtils from '../ConfigUtils';
import { KVP1, REST1 } from '../../test-resources/layers/wmts';
import { poi as TMS110_1 } from '../../test-resources/layers/tms';
import { BasemapAT, NASAGIBS, NLS_CUSTOM_URL, LINZ_CUSTOM_URL } from '../../test-resources/layers/tileprovider';
import { setStore } from '../StateUtils';
import { getGoogleMercatorScales, getScales } from '../MapUtils';

const layer = {
    url: "http://mygeoserver",
    name: "my:layer",
    type: "wms",
    params: { myparam: "myvalue" }
};

const noVendorLayer = {
    url: "http://mapproxy",
    name: "some_layer",
    type: "wms",
    serverType: "no-vendor"
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
        "id": "feature-1",
        "serial_num": "12C324776"
    },
    "id": "feature-1"
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

const graticuleLayer = {
    "type": "graticule",
    "visibility": true,
    "group": "graticules",
    "id": "graticule__0",
    "name": "graticule",
    "style": {}
};

const annotationsVectorLayer = {
    "type": "vector",
    "visibility": true,
    "group": "Local shape",
    "id": "annotations:1",
    "title": "Annotations",
    "hideLoading": true,
    "features": featureCollection?.features,
    "rowViewer": "annotations",
    "style": {
        "format": "geostyler",
        "body": {
            "name": "Annotations",
            "rules": [
                {
                    "filter": ["==", "id", featureCollection?.features?.[0]?.id],
                    "name": "",
                    "symbolizers": [
                        {
                            "kind": "Line",
                            "color": 'rgb(0, 0, 255)',
                            "width": 3,
                            "opacity": 1,
                            "cap": "round",
                            "join": "round",
                            "msClampToGround": true
                        }
                    ]
                }
            ]
        }
    }
};

const measurementVectorLayer = {
    "type": "vector",
    "visibility": true,
    "group": "Local shape",
    "id": "aaa",
    "name": "Measurements",
    "hideLoading": true,
    "features": featureCollection?.features,
    "style": {
        "format": "geostyler",
        "body": {
            "name": "Annotations",
            "rules": [
                {
                    "filter": ["==", "id", featureCollection?.features?.[0]?.id],
                    "name": "",
                    "symbolizers": [
                        {
                            "kind": "Line",
                            "color": 'rgb(0, 0, 255)',
                            "width": 3,
                            "opacity": 1,
                            "cap": "round",
                            "join": "round",
                            "msClampToGround": true
                        }
                    ]
                }
            ]
        }
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

const arcgisLayer = {
    type: 'arcgis',
    title: 'Title',
    url: 'http://argis/MapServer',
    name: 0,
    format: 'PNG',
    visibility: true
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

const sampleStore = {
    getState: () => ({
        print: {
            map: {
                zoom: 1
            },
            customprop: "myvalue",
            spec: testSpec
        }
    })
};

describe('PrintUtils', () => {
    beforeEach(() => {
        rules = ConfigUtils.getConfigProp('authenticationRules');
        ConfigUtils.setConfigProp('useAuthenticationRules', false);
    });
    afterEach(() => {
        ConfigUtils.setConfigProp('authenticationRules', rules);
    });

    it('custom params are applied to wms layers', () => {

        const specs = getMapfishLayersSpecification([layer], {}, {}, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].customParams.myparam).toExist();
        expect(specs[0].customParams.myparam).toBe("myvalue");
    });
    it('vector layer generation for print', () => {
        const specs = getMapfishLayersSpecification([vectorLayer], { projection: "EPSG:3857" }, {}, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].geoJson.features[0].geometry.coordinates[0], mapFishVectorLayer).toBe(mapFishVectorLayer.geoJson.features[0].geometry.coordinates[0]);
    });
    it('vector layer from annotations are preprocessed for printing', () => {
        const specs = getMapfishLayersSpecification([annotationsVectorLayer], { projection: "EPSG:3857" }, {}, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].geoJson.features[0].properties.ms_style.strokeColor).toBe("rgb(0, 0, 255)");
    });
    it('vector layer from measurements are preprocessed for printing', () => {
        const specs = getMapfishLayersSpecification([measurementVectorLayer], { projection: "EPSG:3857" }, {}, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].geoJson.features[0].properties.ms_style.strokeColor).toBe("rgb(0, 0, 255)");
    });
    it('wms layer generation for legend', () => {
        const specs = getMapfishLayersSpecification([layer], { projection: "EPSG:3857" }, {}, 'legend');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].classes.length).toBe(1);
        // legendURL is a GetLegendGraphic request
        expect(specs[0].classes[0].icons[0].indexOf('GetLegendGraphic') !== -1).toBe(true);
        // LANGUAGE, if not included, should not be a parameter of the legend URL
        expect(specs[0].classes[0].icons[0].indexOf('LANGUAGE')).toBe(-1);
        const specs2 = getMapfishLayersSpecification([layer], { projection: "EPSG:3857", language: 'de' }, {}, 'legend');
        expect(specs2).toExist();
        expect(specs2.length).toBe(1);
        expect(specs2[0].classes.length).toBe(1);
        // LANGUAGE, if included, should be a parameter of the legend URL
        expect(specs2[0].classes[0].icons[0].indexOf('LANGUAGE=de')).toBeGreaterThan(0);
    });
    it('toOpenLayers2Style for vector layer wich contains a FeatureCollection using the default style', () => {
        const style = toOpenLayers2Style(vectorWithFtCollInside, null, "FeatureCollection");
        expect(style).toExist();

        expect(style.strokeColor).toBe("#0000FF");
        expect(style.strokeOpacity).toBe(1);
        expect(style.strokeWidth).toBe(1);
        expect(style.pointRadius).toBe(5);
        expect(style.fillColor).toBe("#0000FF");
        expect(style.fillOpacity).toBe(0.1);
    });
    it('toOpenLayers2Style for vector layer using a default LineString style', () => {
        const style = toOpenLayers2Style(vector2, null, "LineString");
        expect(style).toExist();
        expect(style.strokeColor).toBe("#0000FF");
        expect(style.strokeOpacity).toBe(1);
        expect(style.strokeWidth).toBe(3);
    });
    it('toOpenLayers2Style for vector layer using a default MultiPolygon style', () => {
        const style = toOpenLayers2Style(vector2, null, "MultiPolygon");
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
        const specs = getMapfishLayersSpecification([layer], {}, {}, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].customParams.authkey).toExist();
        expect(specs[0].customParams.authkey).toBe("mykey");
    });
    it('custom params include layerFilter and filterObj', () => {
        const specs = getMapfishLayersSpecification([{
            ...layerSottoPasso,
            layerFilter: layerFilterSottoPasso,
            filterObj: filterObjSottoPasso
        }], {}, {}, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].customParams.CQL_FILTER).toExist();
        expect(specs[0].customParams.CQL_FILTER).toBe(`(("TIPO" = '2')) AND (("ID_OGGETTO" < '44'))`);
    });
    it('custom params include cql_filter', () => {
        const specs = getMapfishLayersSpecification([{
            ...layerSottoPasso,
            filterObj: filterObjSottoPasso
        }], {}, {}, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].customParams.CQL_FILTER).toExist();
        expect(specs[0].customParams.CQL_FILTER).toBe(`("ID_OGGETTO" < '44')`);
    });
    it('custom params include layerFilter', () => {
        const specs = getMapfishLayersSpecification([{
            ...layerSottoPasso,
            layerFilter: layerFilterSottoPasso
        }], {}, {}, 'map');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].customParams.CQL_FILTER).toExist();
        expect(specs[0].customParams.CQL_FILTER).toBe(`("TIPO" = '2')`);
    });
    it('wms layer generation for legend includes scale', () => {
        const specs = getMapfishLayersSpecification([layer], testSpec, {}, 'legend');
        expect(specs).toExist();
        expect(specs.length).toBe(1);
        expect(specs[0].classes.length).toBe(1);
        expect(specs[0].classes[0].icons.length).toBe(1);
        expect(specs[0].classes[0].icons[0].indexOf('SCALE=50000') !== -1).toBe(true);
    });
    it('vector layer default point style', () => {
        const style = getOlDefaultStyle({ features: [{ geometry: { type: "Point" } }] });
        expect(style).toExist();
        expect(style.pointRadius).toBe(5);
    });
    it('vector layer default marker style', () => {
        const style = getOlDefaultStyle({ styleName: "marker", features: [{ geometry: { type: "Point" } }] });
        expect(style).toExist();
        expect(style.externalGraphic).toExist();
    });
    it('vector layer default polygon style', () => {
        const style = getOlDefaultStyle({ features: [{ geometry: { type: "Polygon" } }] });
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
        const style = getOlDefaultStyle({ features: [{ geometry: { type: "LineString" } }] });
        expect(style).toExist();
        expect(style.strokeWidth).toBe(3);
    });
    it('toAbsoluteUrl', () => {
        const url = toAbsoluteURL("/geoserver", "http://localhost:8080");
        expect(url).toExist();
        expect(url).toBe("http://localhost:8080/geoserver");
        expect(toAbsoluteURL("//someurl/geoserver").indexOf("http")).toBe(0);
    });
    it('getMapSize', () => {
        expect(getMapSize()).toExist(); // check defaults
        expect(getMapSize({ map: { width: 200, height: 200 } }, 150).height).toBe(150);
        expect(getMapSize({ rotation: true, map: { width: 200, height: 100 } }, 200).height).toBe(400);
    });
    it('getNearestZoom', () => {
        const scales = [10000000, 1000000, 10000, 1000];
        expect(getNearestZoom(18, scales)).toBe(2);
    });
    it('getNearestZoom fractional zoom', () => {
        const scales = [10000000, 1000000, 10000, 1000];
        expect(getNearestZoom(18.3, scales)).toBe(2);
    });
    it('getMapfishPrintSpecification', () => {
        const printSpec = getMapfishPrintSpecification(testSpec);
        expect(printSpec).toExist();
        expect(printSpec.dpi).toBe(96);
        expect(printSpec.layers.length).toBe(1);
        expect(printSpec.geodetic).toBe(false);
    });
    it('getMapfishPrintSpecification custom params', () => {
        const printSpec = getMapfishPrintSpecification({...testSpec, params: {custom: "customvalue"}});
        expect(printSpec).toExist();
        expect(printSpec.custom).toBe("customvalue");
    });
    it("getMapfishPrintSpecification, valid spec with legend, and excluded layer from legeng", () => {
        const spec = {
            projection: "EPSG:4326",
            sheet: "A4",
            landscape: true,
            resolution: "96",
            name: "Test print",
            user: "user1",
            scale: 500000,
            printCrs: "World WGS 84 (EPSG:4326)",
            description: "Test description",
            includeLegend: true,
            includeNotes: true,
            layers: [
                {
                    external: true,
                    url: "/wms",
                    singleTile: false,
                    opacity: 0.8,
                    name: "layer-test",
                    title: "layer-test",
                    format: "png",
                    style: "style1",
                    cql_filter: "x=1",
                    visibility: true,
                    type: "wms"
                },
                {
                    external: true,
                    url: "/wms",
                    singleTile: false,
                    opacity: 0.8,
                    name: "layer-test-exclude",
                    title: "layer-test",
                    format: "png",
                    style: "style1",
                    cql_filter: "x=1",
                    visibility: true,
                    type: "wms"
                }
            ],
            geoserverUrls: [
                "/rest/geoserver",
                "/rest/geoserver1",
                "/rest/geoserver2"
            ],
            center: {x: 0, y: 0, crs: "EPSG:4326"},
            type: "WMS"
        };
        let mapFishSpec = getMapfishPrintSpecification({
            ...spec,
            forceLabels: true,
            antiAliasing: true,
            legendDpi: 96,
            bold: true,
            excludeLayersFromLegend: ["layer-test-exclude"]
        });
        expect(mapFishSpec.legends.length).toBe(1);

    });
    it('getMapfishPrintSpecification with fixed scales', () => {
        const printSpec = getMapfishPrintSpecification({
            ...testSpec,
            scaleZoom: 3,
            scales: [2000000, 1000000, 500000, 100000, 50000]
        }, {
            print: {
                map: {
                    useFixedScales: true
                }
            }
        });
        expect(printSpec).toExist();
        expect(printSpec.pages[0].scale).toBe(100000);
    });
    it('getMapfishPrintSpecification with standard scales for print map with projection 3857 [google web mercator]', () => {
        const printSpec = getMapfishPrintSpecification({
            ...testSpec,
            zoom: 3
        });
        expect(printSpec).toExist();
        expect(printSpec.pages[0].scale).toBe(getGoogleMercatorScales(0, 21)[3]);
    });
    it('getMapfishPrintSpecification with fixed scales for print map with projection 4326', () => {
        const projection = 'EPSG:4326';
        const printSpec = getMapfishPrintSpecification({
            ...testSpec,
            projection,
            scaleZoom: 3,
            scales: [2000000, 1000000, 500000, 100000, 50000]
        }, {
            print: {
                map: {
                    useFixedScales: true
                }
            }
        });
        expect(printSpec).toExist();
        expect(printSpec.pages[0].scale).toBe(100000);
    });
    it('getMapfishPrintSpecification with standard scales for print map with projection 4326', () => {
        const projection = 'EPSG:4326';
        const printSpec = getMapfishPrintSpecification({
            ...testSpec,
            zoom: 3,
            projection
        });
        expect(printSpec).toExist();
        expect(printSpec.pages[0].scale).toBe(getScales(projection)[3]);
    });
    it('from rgba to rgb', () => {
        const rgb = rgbaTorgb("rgba(255, 255, 255, 0.1)");
        expect(rgb).toExist();
        expect(rgb).toBe("rgb(255, 255, 255)");
    });
    it('getPrintVendorParams default', () => {
        const params = getPrintVendorParams(layer);
        expect(params).toExist();
        expect(params.TILED).toBe(true);
    });
    it('getPrintVendorParams no-vendor', () => {
        const params = getPrintVendorParams(noVendorLayer);
        expect(params).toExist();
        expect(params).toEqual({});
    });
    it('getLegendIconsSize', () => {
        // with layer legend options
        let spec = {forceIconsSize: false};
        let _layer = {legendOptions: {legendWidth: 20, legendHeight: 20}};
        let iconSize = getLegendIconsSize(spec, _layer);
        expect(iconSize.width).toBe(20);
        expect(iconSize.height).toBe(20);
        expect(iconSize.minSymbolSize).toBe(20);

        // with override legend options
        spec = {forceIconsSize: true, iconsWidth: 10, iconsHeight: 10};
        iconSize = getLegendIconsSize(spec, _layer);
        expect(iconSize.width).toBe(10);
        expect(iconSize.height).toBe(10);
        expect(iconSize.minSymbolSize).toBe(10);

        // with layer as background
        spec = {forceIconsSize: false, iconsWidth: 10, iconsHeight: 10};
        _layer = {..._layer, group: "background"};
        iconSize = getLegendIconsSize(spec, _layer);
        expect(iconSize.width).toBe(10);
        expect(iconSize.height).toBe(10);
        expect(iconSize.minSymbolSize).toBe(10);

        // with default layer legend option
        spec = {forceIconsSize: false, iconsWidth: 10, iconsHeight: 10};
        iconSize = getLegendIconsSize(spec, {});
        expect(iconSize.width).toBe(12);
        expect(iconSize.height).toBe(12);
        expect(iconSize.minSymbolSize).toBe(12);

    });

    describe('specCreators', () => {
        describe('opacity', () => {
            const testBase = {
                wms: layer,
                wmts: KVP1,
                vector: vectorLayer,
                graticule: graticuleLayer,
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
                },
                arcgis: arcgisLayer
            };
            it('check opacity for all layers to be 1 for undefined, therwise its value', () => {
                Object.keys(specCreators).map( k => {
                    const fun = specCreators[k].map;
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
                const layerSpec = specCreators.wmts.map(testLayer, { projection: "EPSG:900913" });
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
                const layerSpec = specCreators.wmts.map(testLayer, { projection: "EPSG:900913" });
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
                const layerSpec = specCreators.tileprovider.map(testLayer, { projection: "EPSG:900913" });
                expect(layerSpec.type).toEqual("xyz");
                // string without subdomains or params
                expect(layerSpec.baseURL).toEqual("https://mapsneu.wien.gv.at/basemap/geolandbasemap/normal/google3857/");
                // parameters should be passed in pathSpec
                expect(layerSpec.baseURL.indexOf(/\{[x,y,z]\}/)).toBeLessThan(0);
                expect(layerSpec.path_format).toBe("${z}/${y}/${x}.png"); // use the format of mapfish print for variables
                // mandatory values
                expect(layerSpec.maxExtent).toExist();
                expect(layerSpec.maxExtent).toExist();
                expect(layerSpec.tileSize).toExist();
                expect(layerSpec.resolutions).toExist();
                expect(layerSpec.extension).toBe("png");
                expect(layerSpec.resolutions.length).toBe(19);
                expect(Object.keys(layerSpec.customParams).length).toBe(0);
            });
            it('NASAGIBS', () => {
                const testLayer = NASAGIBS;
                const layerSpec = specCreators.tileprovider.map(testLayer, { projection: "EPSG:900913" });
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
                expect(layerSpec.resolutions.length).toBe(9);
                expect(Object.keys(layerSpec.customParams).length).toBe(0);
            });
            it('tileprovider with custom URL', () => {
                const testLayer = NLS_CUSTOM_URL;
                const layerSpec = specCreators.tileprovider.map(testLayer, { projection: "EPSG:900913" });
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
                expect(layerSpec.resolutions.length).toBe(19);
                expect(Object.keys(layerSpec.customParams).length).toBe(0);
            });
            it('tileprovider with params', () => {
                const testLayer = LINZ_CUSTOM_URL;
                const layerSpec = specCreators.tileprovider.map(testLayer, { projection: "EPSG:3857" });
                expect(layerSpec.type).toEqual("xyz");
                // string with params
                expect(layerSpec.baseURL).toEqual("https://basemaps.linz.govt.nz/v1/tiles/aerial/EPSG:3857/");
                // parameter    s should be passed in pathSpec
                expect(layerSpec.baseURL.indexOf(/\{[x,y,z]\}/)).toBeLessThan(0);
                expect(layerSpec.path_format).toBe("${z}/${x}/${y}.png"); // use the format of mapfish print for variables
                // mandatory values
                expect(layerSpec.maxExtent).toExist();
                expect(layerSpec.maxExtent).toExist();
                expect(layerSpec.tileSize).toExist();
                expect(layerSpec.resolutions).toExist();
                expect(layerSpec.extension).toBe("png");
                expect(layerSpec.resolutions.length).toBe(19);
                expect(layerSpec.customParams.api).toBe('myapikey');
                expect(Object.keys(layerSpec.customParams).length).toBe(1);
            });
        });
        describe('TMS', () => {
            it('TMS 1.0.0', () => {
                const testLayer = TMS110_1;
                const layerSpec = specCreators.tms.map(testLayer, { projection: "EPSG:900913" });
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
        describe('ArcGIS', () => {
            it('ArcGIS MapServer', () => {
                const testLayer = arcgisLayer;
                const layerSpec = specCreators.arcgis.map(
                    testLayer,
                    {
                        projection: "EPSG:900913",
                        sheet: 'A4',
                        size: { width: 250, height: 250 },
                        scaleZoom: 10,
                        center: { x: 0, y: 0, crs: "EPSG:3857" }
                    },
                    {
                        print: {
                            capabilities: {
                                layouts: [{ name: 'A4_no_legend', map: { width: 500, height: 500 }  }]
                            }
                        }
                    });
                expect(layerSpec.type).toEqual("Image");
                expect(layerSpec.opacity).toBeTruthy();
                expect(decodeURIComponent(layerSpec.baseURL))
                    .toBe('http://argis/MapServer/export?F=image&LAYERS=show:0&FORMAT=PNG&TRANSPARENT=true&SIZE=500,500&bbox=-50958.01884969075,-50958.018849691456,50958.01884969075,50958.018849690045&BBOXSR=3857&IMAGESR=3857&DPI=90');
                expect(layerSpec.name).toBe(0);
                expect(layerSpec.extent).toEqual([ -50958.01884969075, -50958.018849691456, 50958.01884969075, 50958.018849690045 ]);
            });
        });
        describe('transformers', () => {
            beforeEach(() => {
                resetDefaultPrintingService();
            });
            it("addTransformer at the end", () => {
                addTransformer("custom", () => ({}));
                const chain = getSpecTransformerChain();
                expect(chain.length).toBe(4);
                expect(chain[3].name).toBe("custom");
            });
            it("addTransformer at desired position", () => {
                addTransformer("custom", () => ({}), 1.5);
                const chain = getSpecTransformerChain();
                expect(chain.length).toBe(4);
                expect(chain[2].name).toBe("custom");
            });
            it("replace default transformer", () => {
                addTransformer("mapfishSpecCreator", () => "mycustom_transformer");
                const chain = getSpecTransformerChain();
                expect(chain.length).toBe(3);
                const transfomer = chain[2];
                expect(transfomer.name).toBe("mapfishSpecCreator");
                expect(transfomer.transformer()).toBe("mycustom_transformer");
            });
            it("replace custom transformer", () => {
                addTransformer("custom", () => "mycustom_transformer");
                addTransformer("custom", () => "mycustom_transformer2");
                const chain = getSpecTransformerChain();
                expect(chain.length).toBe(4);
                const transfomer = chain[3];
                expect(transfomer.name).toBe("custom");
                expect(transfomer.transformer()).toBe("mycustom_transformer2");
            });
        });
        describe('map transformers', () => {
            beforeEach(() => {
                resetDefaultPrintingService();
            });
            it("addMapTransformer at the end", () => {
                addMapTransformer("custom", () => ({zoom: 1}));
                const chain = getMapTransformerChain();
                expect(chain.length).toBe(1);
                const transformer = chain[0];
                expect(transformer.name).toBe("custom");
                expect(transformer.transformer()).toEqual({zoom: 1});
            });
            it("replace custom transformer", () => {
                addMapTransformer("custom", () => ({zoom: 1}));
                addMapTransformer("custom", () => ({zoom: 2}));
                const chain = getMapTransformerChain();
                expect(chain.length).toBe(1);
                const transformer = chain[0];
                expect(transformer.name).toBe("custom");
                expect(transformer.transformer()).toEqual({zoom: 2});
            });
        });
        describe('validators', () => {
            beforeEach(() => {
                resetDefaultPrintingService();
            });
            it("addValidator at the end", () => {
                addValidator("custom", "map-preview", () => ({valid: true}));
                const chain = getValidatorsChain();
                expect(chain.length).toBe(1);
                const validator = chain[0];
                expect(validator.id).toBe("custom");
                expect(validator.name).toBe("map-preview");
                expect(validator.validator()).toEqual({valid: true});
            });
            it("replace custom validator", () => {
                addValidator("custom", "map-preview", () => ({valid: true}));
                addValidator("custom", "map-preview", () => ({valid: false}));
                const chain = getValidatorsChain();
                expect(chain.length).toBe(1);
                const validator = chain[0];
                expect(validator.id).toBe("custom");
                expect(validator.name).toBe("map-preview");
                expect(validator.validator()).toEqual({valid: false});
            });
        });
        describe('default printing service', () => {
            beforeEach(() => {
                resetDefaultPrintingService();
            });
            it('default configuration', (done) => {
                setStore(sampleStore);
                const service = getDefaultPrintingService();
                service.print().then(spec => {
                    expect(spec).toExist();
                    expect(spec.layout).toBe("A2_2_pages_legend");
                    done();
                }).catch(ex => done(ex));
            });
            it('custom transformer', (done) => {
                setStore(sampleStore);
                addTransformer("custom", (state, spec) => ({...spec, "myprop": state.print.customprop}));
                const service = getDefaultPrintingService();
                service.print().then(spec => {
                    expect(spec).toExist();
                    expect(spec.myprop).toBe("myvalue");
                    expect(spec.layout).toBe("A2_2_pages_legend");
                    done();
                }).catch(ex => done(ex));
            });
            it('default transformer replaced', (done) => {
                setStore(sampleStore);
                addTransformer("mapfishSpecCreator", (state, spec) => ({...spec, "myprop": state.print.customprop}));
                const service = getDefaultPrintingService();
                service.print().then(spec => {
                    expect(spec).toExist();
                    expect(spec.myprop).toBe("myvalue");
                    expect(spec.sheet).toBe("A2");
                    expect(spec.layout).toNotExist();
                    done();
                }).catch(ex => done(ex));
            });
            it('custom map transformer', () => {
                setStore(sampleStore);
                addMapTransformer("custom", (state, map) => ({...map, zoom: map.zoom + 1}));
                const service = getDefaultPrintingService();
                const map = service.getMapConfiguration();
                expect(map).toExist();
                expect(map.zoom).toBe(2);
            });
            it('custom validator', () => {
                setStore(sampleStore);
                addValidator("custom", "map-preview", () => ({valid: true}));
                const service = getDefaultPrintingService();
                const validation = service.validate();
                expect(validation).toExist();
                expect(validation["map-preview"]).toExist();
                expect(validation["map-preview"].valid).toBe(true);
                expect(validation["map-preview"].errors.length).toBe(0);
            });

            it('multiple validators', () => {
                setStore(sampleStore);
                addValidator("custom1", "map-preview", () => ({valid: false, errors: ["error1"]}));
                addValidator("custom2", "map-preview", () => ({valid: false, errors: ["error2"]}));
                const service = getDefaultPrintingService();
                const validation = service.validate();
                expect(validation).toExist();
                expect(validation["map-preview"]).toExist();
                expect(validation["map-preview"].valid).toBe(false);
                expect(validation["map-preview"].errors).toEqual(["error1", "error2"]);
            });
        });
        describe('getting credits text', () => {
            beforeEach(() => {
                resetDefaultPrintingService();
            });
            it("test parseCreditRemovingTagsOrSymbol", () => {
                const layerObj = {
                    center: [10, 20],
                    name: "layer 01",
                    credits: {
                        title: 'OSM Simple Light | Rendering <a href="https://www.geo-solutions.it/">GeoSolutions</a> | Data © <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="http://www.openstreetmap.org/copyright">ODbL</a>'
                    }
                };
                const parsedCreditTxt = parseCreditRemovingTagsOrSymbol(layerObj.credits.title);
                expect(parsedCreditTxt).toEqual('OSM Simple Light Rendering GeoSolutions Data © OpenStreetMap contributors, ODbL');
            });
            it("test getLayersCredits", () => {
                const layersArr = [{
                    center: [10, 20],
                    name: "layer 01",
                    credits: {
                        title: 'OSM Simple Light | Rendering <a href="https://www.geo-solutions.it/">GeoSolutions</a> | Data © <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="http://www.openstreetmap.org/copyright">ODbL</a>'
                    }
                },
                {
                    center: [10, 30],
                    name: "layer 02",
                    credits: {
                        title: 'Attribution layer 02'
                    }
                }, {
                    center: [20, 30],
                    name: "layer 03"
                }, {
                    center: [40, 45],
                    name: "layer 04",
                    credits: {
                        title: ''
                    }
                },
                {
                    center: [22, 33],
                    name: "layer 05",
                    credits: {
                        title: 'Attribution layer 03 @ | polygon layer'
                    }
                }];
                const reqLayersCreditTxt = getLayersCredits(layersArr);
                expect(reqLayersCreditTxt).toEqual('OSM Simple Light Rendering GeoSolutions Data © OpenStreetMap contributors, ODbL | Attribution layer 02 | Attribution layer 03 @ polygon layer');
            });
        });
    });
});
