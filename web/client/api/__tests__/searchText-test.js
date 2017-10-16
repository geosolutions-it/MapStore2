/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {API} = require('../searchText');
const axios = require('axios');

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
});
