/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    FGB,
    FGB_LAYER_TYPE
} from '../../FlatGeobuf';
import {
    textSearch,
    getLayerFromRecord
} from '../FlatGeobuf';

const FGB_FILE = 'base/web/client/test-resources/flatgeobuf/UScounties_subset.fgb';

describe('Test FlatGeobuf API catalog', () => {
    it('should return a single record for flatGeobuf', (done) => {
        textSearch(FGB_FILE)
            .then((response) => {
                expect(response.records.length).toBe(1);
                expect(response.records[0].type).toBe(FGB_LAYER_TYPE);
                expect(response.records[0].visibility).toBe(true);
                expect(response.records[0].format).toBe(FGB);
                // TODO test bbox on flatgeobuf upgrade > v4.4.5
                done();
            });
    });
    it('should extract the layer config from a catalog record', () => {
        const catalogRecord = {
            serviceType: FGB_LAYER_TYPE,
            isValid: true,
            identifier: FGB_FILE,
            url: FGB_FILE
        };
        const layer = getLayerFromRecord(catalogRecord);
        expect(layer.type).toEqual("model");
        expect(layer.url).toEqual(FGB_FILE);
        expect(layer.title).toEqual("Title");
        expect(layer.visibility).toEqual(true);
        expect(layer.bbox.crs).toEqual('EPSG:4326');
    });
});

