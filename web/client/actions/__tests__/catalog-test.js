/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const url = "some url";
const title = "some title";
const type = "wms";
const service = {
    title,
    url,
    type
};
const expect = require('expect');
const LayersUtils = require('../../utils/LayersUtils');
const {getRecords, addLayerError, addLayer, ADD_LAYER_ERROR, changeCatalogFormat, CHANGE_CATALOG_FORMAT, changeSelectedService, CHANGE_SELECTED_SERVICE,
     focusServicesList, FOCUS_SERVICES_LIST, changeCatalogMode, CHANGE_CATALOG_MODE, changeNewTitle, CHANGE_NEW_TITLE,
    changeNewUrl, CHANGE_NEW_URL, changeNewType, CHANGE_NEW_TYPE, addService, ADD_SERVICE, addCatalogService, ADD_CATALOG_SERVICE, resetCatalog, RESET_CATALOG} = require('../catalog');
const {CHANGE_LAYER_PROPERTIES, ADD_LAYER} = require('../layers');
describe('Test correctness of the catalog actions', () => {

    it('changeCatalogFormat', () => {
        var retval = changeCatalogFormat(type);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_CATALOG_FORMAT);
        expect(retval.format).toBe(type);
    });
    it('changeSelectedService', () => {
        var retval = changeSelectedService(service);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_SELECTED_SERVICE);
        expect(retval.service).toBe(service);
    });
    it('focusServicesList', () => {
        const status = true;
        var retval = focusServicesList(status);

        expect(retval).toExist();
        expect(retval.type).toBe(FOCUS_SERVICES_LIST);
        expect(retval.status).toBe(status);
    });
    it('changeCatalogMode', () => {
        const mode = "edit";
        var retval = changeCatalogMode(mode);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_CATALOG_MODE);
        expect(retval.mode).toBe(mode);
    });
    it('changeNewTitle', () => {
        var retval = changeNewTitle(title);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_NEW_TITLE);
        expect(retval.title).toBe(title);
    });
    it('changeNewUrl', () => {
        var retval = changeNewUrl(url);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_NEW_URL);
        expect(retval.url).toBe(url);
    });
    it('changeNewType', () => {
        const newType = "wms";
        var retval = changeNewType(newType);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_NEW_TYPE);
        expect(retval.newType).toBe(newType);
    });
    it('addService', () => {
        var retval = addService();
        expect(retval).toExist();
        expect(retval.type).toBe(ADD_SERVICE);
    });
    it('addCatalogService', () => {
        var retval = addCatalogService(service);

        expect(retval).toExist();
        expect(retval.type).toBe(ADD_CATALOG_SERVICE);
        expect(retval.service).toBe(service);
    });
    it('resetCatalog', () => {
        var retval = resetCatalog();
        expect(retval).toExist();
        expect(retval.type).toBe(RESET_CATALOG);
    });
    it('getRecords ISO Metadata Profile', (done) => {
        getRecords('csw', 'base/web/client/test-resources/csw/getRecordsResponseISO.xml', 1, 1)((actionResult) => {
            try {
                let result = actionResult && actionResult.result;
                expect(result).toExist();
                expect(result.records).toExist();
                expect(result.records.length).toBe(1);
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('getRecords Error', (done) => {
        getRecords('csw', 'base/web/client/test-resources/csw/getRecordsResponseException.xml', 1, 1)((result) => {
            try {
                expect(result).toExist();
                expect(result.error).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('getRecords Dublin Core', (done) => {
        getRecords('csw', 'base/web/client/test-resources/csw/getRecordsResponseDC.xml', 1, 2)((actionResult) => {
            try {
                let result = actionResult && actionResult.result;
                expect(result).toExist();
                expect(result.records).toExist();
                expect(result.records.length).toBe(2);
                let rec0 = result.records[0];
                expect(rec0.dc).toExist();
                expect(rec0.dc.URI).toExist();
                expect(rec0.dc.URI[0]);
                let uri = rec0.dc.URI[0];
                expect(uri.name).toExist();
                expect(uri.value).toExist();
                expect(uri.description).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('add layer and describe it', (done) => {
        const verify = (action) => {
            if (action.type === ADD_LAYER) {
                expect(action.layer).toExist();
                const layer = action.layer;
                expect(layer.id).toExist();
                expect(layer.id).toBe(LayersUtils.getLayerId(action.layer, []));
            } else if (action.type === CHANGE_LAYER_PROPERTIES) {
                expect(action.layer).toExist();
                expect(action.newProperties).toExist();
                expect(action.newProperties.search).toExist();
                expect(action.newProperties.search.type ).toBe('wfs');
                expect(action.newProperties.search.url).toBe("http://some.geoserver.org:80/geoserver/wfs?");
                done();
            }
        };
        const callback = addLayer({
            url: 'base/web/client/test-resources/wms/DescribeLayers.xml',
            type: 'wms',
            name: 'workspace:vector_layer'
        });
        callback(verify, () => ({ layers: []}));
    });
    it('sets an error on addLayerError action', () => {
        const action = addLayerError('myerror');

        expect(action.type).toBe(ADD_LAYER_ERROR);
        expect(action.error).toBe('myerror');
    });
});
