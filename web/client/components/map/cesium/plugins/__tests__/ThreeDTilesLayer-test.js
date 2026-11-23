/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';
import { isGooglePhotorealistic3DTilesUrl } from '../ThreeDTilesLayer';

describe('Cesium ThreeDTilesLayer', () => {
    it('isGooglePhotorealistic3DTilesUrl detects the Google tiles host', () => {
        expect(isGooglePhotorealistic3DTilesUrl('https://tile.googleapis.com/v1/3dtiles/root.json')).toBe(true);
        expect(isGooglePhotorealistic3DTilesUrl('https://tile.googleapis.com/v1/3dtiles/root.json?key=KEY')).toBe(true);
    });
    it('isGooglePhotorealistic3DTilesUrl ignores the Google url when it is not the host', () => {
        expect(isGooglePhotorealistic3DTilesUrl('https://example.com/tileset.json?source=https://tile.googleapis.com')).toBe(false);
        expect(isGooglePhotorealistic3DTilesUrl('https://example.com/https://tile.googleapis.com/v1/3dtiles/root.json')).toBe(false);
        expect(isGooglePhotorealistic3DTilesUrl('https://tile.googleapis.com.example.com/v1/3dtiles/root.json')).toBe(false);
    });
    it('isGooglePhotorealistic3DTilesUrl ignores other protocols and ports', () => {
        expect(isGooglePhotorealistic3DTilesUrl('http://tile.googleapis.com/v1/3dtiles/root.json')).toBe(false);
        expect(isGooglePhotorealistic3DTilesUrl('https://tile.googleapis.com:8443/v1/3dtiles/root.json')).toBe(false);
    });
    it('isGooglePhotorealistic3DTilesUrl ignores relative and missing urls', () => {
        expect(isGooglePhotorealistic3DTilesUrl('/tileset.json')).toBe(false);
        expect(isGooglePhotorealistic3DTilesUrl('')).toBe(false);
        expect(isGooglePhotorealistic3DTilesUrl(undefined)).toBe(false);
    });
});
