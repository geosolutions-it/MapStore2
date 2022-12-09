/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
    textSearch,
    getCatalogRecords,
    tmsToLayer,
    tileProviderToLayer
} from '../TMS';
import { compose, set } from '../../../utils/ImmutableUtils';
import axios from '../../../libs/ajax';
import expect from 'expect';


import MockAdapter from "axios-mock-adapter";
let mockAxios;
import TILE_MAP_SERVICE_RESPONSE from 'raw-loader!../../../test-resources/tms/TileMapServiceSample.xml';
import ConfigUtils from '../../../utils/ConfigUtils';
import TileMapSample from '../../../test-resources/tms/TileMapSample';

describe('TMS (Abstraction) API', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    describe("tms", () => {
        it('TMS 1.0.0', (done) => {
            mockAxios.onGet().reply(200, TILE_MAP_SERVICE_RESPONSE);
            textSearch('someurl', 1, 4, "", {options: {service: {provider: "tms"}}}).then((result) => {
                try {
                    expect(result).toBeTruthy();
                    expect(result.numberOfRecordsReturned).toBe(4);
                    expect(result.numberOfRecordsMatched).toBe(12);
                    expect(result.records.length).toBe(4);
                    expect(result.records[0].title).toBe("tasmania_water_bodies");
                    expect(result.records[0].srs).toBe("EPSG:4326");
                    expect(result.records[0].profile).toBe("local");
                    expect(result.records[0].href).toBe("http://some-url.org/geoserver/gwc/service/tms/1.0.0/gs%3Atasmania_water_bodies@EPSG%3A4326@png");
                    expect(result.records[0].identifier).toBe("http://some-url.org/geoserver/gwc/service/tms/1.0.0/gs%3Atasmania_water_bodies@EPSG%3A4326@png");
                    expect(result.records[0].format).toBe("png");
                    expect(result.records[0].tmsUrl).toBe("someurl");
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
        it('tileProvider', (done) => {
            textSearch('someurl', 1, 4, "", { options: { service: { provider: "OpenStreetMap" } } }).then((result) => {
                try {
                    expect(result).toBeTruthy();
                    expect(result.numberOfRecordsReturned).toBe(4);
                    expect(result.numberOfRecordsMatched).toBe(5);
                    expect(result.records.length).toBe(4);
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
    });
    describe('tms and tileProvider', () => {
        const TMS_DATA = { records: [{
            title: "TEST_TITLE",
            href: "TEST_HREF",
            srs: "EPSG:4326"
        }]};
        const TILEPROVIDER_DATA = {
            records: [{
                provider: "provider.variant",
                options: {
                    subdomains: ['a']
                }
            }]
        };
        const OPTIONS_TMS = {
            tmsUrl: "TMS_URL",
            url: "SomeURL",
            service: {provider: "tms"}
        };
        const OPTIONS_TILEPROVIDER = {

        };

        it('getCatalogRecords tileProvider', () => {
            const res = getCatalogRecords(TILEPROVIDER_DATA, OPTIONS_TILEPROVIDER);
            const rec = res[0];
            expect(res[0]).toBeTruthy();
            expect(rec.title).toBe(TILEPROVIDER_DATA.records[0].provider);
            expect(rec.provider).toBe(TILEPROVIDER_DATA.records[0].provider);
            expect(rec.options).toBe(TILEPROVIDER_DATA.records[0].options);
            expect(rec.layerType).toBe("tileprovider");
        });
        it('getCatalogRecords TMS 1.0.0', () => {
            const res = getCatalogRecords(TMS_DATA, OPTIONS_TMS);
            const rec = res[0];
            expect(res[0]).toBeTruthy();
            expect(rec.title).toBe(TMS_DATA.records[0].title);
            expect(rec.description).toBe(TMS_DATA.records[0].srs);
            expect(rec.tileMapUrl).toBe(TMS_DATA.records[0].href);
            expect(rec.references[0].url).toBe(OPTIONS_TMS.url);
            expect(rec.references[0].type).toBe("OGC:TMS");
            expect(rec.references[0].version).toBe("1.0.0");
        });
        it('getCatalogRecords TMS 1.0.0 (optional format in description)', () => {
            const res = getCatalogRecords({...TMS_DATA, records: [{
                ...TMS_DATA.records[0],
                format: "jpg"
            }]}, OPTIONS_TMS);
            const rec = res[0];
            expect(res[0]).toBeTruthy();
            expect(rec.title).toBe(TMS_DATA.records[0].title);
            expect(rec.description).toBe(TMS_DATA.records[0].srs + ", jpg");
            expect(rec.tileMapUrl).toBe(TMS_DATA.records[0].href);
            expect(rec.references[0].url).toBe(OPTIONS_TMS.url);
            expect(rec.references[0].type).toBe("OGC:TMS");
            expect(rec.references[0].version).toBe("1.0.0");
        });
        it('tmsToLayer', () => {
            // constants
            const RECORD = {
                tileMapUrl: "TEST"
            };
            const OPTIONS = {
                forceDefaultTileGrid: true
            };

            const layer = tmsToLayer(RECORD, { tileMap: TileMapSample, service: OPTIONS });
            const SRS = TileMapSample.TileMap.SRS;
            const { x, y } = TileMapSample.TileMap.Origin.$;
            const {minx, miny, maxx, maxy} = TileMapSample.TileMap.BoundingBox.$;
            expect(layer.type).toBe("tms");
            expect(layer.visibility).toBe(true);
            expect(layer.hideErrors).toBe(true); // avoid many error that can occour
            expect(layer.name).toBe(TileMapSample.TileMap.Title);
            expect(layer.title).toBe(TileMapSample.TileMap.Title);
            expect(layer.description).toBe(TileMapSample.TileMap.Abstract);
            expect(layer.srs).toBe(SRS);
            expect(layer.allowedSRS).toEqual({[SRS]: true});
            expect(layer.tileMapUrl).toExist(RECORD.tileMapUrl);
            expect(layer.forceDefaultTileGrid).toBe(OPTIONS.forceDefaultTileGrid);
            expect(layer.origin).toEqual({x: parseFloat(x), y: parseFloat(y)});
            expect(layer.bbox).toEqual({
                crs: SRS,
                bounds: {minx: parseFloat(minx), miny: parseFloat(miny), maxx: parseFloat(maxx), maxy: parseFloat(maxy)}
            });
        });
        it('tmsToLayer (authentication)', () => {
            // setup authentication
            const rules = ConfigUtils.getConfigProp('authenticationRules');
            ConfigUtils.setConfigProp('authenticationRules', [
                {
                    "urlPattern": ".*geoserver.*",
                    "method": "test",
                    "authkeyParamName": "authkey",
                    "token": "mykey"
                }
            ]);

            // constants
            const RECORD = {
                tileMapUrl: "TEST"
            };
            const OPTIONS = {
                forceDefaultTileGrid: true
            };
            // setup authenticated test file
            const TileMapServiceAuthenticated = compose(
                set('TileMap.$.tilemapservice', `${TileMapSample.TileMap.$.tilemapservice}?authkey=AUTHKEY`),
                set('TileMap.TileSets.TileSet', TileMapSample.TileMap.TileSets.TileSet.map(({$}) => {
                    return {
                        $: {
                            ...$,
                            href: `${$.href}?authkey=AUTHKEY`
                        }
                    };
                }))
            )(TileMapSample);
            ConfigUtils.setConfigProp('useAuthenticationRules', true);

            const layer = tmsToLayer(RECORD, { tileMap: TileMapServiceAuthenticated, service: OPTIONS });
            layer.tileSets.map(({href = ""}) => {
                expect(href.indexOf("authkey=")).toBe(-1);
            });
            expect(layer.tileMapService.indexOf("authkey=")).toBe(-1);
            expect(layer.tileMapService.indexOf(TileMapSample.TileMap.$.tilemapservice)).toBe(0);
            // tear down authentication
            ConfigUtils.setConfigProp('authenticationRules', rules); // restore old values
            ConfigUtils.setConfigProp('useAuthenticationRules', false);
        });
        it('tileProviderToLayer', ( ) => {
            const RECORD = {
                url: "url",
                title: "title",
                options: {"options": "something"},
                provider: "provider"
            };
            const layer = tileProviderToLayer(RECORD);
            expect(layer.type).toBe("tileprovider");
            expect(layer.visibility).toBe(true);
            expect(layer.url).toBe(RECORD.url);
            expect(layer.title).toBe(RECORD.title);
            expect(layer.options).toBe(RECORD.options);
            expect(layer.provider).toBe(RECORD.provider);
            expect(layer.name).toBe(RECORD.provider);
        });
    });
});
