/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {getRequestLoadValue, getRequestParameterValue, postRequestLoadValue} from "../QueryParamsUtils";

describe('QueryParamsUtils', () => {
    it('test getRequestLoadValue', () => {
        const state = {
            router: {
                location: {
                    search: '?featureinfo={%22lat%22:%2038.72,%20%22lng%22:%20-95.625}&zoom=5'
                }
            }
        };
        const featureinfo = getRequestLoadValue('featureinfo', state);
        const zoom = getRequestLoadValue('zoom', state);
        const center = getRequestLoadValue('center', state);
        expect(featureinfo.lat).toBe(38.72);
        expect(featureinfo.lng).toBe(-95.625);
        expect(zoom).toBe(5);
        expect(center).toBe(null);
    });
    it('test getRequestLoadValue - invalid JSON', () => {
        const state = {
            router: {
                location: {
                    search: '?featureinfo={%22lat:%2038.72,%20%22lng%22:%20-95.625}&zoom=5'
                }
            }
        };
        const featureinfo = getRequestLoadValue('featureinfo', state);
        const zoom = getRequestLoadValue('zoom', state);
        const center = getRequestLoadValue('center', state);
        expect(featureinfo).toBe("{\"lat: 38.72, \"lng\": -95.625}");
        expect(zoom).toBe(5);
        expect(center).toBe(null);
    });
    it('test postRequestLoadValue', () => {
        sessionStorage.setItem('queryParams', JSON.stringify({featureinfo: {lat: 38.72, lng: -95.625, filterNameList: []}, zoom: 5, center: "41,0"}));
        let featureinfo = postRequestLoadValue('featureinfo', sessionStorage);
        expect(featureinfo.lat).toBe(38.72);
        expect(featureinfo.lng).toBe(-95.625);
        expect(featureinfo.filterNameList).toEqual([]);

        const storageItem = sessionStorage.getItem('queryParams');
        featureinfo = JSON.parse(storageItem)?.featureinfo;
        expect(featureinfo).toBe(undefined);

        const zoom = postRequestLoadValue('zoom', sessionStorage);
        const center = postRequestLoadValue('center', sessionStorage);
        expect(zoom).toBe(5);
        expect(center).toBe("41,0");
    });
    it('test getRequestParameterValue', () => {
        const state = {
            router: {
                location: {
                    search: '?featureinfo={%22lat%22:%2038.72,%20%22lng%22:%20-95.625}&zoom=5'
                }
            }
        };
        sessionStorage.setItem('queryParams', JSON.stringify({featureinfo: {lat: 5, lng: 5, filterNameList: []}, zoom: 3, center: "41,0"}));
        const featureinfo = getRequestParameterValue('featureinfo', state, sessionStorage);
        const zoom = getRequestParameterValue('zoom', state, sessionStorage);
        const center = getRequestParameterValue('center', state, sessionStorage);
        expect(featureinfo.lat).toBe(38.72);
        expect(featureinfo.lng).toBe(-95.625);
        expect(featureinfo.filterNameList).toBe(undefined);
        expect(zoom).toBe(5);
        expect(center).toBe("41,0");
    });
});


