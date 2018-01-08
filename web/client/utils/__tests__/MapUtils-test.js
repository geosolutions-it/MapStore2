/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var {
    RESOLUTIONS_HOOK,
    EXTENT_TO_ZOOM_HOOK,
    COMPUTE_BBOX_HOOK,
    RESOLUTION_HOOK,
    registerHook,
    dpi2dpm,
    getSphericalMercatorScales,
    getSphericalMercatorScale,
    getGoogleMercatorScales,
    getGoogleMercatorResolutions,
    getGoogleMercatorScale,
    getResolutionsForScales,
    getResolutions,
    getZoomForExtent,
    getCenterForExtent,
    getBbox,
    getCurrentResolution,
    saveMapConfiguration,
    extractTileMatrixSetFromLayers
} = require('../MapUtils');

describe('Test the MapUtils', () => {
    it('dpi2dpm', () => {
        const inch2mm = 25.4;
        const testDPI = 96;
        const dpmm = testDPI / inch2mm;
        expect(dpi2dpm(testDPI).toFixed(6)).toBe((1000 * dpmm).toFixed(6));
    });
    it('getSphericalMercatorScale', () => {
        expect(getSphericalMercatorScale(1, 1, 1, 1, 1)).toBe(2 * Math.PI * dpi2dpm(1));
        expect(getSphericalMercatorScale(1, 1, 1, 1)).toBe(2 * Math.PI * dpi2dpm(96));
    });
    it('getGoogleMercatorScale', () => {
        expect(getGoogleMercatorScale(1, 1)).toBe(getSphericalMercatorScale(6378137, 256, 2, 1, 1));
        expect(getGoogleMercatorScale(1)).toBe(getSphericalMercatorScale(6378137, 256, 2, 1, 96));
    });
    it('getSphericalMercatorScales', () => {
        expect(getSphericalMercatorScales(1, 1, 1, 1, 1, 1).length).toBe(1);
    });
    it('getGoogleMercatorScales', () => {
        expect(getGoogleMercatorScales(1, 1, 1).length).toBe(1);
    });
    it('getResolutions', () => {
        expect(getResolutions().length > 0).toBe(true);
    });
    it('getResolutionsForScales', () => {
        // generate test scales for resolutions
        function testScales(resolutions, dpu) {
            return resolutions.map((res) => {
                return res * dpu;
            });
        }

        function dotsPerUnit(dpi, metersPerUnit) {
            return metersPerUnit * dpi * 100 / 2.54;
        }

        function resolutionsEqual(arrayA, arrayB) {
            if (arrayA.length === arrayB.length) {
                for (let i in arrayA) {
                    // check if absolute difference is within epsilon
                    if (Math.abs(arrayA[i] - arrayB[i]) > 1E-6) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }

        const mPerDegree = 111194.87428468118;
        let resolutions = [10000, 1000, 100, 10, 1];
        expect(resolutionsEqual(getResolutionsForScales(testScales(resolutions, dotsPerUnit(96, 1)), "EPSG:3857", 96), resolutions)).toBe(true);
        expect(resolutionsEqual(getResolutionsForScales(testScales(resolutions, dotsPerUnit(96, mPerDegree)), "EPSG:4326", 96), resolutions)).toBe(true);
        resolutions = [32000, 16000, 8000, 4000, 2000, 1000, 500, 250];
        expect(resolutionsEqual(getResolutionsForScales(testScales(resolutions, dotsPerUnit(96, 1)), "EPSG:3857", 96), resolutions)).toBe(true);
        expect(resolutionsEqual(getResolutionsForScales(testScales(resolutions, dotsPerUnit(96, mPerDegree)), "EPSG:4326", 96), resolutions)).toBe(true);
        expect(resolutionsEqual(getResolutionsForScales(testScales(resolutions, dotsPerUnit(120, 1)), "EPSG:3857", 120), resolutions)).toBe(true);
        expect(resolutionsEqual(getResolutionsForScales(testScales(resolutions, dotsPerUnit(120, mPerDegree)), "EPSG:4326", 120), resolutions)).toBe(true);
    });
    it('getZoomForExtent without hook', () => {
        var extent = [1880758.3574092742, 6084533.340409827, 1291887.4915002766, 5606954.787684047];
        var mapSize = {height: 781, width: 963};
        registerHook(RESOLUTIONS_HOOK, undefined);
        registerHook(EXTENT_TO_ZOOM_HOOK, undefined);
        expect(getZoomForExtent(extent, mapSize, 0, 21, 96)).toBe(8);
    });
    it('getZoomForExtent with resolutions hook', () => {
        var extent = [1880758.3574092742, 6084533.340409827, 1291887.4915002766, 5606954.787684047];
        var mapSize = {height: 781, width: 963};
        registerHook(RESOLUTIONS_HOOK, () => {
            return [1, 2, 3];
        });
        registerHook(EXTENT_TO_ZOOM_HOOK, undefined);
        expect(getZoomForExtent(extent, mapSize, 0, 21, 96)).toBe(2);
    });
    it('getZoomForExtent with zoom to extent hook', () => {
        var extent = [1880758.3574092742, 6084533.340409827, 1291887.4915002766, 5606954.787684047];
        var mapSize = {height: 781, width: 963};
        registerHook(RESOLUTIONS_HOOK, undefined);
        registerHook(EXTENT_TO_ZOOM_HOOK, () => 10);
        expect(getZoomForExtent(extent, mapSize, 0, 21, 96)).toBe(10);
    });
    it('getCenterForExtent', () => {
        var extent = [934366.2338, -3055035.1465, 2872809.2711, -2099878.0411];
        var ctr = getCenterForExtent(extent, "EPSG:900913");
        expect(ctr.x.toFixed(4)).toBe('1903587.7525');
        expect(ctr.y.toFixed(4)).toBe('-2577456.5938');
        expect(ctr.crs).toBe("EPSG:900913");
    });
    it('getBboxForExtent without the COMPUTE_BBOX_HOOK hook', () => {
        registerHook(COMPUTE_BBOX_HOOK, undefined);
        let bbox = getBbox(null, null, null);
        expect(bbox).toNotExist();
    });
    it('getBboxForExtent with a COMPUTE_BBOX_HOOK hook', () => {
        registerHook(COMPUTE_BBOX_HOOK, () => "bbox");
        let bbox = getBbox(null, null, null);
        expect(bbox).toBe("bbox");
    });
    it('getCurrentResolution using the RESOLUTION_HOOK', () => {
        registerHook(RESOLUTION_HOOK, () => {
            return 2;
        });
        expect(getCurrentResolution(5, 0, 21, 96)).toBe(2);
    });
    it('getCurrentResolution with no HOOK', () => {
        registerHook(RESOLUTION_HOOK, undefined );
        let resolution = getGoogleMercatorResolutions(0, 21, 96)[2];
        let resolution2 = getCurrentResolution(2, 0, 21, 96);
        expect(resolution2).toEqual(resolution);
    });

    it('save map configuration', () => {

        const flat = [
            {
                allowedSRS: {},
                bbox: {},
                dimensions: [],
                id: "layer001",
                loading: true,
                name: "layer001",
                params: {},
                search: {},
                singleTile: false,
                title: "layer001",
                type: "wms",
                url: "",
                visibility: true,
                catalogURL: "url"
            },
            {
                allowedSRS: {},
                bbox: {},
                dimensions: [],
                id: "layer002",
                loading: true,
                name: "layer002",
                params: {},
                search: {},
                singleTile: false,
                title: "layer002",
                type: "wms",
                url: "",
                visibility: true,
                catalogURL: "url"
            },
            {
                allowedSRS: {},
                bbox: {},
                dimensions: [],
                id: "layer003",
                loading: true,
                name: "layer003",
                params: {},
                search: {},
                singleTile: false,
                title: "layer003",
                type: "wms",
                url: "",
                visibility: true,
                catalogURL: "url"
            }
        ];

        const groups = [
            {expanded: true, id: 'Default', name: 'Default', title: 'Default', nodes: ['layer001', 'layer002']},
            {expanded: false, id: 'custom', name: 'custom', title: 'custom',
                nodes: [{expanded: true, id: 'custom.nested001', name: 'nested001', title: 'nested001', nodes: ['layer003']}
            ]}
        ];

        const mapConfig = {
            center: {x: 0, y: 0, crs: 'EPSG:4326'},
            maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
            projection: 'EPSG:900913',
            units: 'm',
            zoom: 10
        };

        const saved = saveMapConfiguration(mapConfig, flat, groups, '', {});
        expect(saved).toEqual({
            map: {
                center: {crs: 'EPSG:4326', x: 0, y: 0},
                groups: [{
                    id: 'Default',
                    expanded: true
                }, {
                    id: 'custom',
                    expanded: false
                }, {
                    id: 'custom.nested001',
                    expanded: true
                }],
                layers: [{
                    allowedSRS: {},
                    availableStyles: undefined,
                    bbox: {},
                    capabilitiesURL: undefined,
                    description: undefined,
                    dimensions: [],
                    nativeCrs: undefined,
                    features: undefined,
                    featureInfo: undefined,
                    format: undefined,
                    group: undefined,
                    hideLoading: false,
                    handleClickOnLayer: false,
                    id: "layer001",
                    matrixIds: undefined,
                    maxZoom: undefined,
                    maxNativeZoom: undefined,
                    name: "layer001",
                    opacity: undefined,
                    params: {},
                    provider: undefined,
                    search: {},
                    singleTile: false,
                    source: undefined,
                    style: undefined,
                    styleName: undefined,
                    styles: undefined,
                    tileMatrixSet: undefined,
                    tiled: undefined,
                    title: "layer001",
                    transparent: undefined,
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url"
                },
                {
                    allowedSRS: {},
                    availableStyles: undefined,
                    bbox: {},
                    capabilitiesURL: undefined,
                    description: undefined,
                    dimensions: [],
                    nativeCrs: undefined,
                    features: undefined,
                    featureInfo: undefined,
                    format: undefined,
                    group: undefined,
                    hideLoading: false,
                    handleClickOnLayer: false,
                    id: "layer002",
                    matrixIds: undefined,
                    maxZoom: undefined,
                    maxNativeZoom: undefined,
                    name: "layer002",
                    opacity: undefined,
                    params: {},
                    provider: undefined,
                    search: {},
                    singleTile: false,
                    source: undefined,
                    style: undefined,
                    styleName: undefined,
                    styles: undefined,
                    tileMatrixSet: undefined,
                    tiled: undefined,
                    title: "layer002",
                    transparent: undefined,
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url"
                },
                {
                    allowedSRS: {},
                    availableStyles: undefined,
                    bbox: {},
                    capabilitiesURL: undefined,
                    description: undefined,
                    dimensions: [],
                    nativeCrs: undefined,
                    features: undefined,
                    featureInfo: undefined,
                    format: undefined,
                    group: undefined,
                    hideLoading: false,
                    handleClickOnLayer: false,
                    id: "layer003",
                    matrixIds: undefined,
                    maxZoom: undefined,
                    maxNativeZoom: undefined,
                    name: "layer003",
                    opacity: undefined,
                    params: {},
                    provider: undefined,
                    search: {},
                    singleTile: false,
                    source: undefined,
                    style: undefined,
                    styleName: undefined,
                    styles: undefined,
                    tileMatrixSet: undefined,
                    tiled: undefined,
                    title: "layer003",
                    transparent: undefined,
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url"
                }],
                maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                projection: 'EPSG:900913',
                text_serch_config: '',
                units: 'm',
                zoom: 10
            },
            version: 2
        });
    });

    it('save map configuration with tile matrix', () => {

        const flat = [
            {
                allowedSRS: {},
                bbox: {},
                description: undefined,
                dimensions: [],
                id: "layer001",
                loading: true,
                name: "layer001",
                params: {},
                search: {},
                singleTile: false,
                title: "layer001",
                type: "wms",
                url: "http:url001",
                visibility: true,
                catalogURL: "url",
                matrixIds: {
                    'EPSG:4326': [{
                        identifier: 'EPSG:4326:0'
                    }]
                },
                tileMatrixSet: [{
                    TileMatrix: [{
                        'ows:Identifier': 'EPSG:4326:0'
                    }],
                    'ows:Identifier': "EPSG:4326",
                    'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                }, {
                    TileMatrix: [{
                        'ows:Identifier': 'custom:0'
                    }],
                    'ows:Identifier': "custom",
                    'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                }]
            },
            {
                allowedSRS: {},
                bbox: {},
                description: undefined,
                dimensions: [],
                id: "layer002",
                loading: true,
                name: "layer002",
                params: {},
                search: {},
                singleTile: false,
                title: "layer002",
                type: "wms",
                url: "http:url001",
                visibility: true,
                catalogURL: "url"
            },
            {
                allowedSRS: {},
                bbox: {},
                description: undefined,
                dimensions: [],
                id: "layer003",
                loading: true,
                name: "layer003",
                params: {},
                search: {},
                singleTile: false,
                title: "layer003",
                type: "wms",
                url: "http:url001",
                visibility: true,
                catalogURL: "url"
            }
        ];

        const groups = [
            {expanded: true, id: 'Default', name: 'Default', title: 'Default', nodes: ['layer001', 'layer002']},
            {expanded: false, id: 'custom', name: 'custom', title: 'custom',
                nodes: [{expanded: true, id: 'custom.nested001', name: 'nested001', title: 'nested001', nodes: ['layer003']}
            ]}
        ];

        const mapConfig = {
            center: {x: 0, y: 0, crs: 'EPSG:4326'},
            maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
            projection: 'EPSG:900913',
            units: 'm',
            zoom: 10
        };

        const saved = saveMapConfiguration(mapConfig, flat, groups, '', {});
        expect(saved).toEqual({
            map: {
                center: {crs: 'EPSG:4326', x: 0, y: 0},
                groups: [{
                    id: 'Default',
                    expanded: true
                }, {
                    id: 'custom',
                    expanded: false
                }, {
                    id: 'custom.nested001',
                    expanded: true
                }],
                layers: [{
                    allowedSRS: {},
                    availableStyles: undefined,
                    bbox: {},
                    capabilitiesURL: undefined,
                    description: undefined,
                    dimensions: [],
                    nativeCrs: undefined,
                    features: undefined,
                    featureInfo: undefined,
                    format: undefined,
                    group: undefined,
                    hideLoading: false,
                    handleClickOnLayer: false,
                    id: "layer001",
                    matrixIds: ['EPSG:4326'],
                    maxZoom: undefined,
                    maxNativeZoom: undefined,
                    name: "layer001",
                    opacity: undefined,
                    params: {},
                    provider: undefined,
                    search: {},
                    singleTile: false,
                    source: undefined,
                    style: undefined,
                    styleName: undefined,
                    styles: undefined,
                    tileMatrixSet: true,
                    tiled: undefined,
                    title: "layer001",
                    transparent: undefined,
                    type: "wms",
                    url: "http:url001",
                    visibility: true,
                    catalogURL: "url"
                },
                {
                    allowedSRS: {},
                    availableStyles: undefined,
                    bbox: {},
                    capabilitiesURL: undefined,
                    description: undefined,
                    dimensions: [],
                    nativeCrs: undefined,
                    features: undefined,
                    featureInfo: undefined,
                    format: undefined,
                    group: undefined,
                    hideLoading: false,
                    handleClickOnLayer: false,
                    id: "layer002",
                    matrixIds: undefined,
                    maxZoom: undefined,
                    maxNativeZoom: undefined,
                    name: "layer002",
                    opacity: undefined,
                    params: {},
                    provider: undefined,
                    search: {},
                    singleTile: false,
                    source: undefined,
                    style: undefined,
                    styleName: undefined,
                    styles: undefined,
                    tileMatrixSet: undefined,
                    tiled: undefined,
                    title: "layer002",
                    transparent: undefined,
                    type: "wms",
                    url: "http:url001",
                    visibility: true,
                    catalogURL: "url"
                },
                {
                    allowedSRS: {},
                    availableStyles: undefined,
                    bbox: {},
                    capabilitiesURL: undefined,
                    description: undefined,
                    dimensions: [],
                    nativeCrs: undefined,
                    features: undefined,
                    featureInfo: undefined,
                    format: undefined,
                    group: undefined,
                    hideLoading: false,
                    handleClickOnLayer: false,
                    id: "layer003",
                    matrixIds: undefined,
                    maxZoom: undefined,
                    maxNativeZoom: undefined,
                    name: "layer003",
                    opacity: undefined,
                    params: {},
                    provider: undefined,
                    search: {},
                    singleTile: false,
                    source: undefined,
                    style: undefined,
                    styleName: undefined,
                    styles: undefined,
                    tileMatrixSet: undefined,
                    tiled: undefined,
                    title: "layer003",
                    transparent: undefined,
                    type: "wms",
                    url: "http:url001",
                    visibility: true,
                    catalogURL: "url"
                }],
                maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                projection: 'EPSG:900913',
                text_serch_config: '',
                units: 'm',
                zoom: 10,
                sources: {
                    'http:url001': {
                        tileMatrixSet: {
                            'EPSG:4326': {
                                TileMatrix: [{
                                    'ows:Identifier': 'EPSG:4326:0'
                                }],
                                'ows:Identifier': "EPSG:4326",
                                'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                            }
                        }
                    }
                }
            },
            version: 2
        });
    });

    it('extract TileMatrixSet from layers without sources and grouped layers', () => {
        expect(extractTileMatrixSetFromLayers()).toEqual({});
    });

    it('extract TileMatrixSet from layers without sources and empty grouped layers', () => {
        expect(extractTileMatrixSetFromLayers({})).toEqual({});
    });

    it('extract TileMatrixSet from layers with sources and empty grouped layers', () => {
        expect(extractTileMatrixSetFromLayers(null, {data: 'data'})).toEqual({data: 'data'});
    });

    it('extract TileMatrixSet from layers without sources', () => {

        const groupedLayersByUrl = {
            'http:url001': [
                {
                    id: "layer001",
                    matrixIds: {
                        'EPSG:4326': [{
                            identifier: 'EPSG:4326:0'
                        }]
                    },
                    tileMatrixSet: [{
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    }, {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }]
                },
                {
                    id: "layer003",
                    matrixIds: {
                        'custom': [{
                            identifier: 'custom'
                        }]
                    },
                    tileMatrixSet: [{
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    }, {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }]
                }
            ],
            'http:url002': [
                {
                    id: "layer002",
                    matrixIds: {
                        'custom': [
                            {
                                identifier: 'custom:0',
                                ranges: {
                                    cols: {
                                        min: 0,
                                        max: 1
                                    },
                                    rows: {
                                        min: 0,
                                        max: 1
                                    }
                                }
                            }
                        ]
                    },
                    tileMatrixSet: [{
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    }, {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }]
                }
            ]
        };

        const newSources = extractTileMatrixSetFromLayers(groupedLayersByUrl);

        expect(newSources).toEqual({
            'http:url001': {
                tileMatrixSet: {
                    'EPSG:4326': {
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    },
                    'custom': {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            },
            'http:url002': {
                tileMatrixSet: {
                    'custom': {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0',
                            ranges: {
                                cols: {
                                    min: 0,
                                    max: 1
                                },
                                rows: {
                                    min: 0,
                                    max: 1
                                }
                            }
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            }
        });

    });

    it('extract TileMatrixSet from layers with sources', () => {

        const groupedLayersByUrl = {
            'http:url001': [
                {
                    id: "layer001",
                    matrixIds: {
                        'EPSG:4326': [{
                            identifier: 'EPSG:4326:0'
                        }]
                    },
                    tileMatrixSet: [{
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    }, {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }]
                },
                {
                    id: "layer003",
                    matrixIds: {
                        'custom': [{
                            identifier: 'custom'
                        }]
                    },
                    tileMatrixSet: [{
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    }, {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }]
                }
            ],
            'http:url002': [
                {
                    id: "layer002",
                    matrixIds: {
                        'custom': [
                            {
                                identifier: 'custom:0',
                                ranges: {
                                    cols: {
                                        min: 0,
                                        max: 1
                                    },
                                    rows: {
                                        min: 0,
                                        max: 1
                                    }
                                }
                            }
                        ]
                    },
                    tileMatrixSet: [{
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    }, {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }]
                }
            ]
        };

        const sources = {
            'http:url003': {
                data: 'data'
            },
            'http:url002': {
                tileMatrixSet: {
                    'fromsources': {
                        TileMatrix: [{
                            'ows:Identifier': 'fromsources:0'
                        }],
                        'ows:Identifier': "fromsources",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            }
        };

        const newSources = extractTileMatrixSetFromLayers(groupedLayersByUrl, sources);

        expect(newSources).toEqual({
            'http:url001': {
                tileMatrixSet: {
                    'EPSG:4326': {
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    },
                    'custom': {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            },
            'http:url002': {
                tileMatrixSet: {
                    'custom': {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0',
                            ranges: {
                                cols: {
                                    min: 0,
                                    max: 1
                                },
                                rows: {
                                    min: 0,
                                    max: 1
                                }
                            }
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    },
                    'fromsources': {
                        TileMatrix: [{
                            'ows:Identifier': 'fromsources:0'
                        }],
                        'ows:Identifier': "fromsources",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            },
            'http:url003': {
                data: 'data'
            }
        });

    });

});
