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
import expect from 'expect';

import {
    addLayersMapViewerUrl,
    ADD_LAYERS_FROM_CATALOGS,
    textSearch,
    TEXT_SEARCH,
    getRecords,
    addLayerError,
    ADD_LAYER_ERROR,
    changeCatalogFormat,
    CHANGE_CATALOG_FORMAT,
    changeSelectedService,
    CHANGE_SELECTED_SERVICE,
    focusServicesList,
    FOCUS_SERVICES_LIST,
    changeCatalogMode,
    CHANGE_CATALOG_MODE,
    changeTitle,
    CHANGE_TITLE,
    changeUrl,
    CHANGE_URL,
    changeType,
    CHANGE_TYPE,
    addService,
    ADD_SERVICE,
    addCatalogService,
    ADD_CATALOG_SERVICE,
    resetCatalog,
    RESET_CATALOG,
    changeServiceProperty,
    CHANGE_SERVICE_PROPERTY,
    deleteCatalogService,
    DELETE_CATALOG_SERVICE,
    deleteService,
    DELETE_SERVICE,
    savingService,
    SAVING_SERVICE,
    initCatalog,
    CATALOG_INITED,
    changeText,
    CHANGE_TEXT,
    TOGGLE_ADVANCED_SETTINGS,
    toggleAdvancedSettings,
    TOGGLE_THUMBNAIL,
    toggleThumbnail,
    TOGGLE_TEMPLATE,
    toggleTemplate,
    CHANGE_METADATA_TEMPLATE,
    changeMetadataTemplate,
    SET_LOADING,
    recordsNotFound,
    FORMAT_OPTIONS_FETCH,
    formatOptionsFetch,
    FORMAT_OPTIONS_LOADING,
    formatsLoading,
    SET_FORMAT_OPTIONS,
    setSupportedFormats, addLayerAndDescribe, ADD_LAYER_AND_DESCRIBE
} from '../catalog';

import { SHOW_NOTIFICATION } from '../notifications';
describe('Test correctness of the catalog actions', () => {

    it('addLayersMapViewerUrl', () => {
        const layers = ["layer name"];
        const sources = ["catalog name"];
        const options = [{"params": {"CQL_FILTER": "NAME='A'"}}];
        const retval = addLayersMapViewerUrl(layers, sources, options);

        expect(retval).toExist();
        expect(retval.type).toBe(ADD_LAYERS_FROM_CATALOGS);
        expect(retval.layers).toEqual(layers);
        expect(retval.sources).toEqual(sources);
        expect(retval.options).toEqual(options);
    });
    it('addLayerAndDescribe', () => {
        const layer = {
            type: 'wms',
            url: 'http://localhost/geoserver/wms',
            visibility: true,
            dimensions: [],
            name: 'tiger:tiger_roads',
            title: 'Manhattan (NY) roads',
            description: 'Highly simplified road layout of Manhattan in New York..',
            bbox: {
                crs: 'EPSG:4326',
                bounds: {
                    minx: '-74.02722',
                    miny: '40.684221',
                    maxx: '-73.907005',
                    maxy: '40.878178'
                }
            },
            links: [],
            params: {
                CQL_FILTER: 'NAME=\'Test\''
            },
            allowedSRS: {
                'EPSG:3785': true,
                'EPSG:3857': true,
                'EPSG:4269': true,
                'EPSG:4326': true,
                'EPSG:900913': true
            },
            catalogURL: 'http://localhost/geoserver/wms'
        };
        const retval = addLayerAndDescribe(layer);
        expect(retval).toExist();
        expect(retval.type).toBe(ADD_LAYER_AND_DESCRIBE);
        expect(retval.layer).toEqual(layer);
        expect(retval.zoomToLayer).toEqual(false);
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
    it('test formatOptionsFetch', () => {
        const action = formatOptionsFetch(url);
        expect(action.type).toBe(FORMAT_OPTIONS_FETCH);
        expect(action.url).toBe(url);
    });
    it('test formatsLoading', () => {
        const action = formatsLoading(false);
        expect(action.type).toBe(FORMAT_OPTIONS_LOADING);
        expect(action.loading).toBe(false);
    });
    it('test setSupportedFormats', () => {
        const formats = {imageFormats: ["image/png"], infoFormats: ["text/plain"]};
        const action = setSupportedFormats(formats, url);
        expect(action.type).toBe(SET_FORMAT_OPTIONS);
        expect(action.formats).toEqual(formats);
        expect(action.url).toEqual(url);
    });
});
