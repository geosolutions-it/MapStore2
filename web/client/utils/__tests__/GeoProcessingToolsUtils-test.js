/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    checkIfIntersectionIsPossible
} from '../GeoProcessingToolsUtils';


describe('GeoProcessingToolsUtils', () => {
    const pointFT = {
        type: "Feature",
        geometry: {
            coordinates: [1, 2],
            type: "Point"
        }
    };
    const polygonFT = {
        type: "Feature",
        geometry: {
            type: "Polygon"
        }
    };
    const lineStringFT = {
        type: "Feature",
        geometry: {
            type: "LineString"
        }
    };
    describe('checkIfIntersectionIsPossible', () => {

        it('successful result', () => {
            let result = checkIfIntersectionIsPossible(polygonFT, pointFT);
            expect(result).toBeTruthy();
            result = checkIfIntersectionIsPossible(polygonFT, lineStringFT);
            expect(result).toBeTruthy();
            result = checkIfIntersectionIsPossible(polygonFT, polygonFT);
            expect(result).toBeTruthy();
            result = checkIfIntersectionIsPossible(lineStringFT, lineStringFT);
            expect(result).toBeTruthy();
        });
        it(' failing result', () => {
            let result = checkIfIntersectionIsPossible(lineStringFT, pointFT);
            expect(result).toBeFalsy();
            result = checkIfIntersectionIsPossible(pointFT, pointFT);
            expect(result).toBeFalsy();
        });
    });

});
