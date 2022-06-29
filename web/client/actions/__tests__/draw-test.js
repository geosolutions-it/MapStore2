/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import {
    CHANGE_DRAWING_STATUS,
    changeDrawingStatus,
    END_DRAWING,
    endDrawing,
    drawSupportReset,
    geometryChanged,
    GEOMETRY_CHANGED,
    drawStopped,
    DRAW_SUPPORT_STOPPED,
    setCurrentStyle,
    SET_CURRENT_STYLE,
    TOGGLE_SNAPPING,
    toggleSnapping,
    setSnappingLayer,
    SET_SNAPPING_LAYER,
    toggleSnappingIsLoading,
    SNAPPING_IS_LOADING, setSnappingConfig, SET_SNAPPING_CONFIG
} from '../draw';

describe('Test correctness of the draw actions', () => {

    it('changeDrawingStatus', () => {
        let status = "start";
        let method = "Circle";
        let owner = "queryform";
        let features = [];

        let retval = changeDrawingStatus(status, method, owner, features);

        expect(retval).toBeTruthy();
        expect(retval.type).toBe(CHANGE_DRAWING_STATUS);
        expect(retval.status).toBe("start");
        expect(retval.method).toBe("Circle");
        expect(retval.owner).toBe("queryform");
        expect(retval.features.length).toBe(0);
    });

    it('endDrawing', () => {
        let geometry = "geometry";
        let owner = "queryform";

        let retval = endDrawing(geometry, owner);

        expect(retval).toBeTruthy();
        expect(retval.type).toBe(END_DRAWING);
        expect(retval.geometry).toBe("geometry");
        expect(retval.owner).toBe("queryform");
    });

    describe("geometryChanged tests", () => {

        it('Test geometryChanged all properties', () => {
            const features = [{
                geometry: {
                    type: "Point",
                    coordinates: [1, 1]
                }
            }];
            const owner = "annotations";
            const enableEdit = true;
            const textChanged = false;
            const retval = geometryChanged(features, owner, enableEdit, textChanged);
            expect(retval).toBeTruthy();
            expect(retval.type).toBe(GEOMETRY_CHANGED);
            expect(retval.features).toBeTruthy();
            expect(retval.features).toEqual(features);
        });
        it('Test geometryChanged normalization for Point', () => {
            const features = [{
                geometry: {
                    type: "Point",
                    coordinates: [-210, 2]
                }
            }];
            const retval = geometryChanged(features);
            expect(retval).toBeTruthy();
            expect(retval.type).toBe(GEOMETRY_CHANGED);
            expect(retval.features).toBeTruthy();
            expect(retval.features).toNotEqual(features);
            expect(retval.features[0].geometry).toEqual({
                type: "Point",
                coordinates: [ 150, 2 ]
            });
        });
        it('Test geometryChanged normalization for LineString ', () => {
            const features = [{
                geometry: {
                    type: "LineString",
                    "coordinates": [
                        [-230.0, 10.0], [-210.0, 30.0], [-240.0, 40.0]
                    ]
                }
            }];
            const retval = geometryChanged(features);
            expect(retval).toBeTruthy();
            expect(retval.type).toBe(GEOMETRY_CHANGED);
            expect(retval.features).toBeTruthy();
            expect(retval.features).toNotEqual(features);
            expect(retval.features[0].geometry).toEqual({
                type: "LineString",
                coordinates: [ [ 130.00000000000003, 10 ], [ 150, 30 ], [ 120, 40 ] ]
            });
        });
        it('Test geometryChanged normalization for Polygon', () => {
            const features = [{
                geometry: {
                    type: "Polygon",
                    coordinates: [
                        [[-190.0, 10.0], [-192.0, 45.0], [196.0, 40.0], [-198.0, 20.0], [-200.0, 10.0]],
                        [[200.0, 30.0], [210.0, 35.0], [-220.0, 20.0], [230.0, 30.0]]
                    ]
                }
            }];
            const retval = geometryChanged(features);
            expect(retval).toBeTruthy();
            expect(retval.type).toBe(GEOMETRY_CHANGED);
            expect(retval.features).toBeTruthy();
            expect(retval.features).toNotEqual(features);
            expect(retval.features[0].geometry).toEqual({
                type: "Polygon",
                coordinates: [ [ [ 170, 10 ], [ 168, 45 ], [ -164.00000000000003, 40 ], [ 161.99999999999997, 20 ], [ 160, 10 ] ], [ [ -160, 30 ], [ -150, 35 ], [ 139.99999999999997, 20 ], [ -130.00000000000003, 30 ] ] ]
            });
        });

        it('Test geometryChanged normalization for MultiPoint ', () => {
            const features = [{
                geometry: {
                    type: "MultiPoint",
                    coordinates: [
                        [-210.0, 40.0], [-140.0, 30.0], [-220.0, 20.0], [-230.0, 10.0]
                    ]
                }
            }];
            const retval = geometryChanged(features);
            expect(retval).toBeTruthy();
            expect(retval.type).toBe(GEOMETRY_CHANGED);
            expect(retval.features).toBeTruthy();
            expect(retval.features).toNotEqual(features);
            expect(retval.features[0].geometry).toEqual({
                type: "MultiPoint",
                coordinates: [ [ 150, 40 ], [ -140, 30 ], [ 139.99999999999997, 20 ], [ 130.00000000000003, 10 ] ]
            });
        });

        it('Test geometryChanged normalization for MultiLineString ', () => {
            const features = [{
                geometry: {
                    type: "MultiLineString",
                    coordinates: [
                        [[-210.0, 10.0], [-220.0, 20.0], [-210.0, 40.0]],
                        [[-189.0, 40.0], [-230.0, 30.0], [-240.0, 20.0], [230.0, 10.0]]
                    ]
                }
            }];
            const retval = geometryChanged(features);
            expect(retval).toBeTruthy();
            expect(retval.type).toBe(GEOMETRY_CHANGED);
            expect(retval.features).toBeTruthy();
            expect(retval.features).toNotEqual(features);
            expect(retval.features[0].geometry).toEqual({
                type: "MultiLineString",
                coordinates: [ [ [ 150, 10 ], [ 139.99999999999997, 20 ], [ 150, 40 ] ],
                    [ [ 171, 40 ], [ 130.00000000000003, 30 ], [ 120, 20 ], [ -130.00000000000003, 10 ] ] ]
            });
        });

        it('Test geometryChanged normalization for MultiPolygon', () => {
            const features = [{
                geometry: {
                    type: "MultiPolygon",
                    coordinates: [
                        [
                            [[230.0, 20.0], [545.0, 40.0], [-210.0, 40.0], [330.0, 20.0]]
                        ],
                        [
                            [[-215.0, 5.0], [240.0, 10.0], [310.0, 20.0], [-205.0, 10.0], [215.0, 5.0]]
                        ]
                    ]
                }
            }];
            const retval = geometryChanged(features);
            expect(retval).toBeTruthy();
            expect(retval.type).toBe(GEOMETRY_CHANGED);
            expect(retval.features).toBeTruthy();
            expect(retval.features).toNotEqual(features);
            expect(retval.features[0].geometry).toEqual({
                type: "MultiPolygon",
                coordinates: [ [ [ [ -130.00000000000003, 20 ], [ -175.00000000000003, 40 ], [ 150, 40 ], [ -30, 20 ] ] ], [ [ [ 145, 5 ], [ -120, 10 ], [ -50, 20 ], [ 155, 10 ], [ -145, 5 ] ] ] ]
            });
        });
    });
    it('Test drawStopped action creator', () => {
        const retval = drawStopped();
        expect(retval).toBeTruthy();
        expect(retval.type).toBe(DRAW_SUPPORT_STOPPED);
    });
    it('Test setCurrentStyle action creator', () => {
        const retval = setCurrentStyle("somestyle");
        expect(retval).toBeTruthy();
        expect(retval.type).toBe(SET_CURRENT_STYLE);
        expect(retval.currentStyle).toBe("somestyle");
    });
    it('Test drawSupportReset action creator', () => {
        const retval = drawSupportReset();
        expect(retval).toBeTruthy();
        expect(retval.type).toBe(CHANGE_DRAWING_STATUS);
        expect(retval.status).toBe("clean");
    });
    it('Test toggleSnapping action creator', () => {
        const retval = toggleSnapping();
        expect(retval).toBeTruthy();
        expect(retval.type).toBe(TOGGLE_SNAPPING);
    });
    it('Test setSnappingLayer action creator', () => {
        const retval = setSnappingLayer('sample');
        expect(retval).toBeTruthy();
        expect(retval.type).toBe(SET_SNAPPING_LAYER);
        expect(retval.snappingLayer).toBe('sample');
    });
    it('Test toggleSnappingIsLoading action creator', () => {
        const retval = toggleSnappingIsLoading();
        expect(retval).toBeTruthy();
        expect(retval.type).toBe(SNAPPING_IS_LOADING);
    });
    it('Test setSnappingConfig action creator', () => {
        const retval = setSnappingConfig(true, 'edge', {edge: false, vertex: true, pixelTolerance: 20});
        expect(retval).toBeTruthy();
        expect(retval.type).toBe(SET_SNAPPING_CONFIG);
        expect(retval.value).toBe(true);
        expect(retval.prop).toBe('edge');
        expect(retval.pluginCfg.edge).toBe(false);
        expect(retval.pluginCfg.vertex).toBe(true);
        expect(retval.pluginCfg.pixelTolerance).toBe(20);
    });

});
