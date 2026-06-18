/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { getCOGPixelData } from '../IdentifyUtils';

describe('COG - IdentifyUtils', () => {
    it('should get pixel values from a COG provider tile', (done) => {
        const data = [
            [10, 11, 12, 13, 14, 15],
            [20, 21, 22, 23, 24, 25],
            [30, 31, 32, 33, 34, 35]
        ];
        const provider = {
            requestLevels: [0, 1, 2],
            minimumLevel: 0,
            tilingScheme: {
                positionToTileXY: () => ({ x: 1, y: 2 }),
                tileXYToRectangle: () => ({
                    west: 0,
                    east: 10,
                    north: 10,
                    south: 0
                })
            },
            _loadTile: (x, y, zoom) => {
                expect(x).toBe(1);
                expect(y).toBe(2);
                expect(zoom).toBe(2);
                return Promise.resolve({
                    data,
                    width: 3,
                    height: 2
                });
            }
        };

        getCOGPixelData({
            provider,
            position: {
                longitude: 5,
                latitude: 5
            },
            zoom: 2
        })
            .then(result => {
                expect(result).toEqual({
                    0: 14,
                    1: 24,
                    2: 34
                });
                done();
            })
            .catch(done);
    });
});
