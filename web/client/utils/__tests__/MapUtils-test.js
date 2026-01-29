/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { keys, sortBy } from 'lodash';

import {
    RESOLUTIONS_HOOK,
    EXTENT_TO_ZOOM_HOOK,
    COMPUTE_BBOX_HOOK,
    RESOLUTION_HOOK,
    DEFAULT_SCREEN_DPI,
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
    getIdFromUri,
    getSimpleGeomType,
    isSimpleGeomType,
    compareMapChanges,
    mergeMapConfigs,
    addRootParentGroup,
    mapUpdated,
    getZoomFromResolution,
    getResolutionObject,
    reprojectZoom,
    getRandomPointInCRS,
    convertResolution,
    getExactZoomFromResolution,
    recursiveIsChangedWithRules,
    filterFieldByRules,
    prepareObjectEntries,
    parseFieldValue
} from '../MapUtils';
import { VisualizationModes } from '../MapTypeUtils';

const POINT = "Point";
const CIRCLE = "Circle";
const LINE_STRING = "LineString";
const POLYGON = "Polygon";
const MULTI_POINT = "MultiPoint";
const MULTI_LINE_STRING = "MultiLineString";
const MULTI_POLYGON = "MultiPolygon";
const GEOMETRY_COLLECTION = "GeometryCollection";
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
    it('getResolutions with projection', () => {
        registerHook(RESOLUTIONS_HOOK, (projection) => {
            if (projection === "EPSG:4326") return [1, 2, 3, 4];
            return  getGoogleMercatorResolutions(0, 21, DEFAULT_SCREEN_DPI);
        });
        expect(getResolutions("EPSG:4326").length !== getResolutions("EPSG:3857").length).toBe(true);
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

    describe("saveMapConfiguration", () => {
        const TEST_RESOLUTIONS = [
            84666.66666666688,
            42333.33333333344,
            21166.66666666672,
            10583.33333333336,
            5291.66666666668,
            2645.83333333334,
            1322.91666666667,
            661.458333333335000,
            529.166666666668000,
            396.875000000001000,
            264.583333333334000,
            132.291666666667000,
            66.145833333333500,
            39.687500000000100,
            26.458333333333400,
            13.229166666666700,
            6.614583333333350,
            3.968750000000010,
            2.645833333333340,
            1.322916666666670,
            0.661458333333335
        ];
        const LAYER_DEFAULTS = {
            thumbURL: undefined,
            layerFilter: undefined,
            bbox: undefined,
            requestEncoding: undefined,
            capabilitiesURL: undefined,
            description: undefined,
            dimensions: [],
            features: undefined,
            queryable: undefined,
            featureInfo: undefined,
            format: undefined,
            group: undefined,
            hideLoading: false,
            handleClickOnLayer: false,
            maxZoom: undefined,
            maxNativeZoom: undefined,
            opacity: undefined,
            provider: undefined,
            serverType: undefined,
            singleTile: false,
            source: undefined,
            style: undefined,
            styleName: undefined,
            styles: undefined,
            tiled: undefined,
            transparent: undefined,
            visibility: true,
            hidden: false,
            useForElevation: false,
            origin: undefined,
            thematic: undefined,
            tooltipOptions: undefined,
            tooltipPlacement: undefined,
            legendOptions: undefined,
            allowedSRS: undefined,
            tileSize: undefined,
            version: undefined,
            minResolution: undefined,
            maxResolution: undefined,
            disableResolutionLimits: undefined,
            fields: undefined
        };
        // utility function to apply defaults to layers
        const applyLayerDefaults = (layers) => layers.map((layer) => {
            return {...LAYER_DEFAULTS, ...layer};
        });
        it('save map configuration', () => {

            const flat = [
                {
                    id: "layer001",
                    loading: true,
                    name: "layer001",
                    search: {},
                    thumbURL: "THUMB_URL",
                    title: "layer001",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url",
                    bbox: {
                        crs: 'EPSG:4326',
                        bounds: {
                            minx: '-74.02722',
                            miny: '40.684221',
                            maxx: '-73.907005',
                            maxy: '40.878178'
                        }
                    }
                },
                {
                    "allowedSRS": {
                        "EPSG:3857": true
                    },
                    id: "layer002",
                    loading: true,
                    name: "layer002",
                    search: {},
                    title: "layer002",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url",
                    version: '1.3.0'
                },
                {
                    id: "layer003",
                    loading: true,
                    name: "layer003",
                    search: {},
                    title: "layer003",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url"
                },
                {
                    id: "layer004",
                    loading: true,
                    name: "layer004",
                    search: {},
                    title: "layer004",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url",
                    origin: [100000, 100000],
                    sources: [{url: "url"}],
                    extendedParams: {
                        fromExtension1: {
                            testBool: true
                        },
                        fromPlugin2: {
                            name: "plugin"
                        }
                    }
                }
            ];
            const groups = [
                {expanded: true, id: 'Default', name: 'Default', title: 'Default', nodes: ['layer001', 'layer002']},
                {
                    expanded: false,
                    id: 'custom',
                    name: 'custom',
                    title: 'custom',
                    description: 'custom-description',
                    tooltipOptions: 'both',
                    tooltipPlacement: 'right',
                    nodes: [{expanded: true, id: 'custom.nested001', name: 'nested001', title: 'nested001', nodes: ['layer003']}
                    ]}
            ];

            const mapConfig = {
                center: {x: 0, y: 0, crs: 'EPSG:4326'},
                maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                projection: 'EPSG:900913',
                units: 'm',
                mapInfoControl: true,
                zoom: 10
            };

            const saved = saveMapConfiguration(mapConfig, flat, groups, [], '', {});
            expect(saved).toEqual({
                map: {
                    center: {crs: 'EPSG:4326', x: 0, y: 0},
                    backgrounds: [],
                    mapInfoControl: true,
                    groups: [{
                        id: 'Default',
                        title: 'Default',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom',
                        title: 'custom',
                        expanded: false,
                        description: 'custom-description',
                        tooltipOptions: 'both',
                        tooltipPlacement: 'right',
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom.nested001',
                        title: 'nested001',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }],
                    layers: applyLayerDefaults([{
                        thumbURL: "THUMB_URL",
                        id: "layer001",
                        search: {},
                        name: "layer001",
                        title: "layer001",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        bbox: {
                            crs: 'EPSG:4326',
                            bounds: {
                                minx: '-74.02722',
                                miny: '40.684221',
                                maxx: '-73.907005',
                                maxy: '40.878178'
                            }
                        },
                        expanded: false
                    },
                    {
                        "allowedSRS": {
                            "EPSG:3857": true
                        },
                        search: {},
                        id: "layer002",
                        name: "layer002",
                        title: "layer002",
                        type: "wms",
                        url: "",
                        catalogURL: "url",
                        version: '1.3.0',
                        expanded: false
                    },
                    {
                        search: {},
                        id: "layer003",
                        name: "layer003",
                        title: "layer003",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        expanded: false
                    },
                    {
                        search: {},
                        id: "layer004",
                        name: "layer004",
                        title: "layer004",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        origin: [100000, 100000],
                        sources: [{url: "url"}],
                        extendedParams: {
                            fromExtension1: {
                                testBool: true
                            },
                            fromPlugin2: {
                                name: "plugin"
                            }
                        },
                        expanded: false
                    }]),
                    mapOptions: {},
                    maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                    projection: 'EPSG:900913',
                    text_search_config: '',
                    bookmark_search_config: {},
                    units: 'm',
                    zoom: 10
                },
                version: 2
            });
        });

        it('save map configuration with backgrounds', () => {

            const flat = [
                {
                    id: "layer001",
                    loading: true,
                    name: "layer001", search: {},
                    thumbURL: "THUMB_URL",
                    title: "layer001",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url"
                },
                {
                    id: "layer002",
                    loading: true,
                    name: "layer002", search: {},
                    title: "layer002",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url"
                },
                {
                    id: "layer003",
                    loading: true,
                    name: "layer003", search: {},
                    title: "layer003",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url"
                },
                {
                    id: "layer004",
                    loading: true,
                    name: "layer004", search: {},
                    title: "layer004",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url",
                    origin: [100000, 100000]
                },
                {
                    id: "layer005",
                    loading: true,
                    name: "layer005",
                    group: "background", search: {},
                    title: "layer005",
                    type: "wms",
                    url: "",
                    thumbURL: "blob:http://name.domain/id",
                    visibility: true,
                    catalogURL: "url",
                    origin: [100000, 100000]
                },
                {
                    id: "layer006",
                    loading: true,
                    name: "layer006",
                    group: "background", search: {},
                    title: "layer006",
                    type: "wms",
                    url: "",
                    visibility: false,
                    catalogURL: "url",
                    origin: [100000, 100000]
                }
            ];

            const groups = [
                {expanded: true, id: 'Default', name: 'Default', title: 'Default', nodes: ['layer001', 'layer002']},
                {expanded: false, id: 'custom', name: 'custom', title: 'custom',
                    nodes: [{expanded: true, id: 'custom.nested001', name: 'nested001', title: 'nested001', nodes: ['layer003']}
                    ]}
            ];

            const backgrounds = [{id: 'layer005', thumbnail: 'data'}, {id: 'layer006', thumbnail: null}];

            const mapConfig = {
                center: {x: 0, y: 0, crs: 'EPSG:4326'},
                maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                projection: 'EPSG:900913',
                units: 'm',
                zoom: 10
            };

            const saved = saveMapConfiguration(mapConfig, flat, groups, backgrounds, '', {});
            expect(saved).toEqual({
                map: {
                    center: {crs: 'EPSG:4326', x: 0, y: 0},
                    backgrounds: [{id: 'layer005', thumbnail: 'data'}],
                    mapInfoControl: undefined,
                    groups: [{
                        id: 'Default',
                        title: 'Default',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom',
                        title: 'custom',
                        expanded: false,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom.nested001',
                        title: 'nested001',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }],
                    layers: applyLayerDefaults([{
                        thumbURL: "THUMB_URL",
                        id: "layer001",
                        name: "layer001", search: {},
                        title: "layer001",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        expanded: false
                    },
                    {
                        id: "layer002",
                        name: "layer002", search: {},
                        title: "layer002",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        expanded: false
                    },
                    {
                        id: "layer003",
                        name: "layer003", search: {},
                        title: "layer003",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        expanded: false
                    },
                    {
                        id: "layer004",
                        name: "layer004", search: {},
                        title: "layer004",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        origin: [100000, 100000],
                        expanded: false
                    },
                    {
                        group: "background",
                        id: "layer005",
                        name: "layer005", search: {},
                        title: "layer005",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        origin: [100000, 100000],
                        expanded: false
                    },
                    {
                        group: "background",
                        id: "layer006",
                        name: "layer006", search: {},
                        title: "layer006",
                        type: "wms",
                        url: "",
                        visibility: false,
                        catalogURL: "url",
                        origin: [100000, 100000],
                        expanded: false
                    }]),
                    mapOptions: {},
                    maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                    projection: 'EPSG:900913',
                    text_search_config: '',
                    bookmark_search_config: {},
                    units: 'm',
                    zoom: 10
                },
                version: 2
            });
        });

        it('save map configuration with map options', () => {
            const flat = [
                {
                    id: "layer001",
                    loading: true,
                    name: "layer001", search: {},
                    thumbURL: "THUMB_URL",
                    title: "layer001",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url",
                    legendOptions: { legendWidth: "", legendHeight: 40}
                },
                {
                    id: "layer002",
                    loading: true,
                    name: "layer002", search: {},
                    title: "layer002",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url"
                },
                {
                    id: "layer003",
                    loading: true,
                    name: "layer003", search: {},
                    title: "layer003",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url",
                    tooltipOptions: "both",
                    tooltipPlacement: "right",
                    legendOptions: { legendWidth: 20, legendHeight: 40}
                }
            ];

            const groups = [
                { expanded: true, id: 'Default', name: 'Default', title: 'Default', nodes: ['layer001', 'layer002'] },
                {
                    expanded: false, id: 'custom', name: 'custom', title: 'custom',
                    nodes: [{ expanded: true, id: 'custom.nested001', name: 'nested001', title: 'nested001', nodes: ['layer003'] }
                    ]
                }
            ];

            const mapConfig = {
                center: { x: 0, y: 0, crs: 'EPSG:4326' },
                maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                projection: 'EPSG:900913',
                units: 'm',
                zoom: 10,
                mapOptions: {
                    view: {
                        resolutions: TEST_RESOLUTIONS
                    }
                }
            };
            const saved = saveMapConfiguration(mapConfig, flat, groups, [], '', {});
            expect(saved).toEqual({
                map: {
                    center: { crs: 'EPSG:4326', x: 0, y: 0 },
                    backgrounds: [],
                    mapInfoControl: undefined,
                    groups: [{
                        id: 'Default',
                        title: 'Default',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom',
                        title: 'custom',
                        expanded: false,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom.nested001',
                        title: 'nested001',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }],
                    layers: applyLayerDefaults([{
                        thumbURL: "THUMB_URL",
                        id: "layer001",
                        name: "layer001", search: {},
                        title: "layer001",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        legendOptions: { legendWidth: "", legendHeight: 40},
                        expanded: false
                    },
                    {
                        id: "layer002",
                        name: "layer002", search: {},
                        title: "layer002",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        expanded: false
                    },
                    {
                        id: "layer003",
                        name: "layer003", search: {},
                        title: "layer003",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        tooltipOptions: "both",
                        tooltipPlacement: "right",
                        legendOptions: { legendWidth: 20, legendHeight: 40},
                        expanded: false
                    }]),
                    mapOptions: {
                        view: {
                            resolutions: TEST_RESOLUTIONS
                        }
                    },
                    maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                    projection: 'EPSG:900913',
                    text_search_config: '',
                    bookmark_search_config: {},
                    units: 'm',
                    zoom: 10
                },
                version: 2
            });
        });

        it('save map configuration with tile matrix', () => {

            const flat = [
                {
                    description: undefined,
                    id: "layer001",
                    loading: true,
                    name: "layer001", search: {},
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
                    description: undefined,
                    id: "layer002",
                    loading: true,
                    name: "layer002", search: {},
                    title: "layer002",
                    type: "wms",
                    url: "http:url001",
                    visibility: true,
                    catalogURL: "url"
                },
                {
                    description: undefined,
                    id: "layer003",
                    loading: true,
                    name: "layer003", search: {},
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

            const saved = saveMapConfiguration(mapConfig, flat, groups, [], '', {});
            expect(saved).toEqual({
                map: {
                    center: {crs: 'EPSG:4326', x: 0, y: 0},
                    backgrounds: [],
                    mapInfoControl: undefined,
                    groups: [{
                        id: 'Default',
                        title: 'Default',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom',
                        title: 'custom',
                        expanded: false,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom.nested001',
                        title: 'nested001',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }],
                    layers: applyLayerDefaults([{
                        id: "layer001",
                        name: "layer001", search: {},
                        availableTileMatrixSets: {
                            'EPSG:4326': {
                                crs: 'EPSG:4326',
                                tileMatrixSetLink: 'sources[\'http:url001\'].tileMatrixSet[\'EPSG:4326\']'
                            }
                        },
                        title: "layer001",
                        type: "wms",
                        url: "http:url001",
                        visibility: true,
                        catalogURL: "url",
                        expanded: false
                    },
                    {
                        id: "layer002",
                        name: "layer002", search: {},
                        title: "layer002",
                        type: "wms",
                        url: "http:url001",
                        visibility: true,
                        catalogURL: "url",
                        expanded: false
                    },
                    {
                        id: "layer003",
                        name: "layer003", search: {},
                        title: "layer003",
                        type: "wms",
                        url: "http:url001",
                        visibility: true,
                        catalogURL: "url",
                        expanded: false
                    }]),
                    mapOptions: {},
                    maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                    projection: 'EPSG:900913',
                    text_search_config: '',
                    bookmark_search_config: {},
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
        it('save map configuration with annotations with geodesic lines', () => {
            const flat = [
                {
                    id: "annotations",
                    loading: true,
                    name: "annotations", search: {},
                    title: "annotations",
                    type: "vector",
                    url: "",
                    features: [{
                        type: "FeatureCollection",
                        features: [{
                            type: "Feature",
                            geometry: {
                                type: "MultiPoint",
                                coordinates: [[1, 1], [2, 2]]
                            },
                            properties: {
                                geometryGeodesic: {
                                    type: "LineString",
                                    coordinates: [[1, 1], [2, 2], [1, 1], [2, 2], [1, 1], [2, 2], [1, 1], [2, 2], [1, 1], [2, 2], [1, 1], [2, 2]]
                                },
                                useGeodesicLines: true
                            }
                        }]
                    }],
                    visibility: true,
                    catalogURL: "url"
                }
            ];

            const groups = [
                { expanded: true, id: 'Default', name: 'Default', title: 'Default', nodes: ['layer001', 'layer002'] },
                {
                    expanded: false, id: 'custom', name: 'custom', title: 'custom',
                    nodes: [{ expanded: true, id: 'custom.nested001', name: 'nested001', title: 'nested001', nodes: ['layer003'] }
                    ]
                }
            ];
            const mapConfig = {
                center: { x: 0, y: 0, crs: 'EPSG:4326' },
                maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                projection: 'EPSG:900913',
                units: 'm',
                zoom: 10,
                mapOptions: {
                    view: {
                        resolutions: TEST_RESOLUTIONS
                    }
                }
            };

            const saved = saveMapConfiguration(mapConfig, flat, groups, [], '', {});
            expect(saved).toEqual({
                version: 2,
                map: {
                    center: {
                        x: 0,
                        y: 0,
                        crs: 'EPSG:4326'
                    },
                    maxExtent: [ -20037508.34, -20037508.34, 20037508.34, 20037508.34 ],
                    projection: 'EPSG:900913',
                    units: 'm',
                    zoom: 10,
                    mapOptions: {
                        view: {
                            resolutions: TEST_RESOLUTIONS
                        }
                    },
                    mapInfoControl: undefined,
                    backgrounds: [],
                    layers: applyLayerDefaults([{
                        id: 'annotations',
                        features: [ {
                            type: "FeatureCollection",
                            features: [{
                                type: "Feature",
                                geometry: {
                                    type: "MultiPoint",
                                    coordinates: [[1, 1], [2, 2]]
                                },
                                properties: {
                                    geometryGeodesic: null,
                                    useGeodesicLines: true
                                }
                            }]
                        }],
                        search: {},
                        name: 'annotations',
                        title: 'annotations',
                        type: 'vector',
                        url: '',
                        visibility: true,
                        catalogURL: 'url',
                        expanded: false
                    } ]),
                    groups: [ {
                        id: 'Default',
                        title: 'Default',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom',
                        title: 'custom',
                        expanded: false,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom.nested001',
                        title: 'nested001',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }],
                    text_search_config: '', bookmark_search_config: {} }
            });
        });

        it('save map configuration with tile matrix and map info configuration', () => {
            const flat = [
                {
                    description: undefined,
                    id: "layer001",
                    loading: true,
                    name: "layer001", search: {},
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
                text_search_config: '',
                units: 'm',
                zoom: 10
            };
            const saved = saveMapConfiguration(mapConfig, flat, groups, [], '',  {}, { mapInfoConfiguration: {infoFormat: "text/html", showEmptyMessageGFI: false}});
            expect(saved).toEqual({
                map: {
                    center: {crs: 'EPSG:4326', x: 0, y: 0},
                    backgrounds: [],
                    mapInfoControl: undefined,
                    groups: [{
                        id: 'Default',
                        title: 'Default',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom',
                        title: 'custom',
                        expanded: false,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom.nested001',
                        title: 'nested001',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }],
                    layers: applyLayerDefaults([{
                        id: "layer001",
                        name: "layer001", search: {},
                        availableTileMatrixSets: {
                            'EPSG:4326': {
                                crs: 'EPSG:4326',
                                tileMatrixSetLink: 'sources[\'http:url001\'].tileMatrixSet[\'EPSG:4326\']'
                            }
                        },
                        title: "layer001",
                        type: "wms",
                        url: "http:url001",
                        visibility: true,
                        catalogURL: "url",
                        expanded: false
                    }]),
                    mapOptions: {},
                    maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                    projection: 'EPSG:900913',
                    text_search_config: '',
                    bookmark_search_config: {},
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
                mapInfoConfiguration: {
                    infoFormat: "text/html",
                    showEmptyMessageGFI: false
                },
                version: 2
            });
        });

        it('save map configuration with tile matrix and map info configuration', () => {
            const flat = [
                {
                    description: undefined,
                    id: "layer001",
                    loading: true,
                    name: "layer001", search: {},
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
                text_search_config: '',
                units: 'm',
                zoom: 10
            };
            const saved = saveMapConfiguration(mapConfig, flat, groups, [], '', {}, { mapInfoConfiguration: {infoFormat: "text/html", showEmptyMessageGFI: false}});
            expect(saved).toEqual({
                map: {
                    center: {crs: 'EPSG:4326', x: 0, y: 0},
                    backgrounds: [],
                    mapInfoControl: undefined,
                    groups: [{
                        id: 'Default',
                        title: 'Default',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom',
                        title: 'custom',
                        expanded: false,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom.nested001',
                        title: 'nested001',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }],
                    layers: applyLayerDefaults([{
                        id: "layer001",
                        name: "layer001", search: {},
                        styles: undefined,
                        availableTileMatrixSets: {
                            'EPSG:4326': {
                                crs: 'EPSG:4326',
                                tileMatrixSetLink: 'sources[\'http:url001\'].tileMatrixSet[\'EPSG:4326\']'
                            }
                        },
                        title: "layer001",
                        type: "wms",
                        url: "http:url001",
                        visibility: true,
                        catalogURL: "url",
                        expanded: false
                    }]),
                    mapOptions: {},
                    maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                    projection: 'EPSG:900913',
                    text_search_config: '',
                    bookmark_search_config: {},
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
                mapInfoConfiguration: {
                    infoFormat: "text/html",
                    showEmptyMessageGFI: false
                },
                version: 2
            });
        });

        it('save map configuration with bookmark config', () => {

            const flat = [
                {
                    id: "layer001",
                    loading: true,
                    name: "layer001", search: {},
                    thumbURL: "THUMB_URL",
                    title: "layer001",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url"
                },
                {
                    id: "layer002",
                    loading: true,
                    name: "layer002", search: {},
                    title: "layer002",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url"
                },
                {
                    id: "layer003",
                    loading: true,
                    name: "layer003", search: {},
                    title: "layer003",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url"
                },
                {
                    id: "layer004",
                    loading: true,
                    name: "layer004", search: {},
                    title: "layer004",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url",
                    origin: [100000, 100000]
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
                text_search_config: '',
                units: 'm',
                mapInfoControl: true,
                zoom: 10
            };

            const saved = saveMapConfiguration(mapConfig, flat, groups, [], '', {
                bookmarks: [{
                    options: {west: -123, south: 42, east: -60, north: 53},
                    title: 'Vancover', layerVisibilityReload: true
                }]});
            expect(saved).toEqual({
                map: {
                    center: {crs: 'EPSG:4326', x: 0, y: 0},
                    backgrounds: [],
                    mapInfoControl: true,
                    groups: [{
                        id: 'Default',
                        title: 'Default',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom',
                        title: 'custom',
                        expanded: false,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom.nested001',
                        title: 'nested001',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }],
                    layers: applyLayerDefaults([{
                        thumbURL: "THUMB_URL",
                        id: "layer001",
                        name: "layer001", search: {},
                        title: "layer001",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        expanded: false
                    },
                    {
                        id: "layer002",
                        name: "layer002", search: {},
                        title: "layer002",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        expanded: false
                    },
                    {
                        id: "layer003",
                        name: "layer003", search: {},
                        title: "layer003",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        expanded: false
                    },
                    {
                        id: "layer004",
                        name: "layer004", search: {},
                        title: "layer004",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        origin: [100000, 100000],
                        expanded: false
                    }]),
                    mapOptions: {},
                    maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                    projection: 'EPSG:900913',
                    text_search_config: '',
                    bookmark_search_config: {
                        bookmarks: [{
                            options: {west: -123, south: 42, east: -60, north: 53},
                            title: 'Vancover', layerVisibilityReload: true
                        }]
                    },
                    units: 'm',
                    zoom: 10
                },
                version: 2
            });
        });
        it('save map configuration with viewerOptions and visualizationMode', () => {

            const flat = [];

            const groups = [];

            const mapConfig = {
                center: { x: 9, y: 44, crs: 'EPSG:4326' },
                maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                projection: 'EPSG:900913',
                units: 'm',
                mapInfoControl: true,
                zoom: 10,
                visualizationMode: VisualizationModes._3D,
                viewerOptions: {
                    cameraPosition: {
                        longitude: 12,
                        latitude: 41,
                        height: 352553
                    },
                    orientation: {
                        heading: 5.35,
                        pitch: -0.50,
                        roll: 0.00
                    }
                }
            };

            const saved = saveMapConfiguration(mapConfig, flat, groups, [], '', {});
            expect(saved).toEqual({
                map: {
                    center: { x: 9, y: 44, crs: 'EPSG:4326' },
                    backgrounds: [],
                    mapInfoControl: true,
                    groups: [],
                    layers: [],
                    mapOptions: {},
                    maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                    projection: 'EPSG:900913',
                    text_search_config: '',
                    bookmark_search_config: {},
                    units: 'm',
                    zoom: 10,
                    visualizationMode: VisualizationModes._3D,
                    viewerOptions: {
                        cameraPosition: {
                            longitude: 12,
                            latitude: 41,
                            height: 352553
                        },
                        orientation: {
                            heading: 5.35,
                            pitch: -0.50,
                            roll: 0.00
                        }
                    }
                },
                version: 2
            });
        });
        it('save map configuration with expaneded layers in legend', () => {

            const flat = [
                {
                    id: "layer001",
                    loading: true,
                    name: "layer001",
                    search: {},
                    thumbURL: "THUMB_URL",
                    title: "layer001",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url",
                    bbox: {
                        crs: 'EPSG:4326',
                        bounds: {
                            minx: '-74.02722',
                            miny: '40.684221',
                            maxx: '-73.907005',
                            maxy: '40.878178'
                        }
                    },
                    expanded: true
                },
                {
                    "allowedSRS": {
                        "EPSG:3857": true
                    },
                    id: "layer002",
                    loading: true,
                    name: "layer002",
                    search: {},
                    title: "layer002",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url",
                    version: '1.3.0'
                },
                {
                    id: "layer003",
                    loading: true,
                    name: "layer003",
                    search: {},
                    title: "layer003",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url"
                },
                {
                    id: "layer004",
                    loading: true,
                    name: "layer004",
                    search: {},
                    title: "layer004",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url",
                    origin: [100000, 100000],
                    sources: [{url: "url"}],
                    extendedParams: {
                        fromExtension1: {
                            testBool: true
                        },
                        fromPlugin2: {
                            name: "plugin"
                        }
                    }
                }
            ];
            const groups = [
                {expanded: true, id: 'Default', name: 'Default', title: 'Default', nodes: ['layer001', 'layer002']},
                {
                    expanded: false,
                    id: 'custom',
                    name: 'custom',
                    title: 'custom',
                    description: 'custom-description',
                    tooltipOptions: 'both',
                    tooltipPlacement: 'right',
                    nodes: [{expanded: true, id: 'custom.nested001', name: 'nested001', title: 'nested001', nodes: ['layer003']}
                    ]}
            ];

            const mapConfig = {
                center: {x: 0, y: 0, crs: 'EPSG:4326'},
                maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                projection: 'EPSG:900913',
                units: 'm',
                mapInfoControl: true,
                zoom: 10
            };

            const saved = saveMapConfiguration(mapConfig, flat, groups, [], '', {});
            expect(saved).toEqual({
                map: {
                    center: {crs: 'EPSG:4326', x: 0, y: 0},
                    backgrounds: [],
                    mapInfoControl: true,
                    groups: [{
                        id: 'Default',
                        title: 'Default',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom',
                        title: 'custom',
                        expanded: false,
                        description: 'custom-description',
                        tooltipOptions: 'both',
                        tooltipPlacement: 'right',
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }, {
                        id: 'custom.nested001',
                        title: 'nested001',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }],
                    layers: applyLayerDefaults([{
                        thumbURL: "THUMB_URL",
                        id: "layer001",
                        search: {},
                        name: "layer001",
                        title: "layer001",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        bbox: {
                            crs: 'EPSG:4326',
                            bounds: {
                                minx: '-74.02722',
                                miny: '40.684221',
                                maxx: '-73.907005',
                                maxy: '40.878178'
                            }
                        },
                        expanded: true
                    },
                    {
                        "allowedSRS": {
                            "EPSG:3857": true
                        },
                        search: {},
                        id: "layer002",
                        name: "layer002",
                        title: "layer002",
                        type: "wms",
                        url: "",
                        catalogURL: "url",
                        version: '1.3.0',
                        expanded: false
                    },
                    {
                        search: {},
                        id: "layer003",
                        name: "layer003",
                        title: "layer003",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        expanded: false
                    },
                    {
                        search: {},
                        id: "layer004",
                        name: "layer004",
                        title: "layer004",
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        origin: [100000, 100000],
                        sources: [{url: "url"}],
                        extendedParams: {
                            fromExtension1: {
                                testBool: true
                            },
                            fromPlugin2: {
                                name: "plugin"
                            }
                        },
                        expanded: false
                    }]),
                    mapOptions: {},
                    maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                    projection: 'EPSG:900913',
                    text_search_config: '',
                    bookmark_search_config: {},
                    units: 'm',
                    zoom: 10
                },
                version: 2
            });
        });

    });

    it('test getIdFromUri ', () => {
        // /mapstore2/rest/geostore/data/578/raw?decode=datauri
        expect(getIdFromUri('%2Fmapstore2%2Frest%2Fgeostore%2Fdata%2F578%2Fraw%3Fdecode%3Ddatauri')).toBe('578');
        // rest/geostore/data/578/raw?id=1568321658464
        expect(getIdFromUri('rest%2Fgeostore%2Fdata%2F578%2Fraw%3Fid%3D1568321658464')).toBe('578');
        // rest/geostore/data/
        expect(getIdFromUri('rest%2Fgeostore%2Fdata%2F')).toBe(null);
    });

    it('isSimpleGeomType default true', () => {
        expect(isSimpleGeomType(POINT)).toBeTruthy();
        expect(isSimpleGeomType(LINE_STRING)).toBeTruthy();
        expect(isSimpleGeomType(POLYGON)).toBeTruthy();
        expect(isSimpleGeomType(CIRCLE)).toBe(true);
        expect(isSimpleGeomType(GEOMETRY_COLLECTION)).toBe(false);
        expect(isSimpleGeomType(MULTI_POINT)).toBe(false);
        expect(isSimpleGeomType(MULTI_LINE_STRING)).toBe(false);
        expect(isSimpleGeomType(MULTI_POLYGON)).toBe(false);
    });

    it('getSimpleGeomType default Point', () => {
        expect(getSimpleGeomType(POINT)).toBe(POINT);
        expect(getSimpleGeomType(LINE_STRING)).toBe(LINE_STRING);
        expect(getSimpleGeomType(POLYGON)).toBe(POLYGON);

        expect(getSimpleGeomType(MULTI_POINT)).toBe(POINT);
        expect(getSimpleGeomType(MULTI_LINE_STRING)).toBe(LINE_STRING);
        expect(getSimpleGeomType(MULTI_POLYGON)).toBe(POLYGON);
        expect(getSimpleGeomType(GEOMETRY_COLLECTION)).toBe(GEOMETRY_COLLECTION);

    });

    it('test getSimpleGeomType', () => {
        expect(getSimpleGeomType("Point")).toBe("Point");
        expect(getSimpleGeomType("Marker")).toBe("Point");
        expect(getSimpleGeomType("MultiPoint")).toBe("Point");
        expect(getSimpleGeomType("MultiLineString")).toBe("LineString");
        expect(getSimpleGeomType("LineString")).toBe("LineString");
        expect(getSimpleGeomType("MultiPolygon")).toBe("Polygon");
        expect(getSimpleGeomType("Polygon")).toBe("Polygon");
        expect(getSimpleGeomType("Circle")).toBe("Circle");
        expect(getSimpleGeomType("Other")).toBe("Other");
    });

    it('test compareMapChanges returns false (maps aren\'t equal)', () => {
        const map1 = {
            "version": 2,
            "map": {
                "mapOptions": {},
                "layers": [
                    {
                        "id": "layer001",
                        "thumbURL": "THUMB_URL",
                        "search": {},
                        "name": "layer001",
                        "title": "layer001",
                        "type": "wms",
                        "url": "",
                        "bbox": {},
                        "visibility": true,
                        "singleTile": false,
                        "allowedSRS": {},
                        "dimensions": [],
                        "hideLoading": false,
                        "handleClickOnLayer": false,
                        "catalogURL": "url",
                        "useForElevation": false,
                        "hidden": false,
                        "params": {

                        }
                    }
                ],
                "groups": [],
                "backgrounds": [
                    {
                        "id": "layer005",
                        "thumbnail": "data"
                    }
                ]
            },
            "catalogServices": {},
            "widgetsConfig": {},
            "mapInfoConfiguration": {}
        };
        const map2 = {
            "version": 2,
            "map": {
                "mapOptions": {},
                "layers": [
                    {
                        "id": "layer002",
                        "thumbURL": "THUMB_URL",
                        "search": {},
                        "name": "layer001",
                        "title": "layer001",
                        "type": "wms",
                        "url": "",
                        "bbox": {},
                        "visibility": true,
                        "singleTile": false,
                        "allowedSRS": {},
                        "dimensions": [],
                        "hideLoading": false,
                        "handleClickOnLayer": false,
                        "catalogURL": "url",
                        "useForElevation": false,
                        "hidden": false,
                        "params": {
                        }
                    }
                ],
                "groups": [],
                "backgrounds": [
                    {
                        "id": "layer005",
                        "thumbnail": "data"
                    }
                ]
            },
            "catalogServices": {},
            "widgetsConfig": {},
            "mapInfoConfiguration": {}
        };
        expect(compareMapChanges(map1, map2)).toBeFalsy();
    });
    it('test compareMapChanges returns true (maps are equal)', () => {
        const map1 = {
            "version": 2,
            "map": {
                "mapOptions": {},
                "layers": [
                    {
                        "id": "layer001",
                        "thumbURL": "THUMB_URL",
                        "search": {},
                        "name": "layer001",
                        "title": "layer001",
                        "type": "wms",
                        "url": "",
                        "bbox": {},
                        "visibility": true,
                        "singleTile": false,
                        "allowedSRS": {},
                        "dimensions": [],
                        "hideLoading": false,
                        "handleClickOnLayer": false,
                        "catalogURL": "url",
                        "useForElevation": false,
                        "hidden": false,
                        "params": { },
                        "apiKey": "some api key",
                        "legendOptions": {
                            "legendWidth": 20,
                            "legendHeight": ""
                        }
                    }
                ],
                "groups": [],
                "backgrounds": [
                    {
                        "id": "layer005",
                        "thumbnail": "data"
                    }
                ]
            },
            "catalogServices": {},
            "widgetsConfig": {},
            "mapInfoConfiguration": {},
            swipe: {}
        };
        const map2 = {
            "version": 2,
            "map": {
                "mapOptions": {},
                "layers": [
                    {
                        "id": "layer001",
                        "thumbURL": "THUMB_URL",
                        "search": {},
                        "name": "layer001",
                        "title": "layer001",
                        "type": "wms",
                        "url": "",
                        "bbox": {},
                        "visibility": true,
                        "singleTile": false,
                        "allowedSRS": {},
                        "dimensions": [],
                        "hideLoading": false,
                        "handleClickOnLayer": false,
                        "catalogURL": "url",
                        "useForElevation": false,
                        "hidden": false,
                        "params": {},
                        "legendOptions": {
                            "legendWidth": 20,
                            "legendHeight": ""
                        }
                    }
                ],
                "groups": [],
                "backgrounds": [
                    {
                        "id": "layer005",
                        "thumbnail": "data"
                    }
                ]
            },
            "catalogServices": {},
            "widgetsConfig": {},
            "mapInfoConfiguration": {},
            "swipe": {}
        };
        expect(compareMapChanges(map1, map2)).toBeTruthy();
    });


    it('mergeMapConfigs', () => {
        const testBackground = {
            id: "layer4",
            title: "layer4",
            source: "osm",
            name: "layer4",
            group: "background"
        };
        const cfg1 = {
            catalogServices: {
                services: {
                    "Demo CSW Service": {
                        autoload: true,
                        title: "Demo CSW Service",
                        type: "csw",
                        url: "url"
                    }
                }
            },
            map: {
                backgrounds: [],
                center: {
                    x: 20.942519296828383,
                    y: 40.953969320283846,
                    crs: "EPSG:4326"
                },
                groups: [{
                    id: "Default",
                    title: "Default",
                    expanded: true
                }, {
                    id: "group",
                    title: "group"
                }],
                layers: [{
                    id: "layer1",
                    group: undefined
                }, {
                    id: "layer2",
                    group: undefined
                }, {
                    id: "layer3",
                    group: "group"
                }, {
                    id: "annotations"
                }, testBackground],
                projection: "EPSG:4326",
                units: "m"
            },
            widgetsConfig: {},
            timelineData: {
                selectedLayer: 'timelineLayer1'
            },
            dimensionData: {
                currentTime: '1996-04-08T08:02:01.425Z',
                offsetTime: '2016-06-07T02:17:23.197Z'
            }
        };
        const cfg2 = {
            catalogServices: {
                services: {
                    "Demo WMS Service": {
                        title: "Demo WMS Service",
                        type: "wms",
                        url: "url"
                    }
                }
            },
            map: {
                backgrounds: [{
                    id: "layer1",
                    thumbnail: "data"
                }],
                center: {
                    x: 14.889337569475176,
                    y: 48.08183013677853,
                    crs: "EPSG:4326"
                },
                groups: [{
                    id: "Default",
                    title: "Default",
                    expanded: true
                }, {
                    id: "group2",
                    title: "group"
                }],
                layers: [{
                    id: "layer1",
                    group: "background"
                }, {
                    id: "layer2",
                    group: "group2"
                }, {
                    id: "layer3",
                    group: undefined
                }, testBackground],
                projection: "EPSG:900913",
                units: "m"
            },
            widgetsConfig: {
                collapsed: {
                    "widget1": {
                        layouts: {
                            lg: {
                                w: 2,
                                h: 1,
                                x: 4,
                                y: 3,
                                i: "widget1",
                                moved: false,
                                "static": false
                            },
                            xxs: {
                                w: 1,
                                h: 1,
                                x: 0,
                                y: 3,
                                i: "widget1",
                                moved: false,
                                "static": false
                            }
                        }
                    }
                },
                layouts: {
                    lg: [{
                        w: 2,
                        h: 1,
                        x: 4,
                        y: 3,
                        i: "widget1",
                        moved: false,
                        "static": false
                    }],
                    xxs: [{
                        w: 1,
                        h: 1,
                        x: 0,
                        y: 3,
                        i: "widget1",
                        moved: false,
                        "static": false
                    }]
                },
                widgets: [{
                    id: "widget1",
                    layer: {
                        id: "layer2",
                        group: "group2"
                    }
                }]
            },
            timelineData: {
                selectedLayer: 'timelineLayer2'
            },
            dimensionData: {
                currentTime: '1997-04-08T08:02:01.425Z',
                offsetTime: '2017-06-07T02:17:23.197Z'
            }
        };

        const cfg = mergeMapConfigs(cfg1, cfg2);

        expect(cfg).toExist();
        expect(cfg.catalogServices).toExist();
        expect(cfg.catalogServices.services).toExist();

        const servicesKeys = keys(cfg.catalogServices.services).sort();
        expect(servicesKeys).toEqual(["Demo CSW Service", "Demo WMS Service"]);
        expect(cfg.catalogServices.services["Demo CSW Service"]).toEqual(cfg1.catalogServices.services["Demo CSW Service"]);
        expect(cfg.catalogServices.services["Demo WMS Service"]).toEqual(cfg2.catalogServices.services["Demo WMS Service"]);

        expect(cfg.map).toExist();
        expect(cfg.map.backgrounds.length).toBe(1);
        expect(cfg.map.backgrounds[0].id).toNotBe(cfg2.map.backgrounds[0].id);
        expect(cfg.map.backgrounds[0].id.length).toBe(36);
        expect(cfg.map.backgrounds[0].thumbnail).toBe("data");
        expect(cfg.map.center).toEqual({
            x: 20.942519296828383,
            y: 40.953969320283846,
            crs: "EPSG:4326"
        });
        expect(cfg.map.groups.length).toBe(3);
        expect(cfg.map.groups[0].id).toBe("Default");
        expect(cfg.map.groups[1].id).toBe("group");
        expect(cfg.map.groups[2].id).toBe("group2");
        expect(cfg.map.layers.length).toBe(8);
        expect(cfg.map.layers[0].id).toBe(cfg.map.backgrounds[0].id);
        expect(cfg.map.layers[0].group).toBe("background");
        expect(cfg.map.layers[1].id).toNotBe("layer4");
        expect(cfg.map.layers[1].title).toBe("layer4");
        expect(cfg.map.layers[1].group).toBe("background");
        expect(cfg.map.layers[2].id).toNotBe("layer3");
        expect(cfg.map.layers[2].id.length).toBe(36);
        expect(cfg.map.layers[2].group).toBe("group2");
        expect(cfg.map.layers[3].id).toNotBe("layer2");
        expect(cfg.map.layers[3].id.length).toBe(36);
        expect(cfg.map.layers[4].id).toBe("layer1");
        expect(cfg.map.layers[4].group).toNotExist();
        expect(cfg.map.layers[5].id).toBe("layer2");
        expect(cfg.map.layers[5].group).toNotExist();
        expect(cfg.map.layers[6].id).toBe("layer3");
        expect(cfg.map.layers[6].group).toBe("group");
        expect(cfg.map.layers[7].id).toBe("annotations");
        expect(cfg.map.projection).toBe(cfg1.map.projection);
        expect(cfg.map.units).toBe("m");
        expect(cfg.widgetsConfig).toExist();
        expect(cfg.widgetsConfig.widgets.length).toBe(1);
        expect(cfg.widgetsConfig.widgets[0].id).toNotBe("widget1");
        expect(cfg.widgetsConfig.widgets[0].id.length).toBe(36);
        expect(cfg.widgetsConfig.widgets[0].layer).toExist();
        expect(cfg.widgetsConfig.widgets[0].layer.id).toBe(cfg.map.layers[2].id);
        expect(cfg.widgetsConfig.widgets[0].layer.group).toBe("group2");
        expect(cfg.widgetsConfig.collapsed).toExist();

        const collapsedKeys = keys(cfg.widgetsConfig.collapsed);

        expect(collapsedKeys.length).toBe(1);
        expect(collapsedKeys[0]).toBe(cfg.widgetsConfig.widgets[0].id);
        expect(cfg.widgetsConfig.collapsed[collapsedKeys[0]].layouts).toExist();
        expect(cfg.widgetsConfig.collapsed[collapsedKeys[0]].layouts.lg).toExist();
        expect(cfg.widgetsConfig.collapsed[collapsedKeys[0]].layouts.xxs).toExist();
        expect(cfg.widgetsConfig.collapsed[collapsedKeys[0]].layouts.lg.i).toBe(cfg.widgetsConfig.widgets[0].id);
        expect(cfg.widgetsConfig.collapsed[collapsedKeys[0]].layouts.xxs.i).toBe(cfg.widgetsConfig.widgets[0].id);

        expect(cfg.widgetsConfig.layouts).toExist();
        expect(cfg.widgetsConfig.layouts.lg).toExist();
        expect(cfg.widgetsConfig.layouts.xxs).toExist();
        expect(cfg.widgetsConfig.layouts.lg[0].i).toBe(cfg.widgetsConfig.widgets[0].id);
        expect(cfg.widgetsConfig.layouts.xxs[0].i).toBe(cfg.widgetsConfig.widgets[0].id);

        expect(cfg.timelineData).toExist();
        expect(cfg.timelineData.selectedLayer).toBe('timelineLayer2');
        expect(cfg.dimensionData).toExist();
        expect(cfg.dimensionData.currentTime).toBe('1997-04-08T08:02:01.425Z');
        expect(cfg.dimensionData.offsetTime).toBe('2017-06-07T02:17:23.197Z');
    });
    describe("mapUpdated tests", () => {
        it("mapUpdated invalid values, means falsy", () => {
            expect(mapUpdated()).toBeFalsy();
            expect(mapUpdated({}, {})).toBeFalsy();
            expect(mapUpdated(null, null)).toBeFalsy();
            expect(mapUpdated(null, undefined)).toBeFalsy();
            expect(mapUpdated(undefined, undefined)).toBeFalsy();
        });
        it("mapUpdated is true when zoom changes", () => {
            const MAP_1 = {
                center: {x: 1.123456789012345, y: 1.123456789012345},
                zoom: 4
            };
            const MAP_1_ZOOM_CHANGED = {
                center: {x: 1.123456789012345, y: 1.123456789012345},
                zoom: 6
            };
            expect(mapUpdated(MAP_1, MAP_1_ZOOM_CHANGED)).toBeTruthy();
        });
        it("mapUpdated is true when center changes", () => {
            const MAP_1 = {
                center: {x: 1.123456789012345, y: 1.123456789012345},
                zoom: 4
            };
            const MAP_1_CENTER_CHANGED = {
                center: {x: 1.123456789012345, y: 1.123456749012345},
                zoom: 4
            };
            expect(mapUpdated(MAP_1, MAP_1_CENTER_CHANGED)).toBeTruthy();
        });
        it("mapUpdated is true when center changes but for a little values, beyond configured precision", () => {
            const MAP_1 = {
                center: {x: 1.123456789012345, y: 1.123456789012345},
                zoom: 4
            };
            const MAP_1_CENTER_CHANGED_BUTSIMILAR = {
                center: {x: 1.12345678901234567, y: 1.12345678901234566},
                zoom: 4
            };
            expect(mapUpdated(MAP_1, MAP_1_CENTER_CHANGED_BUTSIMILAR)).toBeFalsy();
        });
    });

    it('addRootParentGroup', () => {
        const cfg = {
            catalogServices: {
                services: {
                    "Demo CSW Service": {
                        autoload: true,
                        title: "Demo CSW Service",
                        type: "csw",
                        url: "url"
                    }
                }
            },
            map: {
                backgrounds: [],
                center: {
                    x: 20.942519296828383,
                    y: 40.953969320283846,
                    crs: "EPSG:4326"
                },
                groups: [{
                    id: "Default",
                    title: "Default",
                    expanded: true
                }, {
                    id: "group",
                    title: "group"
                }, {
                    id: "group.group2",
                    title: "group2"
                }],
                layers: [{
                    id: "layer1",
                    group: "group"
                }, {
                    id: "layer2",
                    group: "group.group2"
                }, {
                    id: "layer3",
                    group: "background"
                }, {
                    id: "annotations"
                }, {
                    id: "layer4"
                }, {
                    id: "layer5"
                }],
                projection: "EPSG:4326",
                units: "m"
            }
        };

        const newCfg = addRootParentGroup(cfg, 'ARootGroup');

        expect(newCfg).toExist();
        expect(newCfg.catalogServices).toEqual(cfg.catalogServices);
        expect(newCfg.map).toExist();
        expect(newCfg.map.backgrounds).toEqual(cfg.map.backgrounds);
        expect(newCfg.map.center).toEqual(cfg.map.center);
        expect(newCfg.map.projection).toEqual(cfg.map.projection);
        expect(newCfg.map.units).toEqual(cfg.map.units);
        expect(newCfg.map.groups).toExist();
        expect(newCfg.map.groups.length).toBe(3);

        const sortedGroups = sortBy(newCfg.map.groups, ['title']);

        expect(sortedGroups[0].id).toExist();
        expect(sortedGroups[0].id.length).toBe(36);
        expect(sortedGroups[0].title).toBe('ARootGroup');
        expect(sortedGroups[0].expanded).toBe(true);
        expect(sortedGroups[1].id).toBe(`${sortedGroups[0].id}.group`);
        expect(sortedGroups[1].title).toBe('group');
        expect(sortedGroups[2].id).toBe(`${sortedGroups[0].id}.group.group2`);
        expect(sortedGroups[2].title).toBe('group2');

        expect(newCfg.map.layers).toExist();
        expect(newCfg.map.layers.length).toBe(6);

        const sortedLayers = sortBy(newCfg.map.layers, ['id']);

        expect(sortedLayers[0].id).toBe('annotations');
        expect(sortedLayers[0].group).toBe(sortedGroups[0].id);
        expect(sortedLayers[1].id).toBe('layer1');
        expect(sortedLayers[1].group).toBe(`${sortedGroups[0].id}.group`);
        expect(sortedLayers[2].id).toBe('layer2');
        expect(sortedLayers[2].group).toBe(`${sortedGroups[0].id}.group.group2`);
        expect(sortedLayers[3].id).toBe('layer3');
        expect(sortedLayers[3].group).toBe('background');
        expect(sortedLayers[4].id).toBe('layer4');
        expect(sortedLayers[4].group).toBe(sortedGroups[0].id);
        expect(sortedLayers[5].id).toBe('layer5');
        expect(sortedLayers[5].group).toBe(sortedGroups[0].id);
    });
    it('addRootParentGroup', () => {
        const resolution = 1000; // ~zoom 7 in Web Mercator
        expect(getZoomFromResolution(resolution)).toBe(7);
    });

    it('reprojectZoom', () => {
        expect(reprojectZoom(5, 'EPSG:3857', 'EPSG:4326')).toBe(4);
        expect(reprojectZoom(5.2, 'EPSG:3857', 'EPSG:4326')).toBe(4);
    });
    describe("getResolutionObject tests", () => {
        const resolutions =  [156543, 78271, 39135, 19567, 9783, 4891, 2445, 1222];
        it('getResolutionObject for visibility limit type scale', ()=> {
            expect(getResolutionObject(9028, 'scale', {projection: "EPSG:900913", resolutions}))
                .toEqual({ resolution: 2.3886583333333333, scale: 9028, zoom: 7 });
        });
        it('getResolutionObject for visibility limit type other than scale', ()=> {
            expect(getResolutionObject(9028, 'scale1', {projection: "EPSG:900913", resolutions}))
                .toEqual({ resolution: 9028, scale: 34121574.80314961, zoom: 4 });
        });
    });
    it('getRandomPointInCRS', () => {
        expect(getRandomPointInCRS('EPSG:3857').length).toBe(2);
        expect(getRandomPointInCRS('EPSG:4326').length).toBe(2);
    });
    it('convertResolution', () => {
        expect(convertResolution('EPSG:3857', 'EPSG:4326', 2000).transformedResolution).toBe(0.017986440587896155);
    });
    it('test get exact zoom level from resolution using getExactZoomFromResolution', () => {
        const resolutions =  [156543, 78271, 39135, 19567, 9783, 4891, 2445, 1222];
        expect(getExactZoomFromResolution(100000, resolutions)).toEqual(0.6465589981535295);
        expect(getExactZoomFromResolution(50000, resolutions)).toEqual(1.6465589981535294);
        expect(getExactZoomFromResolution(10000, resolutions)).toEqual(3.9684870930408915);
    });

});

describe('recursiveIsChangedWithRules', () => {
    it('ignores excluded keys', () => {
        const rules = {
            pickedFields: ['root.obj'],
            excludes: { 'root.obj': ['x'] }
        };
        expect(recursiveIsChangedWithRules({ x: 1, y: 2 }, { y: 2 }, rules, 'root.obj')).toBe(false);
    });
    it('treats alias keys as equal', () => {
        const rules = {
            pickedFields: ['root.obj'],
            aliases: { old: 'new' }
        };
        expect(recursiveIsChangedWithRules({ old: 1 }, { 'new': 1 }, rules, 'root.obj')).toBe(false);
    });
    it('only compares picked fields', () => {
        const rules = {
            pickedFields: ['root.obj.a'],
            excludes: {}
        };
        expect(recursiveIsChangedWithRules({ a: 1, b: 2 }, { a: 1, b: 3 }, rules, 'root.obj')).toBe(false);
    });
    it('works with nested structures and exclusions', () => {
        const rules = {
            pickedFields: ['root.arr'],
            excludes: { 'root.arr[]': ['skip'] }
        };
        const a = { arr: [{ keep: 1, skip: 2 }] };
        const b = { arr: [{ keep: 1, skip: 3 }] };
        expect(recursiveIsChangedWithRules(a, b, rules, 'root')).toBe(false);
    });
    it('detects changes in nested structures not excluded', () => {
        const rules = {
            pickedFields: ['root.arr'],
            excludes: { 'root.arr[]': ['skip'] }
        };
        const a = { arr: [{ keep: 1, skip: 2 }] };
        const b = { arr: [{ keep: 2, skip: 2 }] };
        expect(recursiveIsChangedWithRules(a, b, rules, 'root')).toBe(true);
    });
    it("Test parsers for updating comparing values", () => {
        const rules = {
            pickedFields: ['root.items'],
            excludes: {},
            parsers: { 'root.items': (items) => (items || []).filter(item => item.type !== 'temp') }
        };

        // Parser filters out temp items, making arrays equal
        expect(recursiveIsChangedWithRules(
            { items: [{ id: 1, type: 'main' }, { id: 2, type: 'temp' }] },
            { items: [{ id: 1, type: 'main' }] },
            rules, 'root'
        )).toBe(false);

        // Real differences are still detected
        expect(recursiveIsChangedWithRules(
            { items: [{ id: 1, type: 'main' }] },
            { items: [{ id: 2, type: 'main' }] },
            rules, 'root'
        )).toBe(true);
    });
});

describe('filterFieldByRules', () => {
    it('returns false if value is undefined', () => {
        const rules = { pickedFields: ['root.obj'], excludes: {} };
        expect(filterFieldByRules('root.obj.x', 'x', undefined, rules)).toBe(false);
    });
    it('returns true if path is in pickedFields and not excluded', () => {
        const rules = { pickedFields: ['root.obj'], excludes: {} };
        expect(filterFieldByRules('root.obj.x', 'x', 1, rules)).toBe(true);
    });
    it('returns false if path is in pickedFields but key is excluded', () => {
        const rules = { pickedFields: ['root.obj'], excludes: { 'root.obj': ['x'] } };
        expect(filterFieldByRules('root.obj.x', 'x', 1, rules)).toBe(false);
    });
    it('returns false if path is not in pickedFields', () => {
        const rules = { pickedFields: ['root.other'], excludes: {} };
        expect(filterFieldByRules('root.obj.x', 'x', 1, rules)).toBe(false);
    });
});

describe('parseFieldValue', () => {
    it('returns original value when no parsers are provided', () => {
        const result = parseFieldValue('root.field', 'field', 'test', {});
        expect(result).toBe('test');
    });
    it('returns original value when parser does not exist for path', () => {
        const rules = { parsers: { 'other.path': (value) => value.toUpperCase() } };
        const result = parseFieldValue('root.field', 'field', 'test', rules);
        expect(result).toBe('test');
    });
    it('applies parser when it exists for the path', () => {
        const rules = { parsers: { 'root.field': (value) => value.toUpperCase() } };
        const result = parseFieldValue('root.field', 'field', 'test', rules);
        expect(result).toBe('TEST');
    });
    it('passes both value and key to the parser function', () => {
        const mockParser = expect.createSpy().andReturn('parsed');
        const rules = { parsers: { 'root.field': mockParser } };

        parseFieldValue('root.field', 'fieldKey', 'testValue', rules);

        expect(mockParser).toHaveBeenCalledWith('testValue', 'fieldKey');
    });
});

describe('prepareObjectEntries', () => {
    it('returns filtered and sorted entries with aliasing ', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const rules = {
            aliases: { 'a': 'x', 'b': 'y' },
            // pickedFields should be considered after aliases
            pickedFields: ['root.x', 'root.y'],
            excludes: {},
            parsers: {}
        };
        const entries = prepareObjectEntries(obj, rules, 'root');
        expect(entries).toEqual([
            ['x', 1],
            ['y', 2]
        ]);
    });
    it('excludes keys as per rules', () => {
        const obj = { a: 1, b: 2 };
        const rules = {
            pickedFields: ['root.obj'],
            excludes: { 'root.obj': ['b'] },
            aliases: {}
        };
        const entries = prepareObjectEntries(obj, rules, 'root.obj');
        expect(entries).toEqual([
            ['a', 1]
        ]);
    });
    it('returns empty array if no picked fields match', () => {
        const obj = { a: 1 };
        const rules = {
            pickedFields: ['root.other'],
            excludes: {},
            aliases: {}
        };
        const entries = prepareObjectEntries(obj, rules, 'root.obj');
        expect(entries).toEqual([]);
    });
});
