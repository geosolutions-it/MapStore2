/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {
    CHANGE_MAP_VIEW,
    CLICK_ON_MAP,
    CHANGE_MOUSE_POINTER,
    CHANGE_ZOOM_LVL,
    CHANGE_MAP_CRS,
    CHANGE_MAP_SCALES,
    CHANGE_MAP_STYLE,
    CHANGE_ROTATION,
    UPDATE_VERSION,
    INIT_MAP,
    ZOOM_TO_EXTENT,
    RESIZE_MAP,
    CHANGE_MAP_LIMITS,
    ZOOM_TO_POINT,
    SET_MAP_RESOLUTIONS,
    REGISTER_EVENT_LISTENER,
    UNREGISTER_EVENT_LISTENER,
    MOUSE_MOVE,
    MOUSE_OUT,
    zoomToPoint,
    errorLoadingFont,
    changeMapView,
    clickOnMap,
    changeMousePointer,
    changeZoomLevel,
    changeMapCrs,
    changeMapScales,
    changeMapStyle,
    changeRotation,
    updateVersion,
    initMap,
    zoomToExtent,
    resizeMap,
    changeMapLimits,
    setMapResolutions,
    registerEventListener,
    unRegisterEventListener,
    mouseMove,
    mouseOut
} = require('../map');
const {
    SHOW_NOTIFICATION
} = require('../notifications');

