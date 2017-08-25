/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
const emptyService = {
    title: "",
    type: "wms",
    url: "",
    isNew: true
};
const url = "some url";
const title = "some title";
const type = "wms";
let service = {
    title,
    url,
    type,
    isNew: false,
    oldService: title
};
const serviceNew = {
    title: title + "new",
    url: url + "new",
    type,
    isNew: true
};
var catalog = require('../catalog');
var {RECORD_LIST_LOADED, ADD_LAYER_ERROR, RESET_CATALOG, RECORD_LIST_LOAD_ERROR, CHANGE_CATALOG_FORMAT, CHANGE_CATALOG_MODE,
    FOCUS_SERVICES_LIST, CHANGE_NEW_TITLE, CHANGE_NEW_URL, CHANGE_NEW_TYPE, CHANGE_SELECTED_SERVICE, ADD_CATALOG_SERVICE} = require('../../actions/catalog');
const sampleRecord = {
    boundingBox: {
        extent: [10.686,
            44.931,
            46.693,
            12.54],
        crs: "EPSG:4326"

    },
    dc: {
        identifier: "test-identifier",
        title: "sample title",
        subject: ["subject1", "subject2"],
        "abstract": "sample abstract",
        URI: [{
            TYPE_NAME: "DC_1_1.URI",
            protocol: "OGC:WMS-1.1.1-http-get-map",
            name: "workspace:layername",
            description: "sample layer description",
            value: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&"
        }, {
            TYPE_NAME: "DC_1_1.URI",
            protocol: "image/png",
            name: "thumbnail",
            value: "resources.get?id=187105&fname=55b9f7b9-53ff-4e2d-8537-4e681c3218c5_s.png&access=public"
        }]
    }
};
describe('Test the catalog reducer', () => {
    it('loads records from the catalog', () => {
        const state = catalog({}, {type: RECORD_LIST_LOADED, result: {records: [sampleRecord], searchOptions: {catalogURL: "test"}}});
        expect(state.hasOwnProperty('result')).toBe(true);
        expect(state.hasOwnProperty('searchOptions')).toBe(true);
    });

    it('handles layers error', () => {
        const state = catalog({}, {type: ADD_LAYER_ERROR, error: 'myerror'});
        expect(state.layerError).toBe('myerror');
    });
    it('RESET_CATALOG', () => {
        const state = catalog({}, {type: RESET_CATALOG});
        expect(state.result).toBe(null);
        expect(state.loadingError).toBe(null);
        expect(state.searchOptions).toBe(null);
    });
    it('RECORD_LIST_LOAD_ERROR', () => {
        const error = "some error thrown";
        const state = catalog({}, {type: RECORD_LIST_LOAD_ERROR, error});
        expect(state.result).toBe(null);
        expect(state.loadingError).toBe(error);
        expect(state.searchOptions).toBe(null);
    });
    it('FOCUS_SERVICES_LIST', () => {
        let status = true;
        const state = catalog({}, {type: FOCUS_SERVICES_LIST, status});
        expect(state.openCatalogServiceList).toBe(status);
    });
    it('CHANGE_NEW_TITLE', () => {
        const state = catalog({}, {type: CHANGE_NEW_TITLE, title});
        expect(state.newService.title).toBe(title);
    });
    it('CHANGE_NEW_TYPE', () => {
        let newType = "some type";
        const state = catalog({}, {type: CHANGE_NEW_TYPE, newType});
        expect(state.newService.type).toBe(newType);
    });
    it('CHANGE_NEW_URL', () => {
        const state = catalog({}, {type: CHANGE_NEW_URL, url});
        expect(state.newService.url).toBe(url);
    });
    it('CHANGE_CATALOG_FORMAT', () => {
        const format = "wms";
        const state = catalog({}, {type: CHANGE_CATALOG_FORMAT, format});
        expect(state.result).toBe(null);
        expect(state.loadingError).toBe(null);
        expect(state.layerError).toBe(null);
        expect(state.format).toBe(format);
    });
    it('CHANGE_SELECTED_SERVICE', () => {
        const serviceName = "wms";
        const state = catalog({}, {type: CHANGE_SELECTED_SERVICE, service: serviceName});
        expect(state.result).toBe(null);
        expect(state.loadingError).toBe(null);
        expect(state.layerError).toBe(null);
        expect(state.selectedService).toBe(serviceName);
    });
    it('ADD_CATALOG_SERVICE', () => {
        const state = catalog({}, {type: ADD_CATALOG_SERVICE, service});
        expect(state.result).toBe(null);
        expect(state.loadingError).toBe(null);
        expect(state.layerError).toBe(null);
        expect(state.selectedService).toBe(title);

        const state2 = catalog({services: {
            [title]: service
        }}, {type: ADD_CATALOG_SERVICE, service: serviceNew});
        expect(Object.keys(state2.services).length).toBe(2);
        service.title = "modified";
        const state3 = catalog(state2, {type: ADD_CATALOG_SERVICE, service});
        expect(Object.keys(state3.services).length).toBe(2);
        expect(state3.services.modified.title).toBe("modified");
    });
    it('default reducer ', () => {
        const state = catalog({mode: "edit"}, {type: "default"});
        expect(state.mode).toBe("edit");
    });
    it('CHANGE_CATALOG_MODE', () => {
        const mode = "edit";
        let isNew = true;
        const state = catalog({}, {type: CHANGE_CATALOG_MODE, mode, isNew});
        expect(state.result).toBe(null);
        expect(state.loadingError).toBe(null);
        expect(state.layerError).toBe(null);
        expect(state.mode).toBe(mode);
        expect(state.newService.type).toBe(emptyService.type);
        expect(state.newService.title).toBe(emptyService.title);
        expect(state.newService.url).toBe(emptyService.url);
        isNew = false;
        const state2 = catalog({selectedService: "serv", services: {
            "serv": {
                title: "tit"
            }
        }}, {type: CHANGE_CATALOG_MODE, mode, isNew});
        expect(state2.newService.title).toBe("tit");
    });
});
