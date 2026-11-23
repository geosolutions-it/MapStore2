/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { API } from '../searchText';
import axios from 'axios';
import ajax from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';

describe('Test correctness of the searchText APIs', () => {

    const myFun = (param) => {
        // do stuff
        return param;
    };
    function fun() {
        return axios.get('base/web/client/test-resources/featureCollectionZone.js');
    }

    it('setter and getter services', (done) => {
        let servName = "myService";
        API.Utils.setService(servName, myFun);
        try {
            expect(API.Services).toExist();
            expect(API.Services[servName]).toExist();
            expect(API.Utils.getService(servName)).toExist();
            done();
        } catch (ex) {
            done(ex);
        }
    });

    let serviceType = 'myCustomService';
    it('setService', (done) => {
        API.Utils.setService(serviceType, fun);
        expect(API.Utils.getService(serviceType)).toBe(fun);
        done();
    });

    describe('wfs service', () => {
        let mockAxios;
        beforeEach(() => {
            mockAxios = new MockAdapter(ajax);
        });
        afterEach(() => {
            mockAxios.restore();
        });
        it('doubles every apostrophe of each word in the CQL filter', (done) => {
            mockAxios.onGet().reply((config) => {
                try {
                    expect(config.params.cql_filter).toBe(
                        "(NAME ILIKE '%l''Isle-d''Abeau%' OR CITY ILIKE '%l''Isle-d''Abeau%') AND (NAME ILIKE '%Lyon%' OR CITY ILIKE '%Lyon%')"
                    );
                    done();
                } catch (e) {
                    done(e);
                }
                return [200, {type: "FeatureCollection", features: []}];
            });
            API.Services.wfs("l'Isle-d'Abeau Lyon", {
                url: "/geoserver/wfs",
                typeName: "places",
                queriableAttributes: ["NAME", "CITY"]
            });
        });
    });
});
