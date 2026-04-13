/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from "expect";

import {
    SHOW_CAMERA_POSITION,
    HIDE_CAMERA_POSITION,
    CHANGE_CAMERA_POSITION_CRS,
    CHANGE_CAMERA_POSITION_HEIGHT_TYPE,
    showCameraPosition,
    hideCameraPosition,
    changeCameraPositionCrs,
    changeCameraPositionHeightType
} from "../cameraPosition";

describe("cameraPosition actions", () => {
    it("show camera position", () => {
        const result = showCameraPosition();
        expect(result.type).toBe(SHOW_CAMERA_POSITION);
    });

    it("hide camera position", () => {
        const result = hideCameraPosition();
        expect(result.type).toBe(HIDE_CAMERA_POSITION);
    });

    it("change camera position crs", () => {
        const crs = "EPSG:3857";
        const result = changeCameraPositionCrs(crs);
        expect(result.type).toBe(CHANGE_CAMERA_POSITION_CRS);
        expect(result.crs).toBe(crs);
    });

    it("change camera position height type", () => {
        const heightType = "MSL";
        const result = changeCameraPositionHeightType(heightType);
        expect(result.type).toBe(CHANGE_CAMERA_POSITION_HEIGHT_TYPE);
        expect(result.heightType).toBe(heightType);
    });
});
