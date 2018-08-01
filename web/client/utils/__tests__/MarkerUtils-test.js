/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');


const {
    extraMarkers,
    getGlyphs
} = require('../MarkerUtils');

describe('Test the MarkerUtils', () => {
    it('extraMarker offsets', () => {
        expect(extraMarkers.getOffsets(extraMarkers.colors[0], extraMarkers.shapes[0])).toEqual([-2, 0]);
        expect(extraMarkers.getOffsets(extraMarkers.colors[1], extraMarkers.shapes[0])).toEqual([-(extraMarkers.size[0] + 2), 0]);
        expect(extraMarkers.getOffsets(extraMarkers.colors[1], extraMarkers.shapes[1])).toEqual([-(extraMarkers.size[0] + 2), -extraMarkers.size[1]]);
    });

    it('extraMarker matches', () => {
        expect(extraMarkers.matches({
            iconColor: 'red',
            iconShape: 'square'
        }, {
            color: 'red',
            shape: 'square'
        })).toBe(true);

        expect(extraMarkers.matches({
            iconColor: 'red',
            iconShape: 'circle'
        }, {
            color: 'red',
            shape: 'square'
        })).toBe(false);

        expect(extraMarkers.matches({
            iconColor: 'red',
            iconShape: 'circle'
        }, {
            color: 'orange',
            shape: 'circle'
        })).toBe(false);
    });

    it('extraMarker getStyle', () => {
        expect(extraMarkers.getStyle({
            color: 'red',
            shape: 'square'
        })).toEqual({
            iconColor: 'red',
            iconShape: 'square'
        });
    });

    it('getGlyphs', () => {
        expect(Object.keys(getGlyphs('fontawesome')).length > 0).toBe(true);
        expect(getGlyphs('fontawesome').comment).toExist();
    });

    it('markerToDataUrl', () => {
        const style = {
            iconShape: 'penta',
            iconColor: 'green'};
        const dataUrl = extraMarkers.markerToDataUrl(style);
        expect(dataUrl).toExist();
    });
});
