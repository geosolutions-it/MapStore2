/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import MarkerUtils from '../MarkerUtils';

describe('Test the MarkerUtils', () => {
    it('extraMarker offsets', () => {
        expect(MarkerUtils.extraMarkers.getOffsets(MarkerUtils.extraMarkers.colors[0], MarkerUtils.extraMarkers.shapes[0])).toEqual([-2, 0]);
        expect(MarkerUtils.extraMarkers.getOffsets(MarkerUtils.extraMarkers.colors[1], MarkerUtils.extraMarkers.shapes[0])).toEqual([-(MarkerUtils.extraMarkers.size[0] + 2), 0]);
        expect(MarkerUtils.extraMarkers.getOffsets(MarkerUtils.extraMarkers.colors[1], MarkerUtils.extraMarkers.shapes[1])).toEqual([-(MarkerUtils.extraMarkers.size[0] + 2), -MarkerUtils.extraMarkers.size[1]]);
    });

    it('extraMarker matches', () => {
        expect(MarkerUtils.extraMarkers.matches({
            iconColor: 'red',
            iconShape: 'square'
        }, {
            color: 'red',
            shape: 'square'
        })).toBe(true);

        expect(MarkerUtils.extraMarkers.matches({
            iconColor: 'red',
            iconShape: 'circle'
        }, {
            color: 'red',
            shape: 'square'
        })).toBe(false);

        expect(MarkerUtils.extraMarkers.matches({
            iconColor: 'red',
            iconShape: 'circle'
        }, {
            color: 'orange',
            shape: 'circle'
        })).toBe(false);
    });

    it('extraMarker getStyle', () => {
        expect(MarkerUtils.extraMarkers.getStyle({
            color: 'red',
            shape: 'square'
        })).toEqual({
            iconColor: 'red',
            iconShape: 'square'
        });
    });

    it('getGlyphs', () => {
        expect(Object.keys(MarkerUtils.getGlyphs('fontawesome')).length > 0).toBe(true);
        expect(MarkerUtils.getGlyphs('fontawesome').comment).toExist();
    });

    it('markerToDataUrl', () => {
        const style = {
            iconShape: 'penta',
            iconColor: 'green'};
        const dataUrl = MarkerUtils.extraMarkers.markerToDataUrl(style);
        expect(dataUrl).toExist();
    });
});
