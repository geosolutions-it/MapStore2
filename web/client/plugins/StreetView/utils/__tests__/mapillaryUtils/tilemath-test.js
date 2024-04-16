/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import { baseImageLevel, sizeToLevelColumnsRows, tileToPixelCoords2D, getTilesAtZ, getTiles } from '../../mapillaryUtils/tilemath';

describe('Mapillary tile Math methods', () => {

    it('test baseImageLevel with 256*256', () => {
        let imageSize = { w: 256, h: 256 };
        let baseImgLevel = baseImageLevel(imageSize);
        expect(baseImgLevel).toEqual(8);
    });
    it('test baseImageLevel with 512*512', () => {
        let imageSize = { w: 512, h: 512 };
        let baseImgLevel = baseImageLevel(imageSize);
        expect(baseImgLevel).toEqual(9);
    });
    it('test sizeToLevelColumnsRows', () => {
        let imageSize = { w: 256, h: 256 };
        let level = { z: 10, max: 0 };
        let { columns, rows } = sizeToLevelColumnsRows(imageSize, level);
        expect(columns).toEqual(256);
        expect(rows).toEqual(256);
    });
    it('test tileToPixelCoords2D', () => {
        let imageSize = { w: 256, h: 256 };
        let level = { z: 10, max: 0 };
        let tile = { x: 128, y: 128 };
        let { x, y, w, h } = tileToPixelCoords2D(tile, imageSize, level);
        expect(x).toEqual(128);
        expect(y).toEqual(128);
        expect(h).toEqual(1);
        expect(w).toEqual(1);
    });
    it('test getTilesAtZ with z = 10', () => {
        let imageSize = { w: 256, h: 256 };
        let z = 10;
        let tiles = getTilesAtZ(imageSize, z);
        expect(tiles.length).toEqual(1);
        expect(tiles[0].x).toEqual(0);
        expect(tiles[0].y).toEqual(0);
        expect(tiles[0].z).toEqual(10);
    });
    it('test getTilesAtZ with z = 11', () => {
        let imageSize = { w: 256, h: 256 };
        let z = 11;
        let tiles = getTilesAtZ(imageSize, z);
        expect(tiles.length).toEqual(4);
        expect(tiles[0].x).toEqual(0);
        expect(tiles[0].y).toEqual(0);
        expect(tiles[0].z).toEqual(11);
    });
    it('test getTiles with image 512*512', () => {
        let imageSize = { w: 512, h: 512 };
        let tiles = getTiles(imageSize);
        expect(tiles.length).toEqual(0);
    });
    it('test getTiles with image (512*3)*(512*3)', () => {
        let imageSize = { w: (512 * 3), h: (512 * 3) };
        let tiles = getTiles(imageSize);
        expect(tiles.length).toEqual(4);
        // 1st tile
        expect(tiles[0].x).toEqual(0);
        expect(tiles[0].y).toEqual(0);
        expect(tiles[0].z).toEqual(11);
        // 2nd tile
        expect(tiles[1].x).toEqual(1);
        expect(tiles[1].y).toEqual(0);
        expect(tiles[1].z).toEqual(11);
        // 3rd tile
        expect(tiles[2].x).toEqual(0);
        expect(tiles[2].y).toEqual(1);
        expect(tiles[2].z).toEqual(11);
        // 4th tile
        expect(tiles[3].x).toEqual(1);
        expect(tiles[3].y).toEqual(1);
        expect(tiles[3].z).toEqual(11);
    });
});
