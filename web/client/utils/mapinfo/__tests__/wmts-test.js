/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import axios from '../../../libs/ajax';
import MockAdapter from "axios-mock-adapter";
import {INFO_FORMATS} from "../../FeatureInfoUtils";
import {getFeatureInfo} from "../../../api/identify";

describe('mapinfo wmts utils', () => {
    let mockAxios;
    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });
    afterEach((done) => {
        if (mockAxios) {
            mockAxios.restore();
        }
        mockAxios = null;
        setTimeout(done);
    });

    it('should return the response object from getIdentifyFlow in case of 400 error, TileOutOfRange', (done) => {
        const SAMPLE_LAYER = {
            type: "wmts",
            name: "test_layer"
        };
        mockAxios.onGet().reply(() => {
            return [400, '<?xml version="1.0" encoding="UTF-8"?><ExceptionReport version="1.1.0" xmlns="http://www.opengis.net/ows/1.1"  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xsi:schemaLocation="http://www.opengis.net/ows/1.1 http://geowebcache.org/schema/ows/1.1.0/owsExceptionReport.xsd">  <Exception exceptionCode="TileOutOfRange" locator="TILEROW">    <ExceptionText>Row 84 is out of range, min: 85 max:87</ExceptionText>  </Exception></ExceptionReport>'];
        });
        getFeatureInfo(
            "TEST_URL", {
                info_format: INFO_FORMATS.PROPERTIES
            }, SAMPLE_LAYER
        ).subscribe(
            n => {
                expect(n.data.features).toEqual([]);
                expect(n.features).toEqual([]);
                done();
            },
            error => {
                return done(error);
            }
        );
    });
});
