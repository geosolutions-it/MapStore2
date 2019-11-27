/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { addProjections, fallbackToSupportedProjection } from '../projUtils';

import {get} from 'ol/proj';

const SAMPLE_PROJECTION = {
    "code": "EPSG:25832",
    "def": "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
    "extent": [
        -46133.17,
        5048875.26857567,
        1206211.10142433,
        6301219.54
    ],
    "worldExtent": [
        0.105946742405689,
        45.2375427360256,
        20.4488912945257,
        56.5360493905526
    ]
};

describe('projUtils', () => {
    it('axis orientation', () => {
        addProjections(SAMPLE_PROJECTION.code, SAMPLE_PROJECTION.extent, SAMPLE_PROJECTION.worldExtent, "neu", "m");
        const prj = get(SAMPLE_PROJECTION.code);
        expect(prj).toExist();
        expect(prj.getAxisOrientation()).toBe("neu");
    });
    it('units', () => {
        addProjections(SAMPLE_PROJECTION.code, SAMPLE_PROJECTION.extent, SAMPLE_PROJECTION.worldExtent, "enu", "m");
        const prj = get(SAMPLE_PROJECTION.code);
        expect(prj).toExist();
        expect(prj.getUnits()).toBe("m");
    });
    it('test fallbackToSupportedProjection with unsupported custom crs', () => {
        expect(fallbackToSupportedProjection([], "EPSG:31468")).toEqual("EPSG:3857");
    });
    it('test fallbackToSupportedProjection with supported custom crs', () => {
        expect(fallbackToSupportedProjection([{code: "EPSG:31468"}], "EPSG:31468")).toEqual("EPSG:31468");
    });
});
