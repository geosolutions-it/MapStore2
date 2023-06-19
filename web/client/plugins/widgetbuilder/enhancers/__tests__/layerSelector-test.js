/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import { addSearchObservable } from '../layerSelector';


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

});

