/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import assign from 'object-assign';
import axios from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';

import {
    deleteMap,
    DELETE_MAP,
    doNothing,
    DO_NOTHING,
    setUnsavedChanged,
    SET_UNSAVED_CHANGES,
    MAP_UPDATING,
    mapUpdating,
    ATTRIBUTE_UPDATED,
    attributeUpdated,
    THUMBNAIL_ERROR,
    thumbnailError,
    MAPS_SEARCH_TEXT_CHANGED,
    mapsSearchTextChanged,
    MAPS_LIST_LOAD_ERROR,
    loadError,
    MAP_ERROR,
    mapError,
    METADATA_CHANGED,
    metadataChanged,
    updateAttribute,
    SAVE_MAP_RESOURCE,
    saveMapResource
} from '../maps';

import GeoStoreDAO from '../../api/GeoStoreDAO';
let oldAddBaseUri = GeoStoreDAO.addBaseUrl;

const BASE_URL = 'base/web/client/test-resources/geostore/';

describe('Test correctness of the maps actions', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
        GeoStoreDAO.addBaseUrl = (options) => {
            return assign(options, {baseURL: BASE_URL});
        };
    });
    afterEach(() => {
        GeoStoreDAO.addBaseUrl = oldAddBaseUri;
        mockAxios.restore();
    });
    it('updateAttribute with error', (done) => {
        const value = "asdSADs";
        const name = "thumbnail";
        const resourceId = -1;
        const type = "STRING";
        const retFun = updateAttribute(resourceId, name, value, type, {});
        expect(retFun).toExist();
        retFun((action) => {
            expect(action.type).toBe(THUMBNAIL_ERROR);
            done();

        });

    });
    it('updateAttribute', (done) => {
        const value = "value.json";
        const name = "thumbnail";
        const resourceId = 1;
        const type = "STRING";

        mockAxios.onPut().reply(({url, data }) => {
            expect(url).toBe(`${BASE_URL}resources/resource/${resourceId}/attributes/`);
            expect(JSON.parse(data)).toEqual({
                "restAttribute": {
                    name,
                    value
                }
            });
            return [200];
        });

        const retFun = updateAttribute(resourceId, name, value, type, {});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(ATTRIBUTE_UPDATED);
            count++;
            if (count === 1) {
                done();
            }
        });
    });
    it('mapUpdating', () => {
        let resourceId = 13;
        var retval = mapUpdating(resourceId);
        expect(retval).toExist();
        expect(retval.type).toBe(MAP_UPDATING);
        expect(retval.resourceId).toBe(resourceId);
    });

    it('attributeUpdated', () => {
        let resourceId = 13;
        let name = "thumbnail";
        let value = "exampleDataUri";
        let type = "STRING";
        let retval = attributeUpdated(resourceId, name, value, type);
        expect(retval).toExist();
        expect(retval.type).toBe(ATTRIBUTE_UPDATED);
        expect(retval.resourceId).toBe(resourceId);
        expect(retval.name).toBe(name);
        expect(retval.value).toBe(value);
    });

    it('thumbnailError', () => {
        let resourceId = 1;
        let error = {status: 404, message: "not found"};
        let retval = thumbnailError(resourceId, error);
        expect(retval).toExist();
        expect(retval.type).toBe(THUMBNAIL_ERROR);
        expect(retval.resourceId).toBe(resourceId);
        expect(retval.error.status).toBe(error.status);
    });

    it('mapsSearchTextChanged', () => {
        const a = mapsSearchTextChanged("TEXT");
        expect(a.type).toBe(MAPS_SEARCH_TEXT_CHANGED);
        expect(a.text).toBe("TEXT");
    });
    it('loadError', () => {
        const a = loadError();
        expect(a.type).toBe(MAPS_LIST_LOAD_ERROR);
    });
    it('mapError', () => {
        const resourceId = 1;
        const error = "error";
        const a = mapError(resourceId, error);
        expect(a.type).toBe(MAP_ERROR);
        expect(a.error).toBe(error);
        expect(a.resourceId).toBe(resourceId);
    });
    it('mapMetadatachanged', () => {
        const prop = "name";
        const value = "newName";
        const a = metadataChanged(prop, value);
        expect(a.type).toBe(METADATA_CHANGED);
        expect(a.prop).toExist();
        expect(a.value).toExist();
        expect(a.prop).toBe(prop);
        expect(a.value).toBe(value);
    });

    it('deleteMap', () => {
        const resourceId = 1;
        const someOpt = {
            name: "name"
        };
        const options = {
            someOpt
        };
        const a = deleteMap(resourceId, options);
        expect(a.resourceId).toBe(resourceId);
        expect(a.type).toBe(DELETE_MAP);
        expect(a.options).toBe(options);
    });
    it('setUnsavedChanged', () => {
        const value = true;
        const a = setUnsavedChanged(value);
        expect(a.type).toBe(SET_UNSAVED_CHANGES);
        expect(a.value).toBe(value);
    });
    it('doNothing', () => {
        const a = doNothing();
        expect(a.type).toBe(DO_NOTHING);
    });
    it('saveMapResource', () => {
        const resource = {};
        const a = saveMapResource(resource);
        expect(a.type).toBe(SAVE_MAP_RESOURCE);
        expect(a.resource).toBe(resource);
    });

});
