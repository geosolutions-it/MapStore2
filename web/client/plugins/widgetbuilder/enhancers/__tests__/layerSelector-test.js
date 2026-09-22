/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import { addSearchObservable, toLayer } from '../layerSelector';


describe('layerSelector enhancer', function() {

    it('test addSearchObservable with addSearch', () => {
        expect(addSearchObservable({
            type: "wms",
            name: "test-layer"
        }, {
            type: "wms"
        }).value).toBeFalsy();
    });
    it('test addSearchObservable skip addSearch', () => {
        expect(addSearchObservable({
            type: "wfs",
            name: "test-layer"
        }, {
            type: "wfs"
        }).value).toBeTruthy();
    });

    it('normalizes WFS boundingBox to bbox', () => {
        const boundingBox = {
            crs: 'EPSG:4326',
            bounds: {
                minx: -124,
                miny: 24,
                maxx: -66,
                maxy: 49
            }
        };
        const layer = toLayer({
            type: 'wfs',
            name: 'test-layer',
            url: 'test-url',
            boundingBox
        }, {
            type: 'wfs'
        });

        expect(layer.bbox).toBe(boundingBox);
        expect(layer.boundingBox).toBe(boundingBox);
        expect(layer.search).toEqual({
            url: 'test-url',
            type: 'wfs'
        });
    });

});

