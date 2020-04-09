/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { getTileMap } from '../TMS';
import axios from '../../libs/ajax';
import expect from 'expect';


import MockAdapter from "axios-mock-adapter";
let mockAxios;
import TILE_MAP_RESPONSE from 'raw-loader!../../test-resources/tms/TileMapSample.xml';
describe('Test TMS API', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    it('getTileMap', (done) => {
        mockAxios.onGet().reply(200, TILE_MAP_RESPONSE);
        getTileMap('someurl').then((result) => {
            try {
                expect(result).toExist();
                expect(result.TileMap.TileSets.TileSet.length).toBe(23);
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
});
