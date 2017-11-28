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
     focusServicesList, FOCUS_SERVICES_LIST, changeCatalogMode, CHANGE_CATALOG_MODE, changeTitle, CHANGE_TITLE,
    changeUrl, CHANGE_URL, changeType, CHANGE_TYPE, addService, ADD_SERVICE, addCatalogService, ADD_CATALOG_SERVICE, resetCatalog, RESET_CATALOG,
    changeAutoload, CHANGE_AUTOLOAD, deleteCatalogService, DELETE_CATALOG_SERVICE, deleteService, DELETE_SERVICE, savingService,
    SAVING_SERVICE, DESCRIBE_ERROR, initCatalog, CATALOG_INITED} = require('../catalog');
const {CHANGE_LAYER_PROPERTIES, ADD_LAYER} = require('../layers');
describe('Test correctness of the catalog actions', () => {

    it('deleteCatalogService', () => {
        var retval = deleteCatalogService(service);

        expect(retval).toExist();
        expect(retval.type).toBe(DELETE_CATALOG_SERVICE);
        expect(retval.service).toBe(service);
    });
    it('deleteService', () => {
        var retval = deleteService(status);

        expect(retval).toExist();
        expect(retval.type).toBe(DELETE_SERVICE);
    });
    it('changeAutoload', () => {
        let status = true;
        var retval = changeAutoload(status);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_AUTOLOAD);
        expect(retval.autoload).toBe(status);
    });
    it('savingService', () => {
        let status = true;
        var retval = savingService(status);

        expect(retval).toExist();
        expect(retval.type).toBe(SAVING_SERVICE);
        expect(retval.status).toBe(status);
    });
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
    it('changeTitle', () => {
        var retval = changeTitle(title);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_TITLE);
        expect(retval.title).toBe(title);
    });
    it('changeUrl', () => {
        var retval = changeUrl(url);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_URL);
        expect(retval.url).toBe(url);
    });
    it('changeType', () => {
        const newType = "wms";
        var retval = changeType(newType);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_TYPE);
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
    it('initCatalog', (done) => {
        const API = {
            myApi: {
                reset: () => {}
            }
        };
        const spyReset = expect.spyOn(API.myApi, 'reset');
        initCatalog(API)(e => {
            expect(e.type).toBe(CATALOG_INITED);
            expect(spyReset).toHaveBeenCalled();
            done();
        });
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
                expect(action.newProperties.search.type).toBe('wfs');
                expect(action.newProperties.search.url).toBe("http://some.geoserver.org:80/geoserver/wfs");
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
    it('add layer with no describe layer', (done) => {
        const verify = (action) => {
            if (action.type === ADD_LAYER) {
                expect(action.layer).toExist();
                const layer = action.layer;
                expect(layer.id).toExist();
                expect(layer.id).toBe(LayersUtils.getLayerId(action.layer, []));
            } else if (action.type === DESCRIBE_ERROR) {
                expect(action.layer).toExist();
                expect(action.error).toExist();
                done();
            }
        };
        const callback = addLayer({
            url: 'base/web/client/test-resources/wms/Missing.xml',
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
