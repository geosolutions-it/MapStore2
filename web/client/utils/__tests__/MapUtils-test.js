/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
const { keys, sortBy } = require('lodash');

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
    getIdFromUri,
    getSimpleGeomType,
    isSimpleGeomType,
    parseLayoutValue,
    prepareMapObjectToCompare,
    updateObjectFieldKey,
    compareMapChanges,
    mergeMapConfigs,
    addRootParentGroup,
    mapUpdated
} = require('../MapUtils');

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
                    thumbURL: "THUMB_URL",
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
                },
                {
                    allowedSRS: {},
                    bbox: {},
                    dimensions: [],
                    id: "layer004",
                    loading: true,
                    name: "layer004",
                    params: {},
                    search: {},
                    singleTile: false,
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
                        tooltipPlacement: undefined
                    }, {
                        id: 'custom',
                        title: 'custom',
                        expanded: false,
                        description: 'custom-description',
                        tooltipOptions: 'both',
                        tooltipPlacement: 'right'
                    }, {
                        id: 'custom.nested001',
                        title: 'nested001',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined
                    }],
                    layers: [{
                        allowedSRS: {},
                        thumbURL: "THUMB_URL",
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        legendOptions: undefined,
                        tileSize: undefined
                    },
                    {
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        legendOptions: undefined,
                        tileSize: undefined
                    },
                    {
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        legendOptions: undefined,
                        tileSize: undefined
                    },
                    {
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        id: "layer004",
                        matrixIds: undefined,
                        maxZoom: undefined,
                        maxNativeZoom: undefined,
                        name: "layer004",
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
                        title: "layer004",
                        transparent: undefined,
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: [100000, 100000],
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        legendOptions: undefined,
                        tileSize: undefined
                    }],
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
                    allowedSRS: {},
                    bbox: {},
                    dimensions: [],
                    id: "layer001",
                    loading: true,
                    name: "layer001",
                    params: {},
                    search: {},
                    singleTile: false,
                    thumbURL: "THUMB_URL",
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
                },
                {
                    allowedSRS: {},
                    bbox: {},
                    dimensions: [],
                    id: "layer004",
                    loading: true,
                    name: "layer004",
                    params: {},
                    search: {},
                    singleTile: false,
                    title: "layer004",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url",
                    origin: [100000, 100000]
                },
                {
                    allowedSRS: {},
                    bbox: {},
                    dimensions: [],
                    id: "layer005",
                    loading: true,
                    name: "layer005",
                    group: "background",
                    params: {},
                    search: {},
                    singleTile: false,
                    title: "layer005",
                    type: "wms",
                    url: "",
                    thumbURL: "blob:http://name.domain/id",
                    visibility: true,
                    catalogURL: "url",
                    origin: [100000, 100000]
                },
                {
                    allowedSRS: {},
                    bbox: {},
                    dimensions: [],
                    id: "layer006",
                    loading: true,
                    name: "layer006",
                    group: "background",
                    params: {},
                    search: {},
                    singleTile: false,
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
                        tooltipPlacement: undefined
                    }, {
                        id: 'custom',
                        title: 'custom',
                        expanded: false,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined
                    }, {
                        id: 'custom.nested001',
                        title: 'nested001',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined
                    }],
                    layers: [{
                        allowedSRS: {},
                        thumbURL: "THUMB_URL",
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        legendOptions: undefined,
                        tileSize: undefined
                    },
                    {
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        legendOptions: undefined,
                        tileSize: undefined
                    },
                    {
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        legendOptions: undefined,
                        tileSize: undefined
                    },
                    {
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        id: "layer004",
                        matrixIds: undefined,
                        maxZoom: undefined,
                        maxNativeZoom: undefined,
                        name: "layer004",
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
                        title: "layer004",
                        transparent: undefined,
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: [100000, 100000],
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        legendOptions: undefined,
                        tileSize: undefined
                    },
                    {
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
                        requestEncoding: undefined,
                        capabilitiesURL: undefined,
                        description: undefined,
                        dimensions: [],
                        features: undefined,
                        queryable: undefined,
                        featureInfo: undefined,
                        format: undefined,
                        group: "background",
                        hideLoading: false,
                        handleClickOnLayer: false,
                        id: "layer005",
                        matrixIds: undefined,
                        maxZoom: undefined,
                        maxNativeZoom: undefined,
                        name: "layer005",
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
                        title: "layer005",
                        transparent: undefined,
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: [100000, 100000],
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        legendOptions: undefined,
                        tileSize: undefined
                    },
                    {
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
                        requestEncoding: undefined,
                        capabilitiesURL: undefined,
                        description: undefined,
                        dimensions: [],
                        features: undefined,
                        queryable: undefined,
                        featureInfo: undefined,
                        format: undefined,
                        group: "background",
                        hideLoading: false,
                        handleClickOnLayer: false,
                        id: "layer006",
                        matrixIds: undefined,
                        maxZoom: undefined,
                        maxNativeZoom: undefined,
                        name: "layer006",
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
                        title: "layer006",
                        transparent: undefined,
                        type: "wms",
                        url: "",
                        visibility: false,
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: [100000, 100000],
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        legendOptions: undefined,
                        tileSize: undefined
                    }],
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
                    allowedSRS: {},
                    bbox: {},
                    dimensions: [],
                    id: "layer001",
                    loading: true,
                    name: "layer001",
                    params: {},
                    search: {},
                    singleTile: false,
                    thumbURL: "THUMB_URL",
                    title: "layer001",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url",
                    legendOptions: { legendWidth: "", legendHeight: 40}
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
                        resolutions: [
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
                        ]
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
                        tooltipPlacement: undefined
                    }, {
                        id: 'custom',
                        title: 'custom',
                        expanded: false,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined
                    }, {
                        id: 'custom.nested001',
                        title: 'nested001',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined
                    }],
                    layers: [{
                        allowedSRS: {},
                        thumbURL: "THUMB_URL",
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        tileSize: undefined,
                        legendOptions: { legendWidth: "", legendHeight: 40}
                    },
                    {
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        legendOptions: undefined,
                        tileSize: undefined
                    },
                    {
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: "both",
                        tooltipPlacement: "right",
                        tileSize: undefined,
                        legendOptions: { legendWidth: 20, legendHeight: 40}
                    }],
                    mapOptions: {
                        view: {
                            resolutions: [
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
                            ]
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
                        tooltipPlacement: undefined
                    }, {
                        id: 'custom',
                        title: 'custom',
                        expanded: false,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined
                    }, {
                        id: 'custom.nested001',
                        title: 'nested001',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined
                    }],
                    layers: [{
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tileSize: undefined,
                        tooltipPlacement: undefined, legendOptions: undefined
                    },
                    {
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tileSize: undefined,
                        tooltipPlacement: undefined, legendOptions: undefined
                    },
                    {
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tileSize: undefined,
                        tooltipPlacement: undefined, legendOptions: undefined
                    }],
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
                    allowedSRS: {},
                    bbox: {},
                    dimensions: [],
                    id: "annotations",
                    loading: true,
                    name: "annotations",
                    params: {},
                    search: {},
                    singleTile: false,
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
                        resolutions: [
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
                        ]
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
                            resolutions: [ 84666.66666666688, 42333.33333333344, 21166.66666666672, 10583.33333333336, 5291.66666666668, 2645.83333333334, 1322.91666666667, 661.458333333335, 529.166666666668, 396.875000000001, 264.583333333334, 132.291666666667, 66.1458333333335, 39.6875000000001, 26.4583333333334, 13.2291666666667, 6.61458333333335, 3.96875000000001, 2.64583333333334, 1.32291666666667, 0.661458333333335 ]
                        }
                    },
                    mapInfoControl: undefined,
                    backgrounds: [],
                    layers: [{
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
                        format: undefined,
                        thumbURL: undefined,
                        group: undefined,
                        search: {},
                        source: undefined,
                        name: 'annotations',
                        opacity: undefined,
                        provider: undefined,
                        description: undefined,
                        styles: undefined,
                        style: undefined,
                        styleName: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        title: 'annotations',
                        transparent: undefined,
                        tiled: undefined,
                        type: 'vector',
                        url: '',
                        bbox: {},
                        visibility: true,
                        singleTile: false,
                        allowedSRS: {},
                        matrixIds: undefined,
                        tileMatrixSet: undefined,
                        requestEncoding: undefined,
                        dimensions: [],
                        maxZoom: undefined,
                        maxNativeZoom: undefined,
                        hideLoading: false,
                        handleClickOnLayer: false,
                        queryable: undefined,
                        featureInfo: undefined,
                        catalogURL: 'url',
                        capabilitiesURL: undefined,
                        useForElevation: false,
                        hidden: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tileSize: undefined,
                        tooltipPlacement: undefined, legendOptions: undefined,
                        params: {} } ],
                    groups: [ {
                        id: 'Default',
                        title: 'Default',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined
                    }, {
                        id: 'custom',
                        title: 'custom',
                        expanded: false,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined
                    }, {
                        id: 'custom.nested001',
                        title: 'nested001',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined
                    }],
                    text_search_config: '', bookmark_search_config: {} }
            });
        });

        it('save map configuration with tile matrix and map info configuration', () => {
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
                        tooltipPlacement: undefined
                    }, {
                        id: 'custom',
                        title: 'custom',
                        expanded: false,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined
                    }, {
                        id: 'custom.nested001',
                        title: 'nested001',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined
                    }],
                    layers: [{
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        legendOptions: undefined,
                        tileSize: undefined
                    }],
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
                        tooltipPlacement: undefined
                    }, {
                        id: 'custom',
                        title: 'custom',
                        expanded: false,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined
                    }, {
                        id: 'custom.nested001',
                        title: 'nested001',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined
                    }],
                    layers: [{
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        legendOptions: undefined,
                        tileSize: undefined
                    }],
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
                    allowedSRS: {},
                    bbox: {},
                    dimensions: [],
                    id: "layer001",
                    loading: true,
                    name: "layer001",
                    params: {},
                    search: {},
                    singleTile: false,
                    thumbURL: "THUMB_URL",
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
                },
                {
                    allowedSRS: {},
                    bbox: {},
                    dimensions: [],
                    id: "layer004",
                    loading: true,
                    name: "layer004",
                    params: {},
                    search: {},
                    singleTile: false,
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
                        tooltipPlacement: undefined
                    }, {
                        id: 'custom',
                        title: 'custom',
                        expanded: false,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined
                    }, {
                        id: 'custom.nested001',
                        title: 'nested001',
                        expanded: true,
                        description: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined
                    }],
                    layers: [{
                        allowedSRS: {},
                        thumbURL: "THUMB_URL",
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        legendOptions: undefined,
                        tileSize: undefined
                    },
                    {
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        legendOptions: undefined,
                        tileSize: undefined
                    },
                    {
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: undefined,
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        legendOptions: undefined,
                        tileSize: undefined
                    },
                    {
                        allowedSRS: {},
                        thumbURL: undefined,
                        availableStyles: undefined,
                        layerFilter: undefined,
                        bbox: {},
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
                        id: "layer004",
                        matrixIds: undefined,
                        maxZoom: undefined,
                        maxNativeZoom: undefined,
                        name: "layer004",
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
                        title: "layer004",
                        transparent: undefined,
                        type: "wms",
                        url: "",
                        visibility: true,
                        catalogURL: "url",
                        hidden: false,
                        useForElevation: false,
                        origin: [100000, 100000],
                        thematic: undefined,
                        tooltipOptions: undefined,
                        tooltipPlacement: undefined,
                        legendOptions: undefined,
                        tileSize: undefined
                    }],
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
    it('test parseLayoutValue', () => {
        const percentageValue = parseLayoutValue('20%', 500);
        expect(percentageValue).toBe(100);

        const numberValue = parseLayoutValue(20);
        expect(numberValue).toBe(20);

        const noNumberValue = parseLayoutValue('value');
        expect(noNumberValue).toBe(0);
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
            "mapInfoConfiguration": {}
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
            "mapInfoConfiguration": {}
        };
        expect(compareMapChanges(map1, map2)).toBeTruthy();
    });

    it('test prepareMapObjectToCompare', () => {
        const obj1 = { time: new Date().toISOString() };
        const obj2 = { apiKey: 'some api key' };
        const obj3 = { test: undefined };
        const obj4 = { test: null };
        const obj5 = { test: false };
        const obj6 = { test: {} };
        const obj7 = { fixed: false };
        const obj8 = { args: 'some api key' };
        prepareMapObjectToCompare(obj1);
        prepareMapObjectToCompare(obj2);
        prepareMapObjectToCompare(obj3);
        prepareMapObjectToCompare(obj4);
        prepareMapObjectToCompare(obj5);
        prepareMapObjectToCompare(obj6);
        prepareMapObjectToCompare(obj7);
        prepareMapObjectToCompare(obj8);
        expect(Object.keys(obj1).indexOf('time')).toBe(-1);
        expect(Object.keys(obj2).indexOf('apiKey')).toBe(-1);
        expect(Object.keys(obj3).indexOf('test')).toBe(-1);
        expect(Object.keys(obj4).indexOf('test')).toBe(-1);
        expect(Object.keys(obj5).indexOf('test')).toBe(-1);
        expect(Object.keys(obj6).indexOf('test')).toBe(-1);
        expect(Object.keys(obj7).indexOf('fixed')).toBe(-1);
        expect(Object.keys(obj8).indexOf('args')).toBe(-1);
    });

    it('test updateObjectFieldKey', () => {
        const origin = { test1: 'test', test2: 'test' };
        const clone = JSON.parse(JSON.stringify(origin));
        const clone2 = JSON.parse(JSON.stringify(origin));
        const clone3 = JSON.parse(JSON.stringify(origin));
        updateObjectFieldKey(clone);
        updateObjectFieldKey(clone2, 'test1', 'test3');
        updateObjectFieldKey(clone3, 'test3', 'test4');
        expect(clone.test1).toBe(origin.test1);
        expect(clone.test2).toBe(origin.test2);
        expect(clone2.test1).toNotExist();
        expect(clone2.test3).toExist();
        expect(clone3.test3).toNotExist();
        expect(clone3.test4).toNotExist();
    });

    it('mergeMapConfigs', () => {
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
                }],
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
                }],
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
        expect(cfg.map.layers.length).toBe(7);
        expect(cfg.map.layers[0].id).toBe(cfg.map.backgrounds[0].id);
        expect(cfg.map.layers[0].group).toBe("background");
        expect(cfg.map.layers[1].id).toNotBe("layer3");
        expect(cfg.map.layers[1].id.length).toBe(36);
        expect(cfg.map.layers[1].group).toBe("group2");
        expect(cfg.map.layers[2].id).toNotBe("layer2");
        expect(cfg.map.layers[2].id.length).toBe(36);
        expect(cfg.map.layers[3].id).toBe("layer1");
        expect(cfg.map.layers[3].group).toNotExist();
        expect(cfg.map.layers[4].id).toBe("layer2");
        expect(cfg.map.layers[4].group).toNotExist();
        expect(cfg.map.layers[5].id).toBe("layer3");
        expect(cfg.map.layers[5].group).toBe("group");
        expect(cfg.map.layers[6].id).toBe("annotations");
        expect(cfg.map.projection).toBe(cfg1.map.projection);
        expect(cfg.map.units).toBe("m");
        expect(cfg.widgetsConfig).toExist();
        expect(cfg.widgetsConfig.widgets.length).toBe(1);
        expect(cfg.widgetsConfig.widgets[0].id).toNotBe("widget1");
        expect(cfg.widgetsConfig.widgets[0].id.length).toBe(36);
        expect(cfg.widgetsConfig.widgets[0].layer).toExist();
        expect(cfg.widgetsConfig.widgets[0].layer.id).toBe(cfg.map.layers[1].id);
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
});