describe('Test correctness of the map actions', () => {

    it('changeMapView', () => {
        const testCenter = 0;
        const testZoom = 3;
        const testBbox = 6;
        const testSize = 9;
        const testProjection = 'EPSG:32632';
        var retval = changeMapView(testCenter, testZoom, testBbox, testSize, null, testProjection);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_MAP_VIEW);
        expect(retval.center).toBe(testCenter);
        expect(retval.zoom).toBe(testZoom);
        expect(retval.bbox).toBe(testBbox);
        expect(retval.size).toBe(testSize);
        expect(retval.projection).toBe(testProjection);
    });

    it('set a new clicked point', () => {
        const testVal = "val";
        const retval = clickOnMap(testVal);

        expect(retval.type).toBe(CLICK_ON_MAP);
        expect(retval.point).toExist();
        expect(retval.point).toBe(testVal);
    });

    it('test errorLoadingFont', () => {
        const err = {family: "FontAwesome"};
        let {type, values, title, message, autoDismiss, position } = errorLoadingFont(err);

        expect(type).toBe(SHOW_NOTIFICATION);
        expect(values).toExist();
        expect(values.family).toExist();
        expect(title).toExist();
        expect(message).toExist();
        expect(position).toExist();
        expect(autoDismiss).toExist();
        expect(values.family).toBe("FontAwesome");
        expect(title).toBe("warning");
        expect(message).toBe("map.errorLoadingFont");
        expect(position).toBe("tc");
        expect(autoDismiss).toBe(10);
    });

    it('test errorLoadingFont default', () => {
        let {type, values, title, message, autoDismiss, position } = errorLoadingFont();

        expect(type).toBe(SHOW_NOTIFICATION);
        expect(values).toExist();
        expect(title).toExist();
        expect(message).toExist();
        expect(position).toExist();
        expect(autoDismiss).toExist();
        expect(values.family).toBe("");
        expect(title).toBe("warning");
        expect(message).toBe("map.errorLoadingFont");
        expect(position).toBe("tc");
        expect(autoDismiss).toBe(10);

    });

    it('set a new mouse pointer', () => {
        const testVal = 'pointer';
        const retval = changeMousePointer(testVal);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_MOUSE_POINTER);
        expect(retval.pointer).toBe(testVal);
    });

    it('changes a new zoom level', () => {
        const testVal = 9;
        const retval = changeZoomLevel(testVal);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_ZOOM_LVL);
        expect(retval.zoom).toBe(testVal);
    });

    it('zoom to extent', () => {
        const retval = zoomToExtent([-30, -30, 30, 30], 'EPSG:4326', 18);

        expect(retval).toExist();
        expect(retval.type).toBe(ZOOM_TO_EXTENT);
        expect(retval.extent).toExist();
        expect(retval.crs).toBe('EPSG:4326');
        expect(retval.maxZoom).toBe(18);
    });

    it('changes map crs', () => {
        const testVal = 'EPSG:4326';
        const retval = changeMapCrs(testVal);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_MAP_CRS);
        expect(retval.crs).toBe(testVal);
    });

    it('changeMapScales', () => {
        const testScales = [100000, 50000, 25000, 10000, 5000];
        const retval = changeMapScales(testScales);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_MAP_SCALES);
        expect(retval.scales).toEqual(testScales);
    });

    it('changeMapStyle', () => {
        let style = {width: 100};
        let mapStateSource = "test";
        var retval = changeMapStyle(style, mapStateSource);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_MAP_STYLE);
        expect(retval.style).toBe(style);
        expect(retval.mapStateSource).toBe(mapStateSource);
    });

    it('changeRotation', () => {
        let angle = 0.5235987755982989;
        let mapStateSource = "test";
        let retval = changeRotation(angle, mapStateSource);
        expect(retval).toExist();
        expect(retval.type).toEqual(CHANGE_ROTATION);
        expect(retval.rotation).toEqual(angle);
        expect(retval.mapStateSource).toEqual(mapStateSource);
    });

    it('updateVersion', () => {
        const version = 2;
        const retval = updateVersion(version);
        expect(retval).toExist();
        expect(retval.type).toEqual(UPDATE_VERSION);
        expect(retval.version).toEqual(2);
    });

    it('initMap', () => {
        const retval = initMap();
        expect(retval).toExist();
        expect(retval.type).toEqual(INIT_MAP);
    });

    it('resizeMap', () => {
        const retval = resizeMap();
        expect(retval).toExist();
        expect(retval.type).toEqual(RESIZE_MAP);
    });
    it('change map limits', () => {
        const restrictedExtent = [0, 0, 1, 1];
        const crs = "EPSG:4326";
        const minZoom = 2;
        const action = changeMapLimits({ restrictedExtent, crs, minZoom});
        expect(action).toExist();
        expect(action.type).toBe(CHANGE_MAP_LIMITS);
        expect(action.restrictedExtent).toBe(restrictedExtent);
        expect(action.crs).toBe(crs);
        expect(action.minZoom).toBe(minZoom);
    });

    it('zoomToPoint', () => {
        const pos = {x: 1, y: 2};
        const zoom = 12;
        const crs = "EPSG:4326";
        const retval = zoomToPoint(pos, zoom, crs);
        expect(retval).toExist();
        expect(retval.type).toEqual(ZOOM_TO_POINT);
        expect(retval.pos).toEqual(pos);
        expect(retval.zoom).toEqual(zoom);
        expect(retval.crs).toEqual(crs);
    });

    it('setMapResolutions', () => {
        const resolutions = [4, 2];
        const retval = setMapResolutions(resolutions);
        expect(retval).toExist();
        expect(retval.type).toEqual(SET_MAP_RESOLUTIONS);
        expect(retval.resolutions).toEqual(resolutions);
    });
    it('registerEventListener', () => {
        const eventName = 'mousemove';
        const toolName = 'identifyFloatingTool';
        const retval = registerEventListener(eventName, toolName);
        expect(retval).toExist();
        expect(retval.type).toEqual(REGISTER_EVENT_LISTENER);
        expect(retval.eventName).toEqual(eventName);
        expect(retval.toolName).toEqual(toolName);
    });
    it('unRegisterEventListener', () => {
        const eventName = 'mousemove';
        const toolName = 'identifyFloatingTool';
        const retval = unRegisterEventListener(eventName, toolName);
        expect(retval).toExist();
        expect(retval.type).toEqual(UNREGISTER_EVENT_LISTENER);
        expect(retval.eventName).toEqual(eventName);
        expect(retval.toolName).toEqual(toolName);
    });
    it('mouseMove', () => {
        const position = {lat: 100, lng: 200};
        const retval = mouseMove(position);
        expect(retval).toExist();
        expect(retval.type).toEqual(MOUSE_MOVE);
        expect(retval.position).toEqual(position);
    });
    it('mouseOut', () => {
        const retval = mouseOut();
        expect(retval).toExist();
        expect(retval.type).toEqual(MOUSE_OUT);
    });
});
