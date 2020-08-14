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
const {
    addLayersMapViewerUrl, ADD_LAYERS_FROM_CATALOGS, textSearch, TEXT_SEARCH, getRecords, addLayerError, addLayer, ADD_LAYER_ERROR, changeCatalogFormat, CHANGE_CATALOG_FORMAT, changeSelectedService, CHANGE_SELECTED_SERVICE,
    focusServicesList, FOCUS_SERVICES_LIST, changeCatalogMode, CHANGE_CATALOG_MODE, changeTitle, CHANGE_TITLE,
    changeUrl, CHANGE_URL, changeType, CHANGE_TYPE, addService, ADD_SERVICE, addCatalogService, ADD_CATALOG_SERVICE, resetCatalog, RESET_CATALOG,
    changeServiceProperty, CHANGE_SERVICE_PROPERTY, deleteCatalogService, DELETE_CATALOG_SERVICE, deleteService, DELETE_SERVICE, savingService,
    SAVING_SERVICE, DESCRIBE_ERROR, initCatalog, CATALOG_INITED, changeText, CHANGE_TEXT,
    TOGGLE_ADVANCED_SETTINGS, toggleAdvancedSettings, TOGGLE_THUMBNAIL, toggleThumbnail, TOGGLE_TEMPLATE, toggleTemplate, CHANGE_METADATA_TEMPLATE, changeMetadataTemplate, SET_LOADING,
    recordsNotFound
} = require('../catalog');
const { CHANGE_LAYER_PROPERTIES, ADD_LAYER } = require('../layers');
const { SHOW_NOTIFICATION } = require('../notifications');
describe('Test correctness of the catalog actions', () => {

    it('addLayersMapViewerUrl', () => {
        const layers = ["layer name"];
        const sources = ["catalog name"];
        const retval = addLayersMapViewerUrl(layers, sources);

        expect(retval).toExist();
        expect(retval.type).toBe(ADD_LAYERS_FROM_CATALOGS);
        expect(retval.layers).toEqual(layers);
        expect(retval.sources).toEqual(sources);
    });
    it('textSearch', () => {
        const format = "csw";
        const urlValue = "url";
        const startPosition = 1;
        const maxRecords = 1;
        const text = "text";
        const options = {};
        const retval = textSearch({ format, url: urlValue, startPosition, maxRecords, text, options });

        expect(retval).toExist();
        expect(retval.type).toBe(TEXT_SEARCH);
        expect(retval.format).toBe(format);
        expect(retval.url).toBe(urlValue);
        expect(retval.startPosition).toBe(startPosition);
        expect(retval.maxRecords).toBe(maxRecords);
        expect(retval.text).toBe(text);
        expect(retval.options).toEqual(options);
    });
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
    it('changeServiceProperty', () => {
        let status = true;
        var retval = changeServiceProperty("autoload", status);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_SERVICE_PROPERTY);
        expect(retval.property).toBe("autoload");
        expect(retval.value).toBe(status);

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
    it('changeText', () => {
        const val = "val";
        const retval = changeText(val);
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_TEXT);
        expect(retval.text).toBe(val);
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
                reset: () => { }
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
                if (actionResult.type === SET_LOADING) {
                    expect(actionResult.loading).toBe(true);
                } else {
                    let result = actionResult && actionResult.result;
                    expect(result).toExist();
                    expect(result.records).toExist();
                    expect(result.records.length).toBe(1);
                }
                done();
            } catch (ex) {
                done(ex);
            }
        }, () => { });
    });
    it('getRecords Error', (done) => {
        getRecords('csw', 'base/web/client/test-resources/csw/getRecordsResponseException.xml', 1, 1)((result) => {
            try {
                if (result.type === SET_LOADING) {
                    expect(result.loading).toBe(true);
                } else {
                    expect(result).toExist();
                    expect(result.error).toExist();
                }
                done();
            } catch (ex) {
                done(ex);
            }
        }, () => { });
    });
    it('getRecords Dublin Core', (done) => {
        getRecords('csw', 'base/web/client/test-resources/csw/getRecordsResponseDC.xml', 1, 2)((actionResult) => {
            try {
                let result = actionResult && actionResult.result;
                if (actionResult.type === SET_LOADING) {
                    expect(actionResult.loading).toBe(true);
                } else {
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
                }
                done();
            } catch (ex) {
                done(ex);
            }
        }, () => { });
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
        callback(verify, () => ({ layers: [] }));
    });
    it('add layer with multiple urls', (done) => {
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
            url: ['base/web/client/test-resources/wms/DescribeLayers.xml', 'base/web/client/test-resources/wms/DescribeLayers.xml'],
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
        callback(verify, () => ({ layers: [] }));
    });
    it('sets an error on addLayerError action', () => {
        const action = addLayerError('myerror');

        expect(action.type).toBe(ADD_LAYER_ERROR);
        expect(action.error).toBe('myerror');
    });
    it('test toggleAdvancedSettings action', () => {
        const action = toggleAdvancedSettings();
        expect(action.type).toBe(TOGGLE_ADVANCED_SETTINGS);
    });
    it('test toggleTemplate action', () => {
        const action = toggleTemplate();
        expect(action.type).toBe(TOGGLE_TEMPLATE);
    });
    it('test toggleThumbnail action', () => {
        const action = toggleThumbnail();
        expect(action.type).toBe(TOGGLE_THUMBNAIL);
    });
    it('test changeMetadataTemplate action', () => {
        const action = changeMetadataTemplate("${title}");
        expect(action.type).toBe(CHANGE_METADATA_TEMPLATE);
        expect(action.metadataTemplate).toBe("${title}");
    });
    it('test recordsNotFound action', () => {
        const action = recordsNotFound("topp:states , topp:states-tasmania");
        expect(action.type).toBe(SHOW_NOTIFICATION);
        expect(action.message).toBe("catalog.notification.errorSearchingRecords");
        expect(action.values).toEqual({ records: "topp:states , topp:states-tasmania" });
    });
});
