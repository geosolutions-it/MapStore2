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
const catalog = require('../catalog');
const {RECORD_LIST_LOADED, ADD_LAYER_ERROR, RESET_CATALOG, RECORD_LIST_LOAD_ERROR, CHANGE_CATALOG_FORMAT, CHANGE_CATALOG_MODE,
    FOCUS_SERVICES_LIST, CHANGE_TITLE, CHANGE_URL, CHANGE_TYPE, CHANGE_SELECTED_SERVICE, CHANGE_SERVICE_PROPERTY, DELETE_CATALOG_SERVICE, SAVING_SERVICE, CHANGE_METADATA_TEMPLATE, TOGGLE_THUMBNAIL, TOGGLE_TEMPLATE, TOGGLE_ADVANCED_SETTINGS, addCatalogService, changeText, changeServiceFormat, setLoading} = require('../../actions/catalog');
const {MAP_CONFIG_LOADED} = require('../../actions/config');
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
        expect(state.loading).toBe(false);
    });
    it('changes the loading status of catalog', () => {
        let state = catalog({}, setLoading(true));
        expect(state.loading).toBe(true);
        state = catalog({}, setLoading(false));
        expect(state.loading).toBe(false);
        // default
        state = catalog({}, setLoading());
        expect(state.loading).toBe(false);
    });
    it('handles layers error', () => {
        const state = catalog({}, {type: ADD_LAYER_ERROR, error: 'myerror'});
        expect(state.layerError).toBe('myerror');
    });
    it('MAP_CONFIG_LOADED', () => {
        const titleCustom = "savedService";
        const state = catalog({"default": {services: {
            [titleCustom]: {
                service
            }
        }, selectedService: {}}}, {type: MAP_CONFIG_LOADED, config: {catalogServices: {services: {[titleCustom]: {title: titleCustom}}, selectedService: titleCustom}}});
        expect(state.selectedService).toBe(titleCustom);
        expect(state.services[titleCustom].title).toBe(titleCustom);
    });
    it('DELETE_CATALOG_SERVICE', () => {
        const titleCustom = "savedService";
        const state = catalog({services: {
            [titleCustom]: {
                title: titleCustom
            }},
        selectedService: titleCustom
        }, {type: DELETE_CATALOG_SERVICE, service: titleCustom});
        expect(state.selectedService).toBe("");
    });
    it('RESET_CATALOG', () => {
        const state = catalog({}, {type: RESET_CATALOG});
        expect(state.result).toBe(null);
        expect(state.loadingError).toBe(null);
        expect(state.searchOptions).toBe(null);
    });
    it('CHANGE_SERVICE_PROPERTY', () => {
        let autoload = true;
        const state = catalog({newService: {}}, {type: CHANGE_SERVICE_PROPERTY, property: "autoload", value: true});
        expect(state.newService.autoload).toBe(autoload);
    });
    it('SAVING_SERVICE', () => {
        let saving = true;
        const state = catalog({saving: false}, {type: SAVING_SERVICE, status: saving});
        expect(state.saving).toBe(saving);
    });
    it('RECORD_LIST_LOAD_ERROR', () => {
        const error = "some error thrown";
        const state = catalog({}, {type: RECORD_LIST_LOAD_ERROR, error});
        expect(state.result).toBe(null);
        expect(state.loadingError).toBe(error);
        expect(state.loading).toBe(false);
        expect(state.searchOptions).toBe(null);
    });
    it('FOCUS_SERVICES_LIST', () => {
        let status = true;
        const state = catalog({}, {type: FOCUS_SERVICES_LIST, status});
        expect(state.openCatalogServiceList).toBe(status);
    });
    it('CHANGE_TITLE', () => {
        const state = catalog({}, {type: CHANGE_TITLE, title});
        expect(state.newService.title).toBe(title);
    });
    it('CHANGE_TYPE to wms', () => {
        let newType = "wms";
        const state = catalog({}, {type: CHANGE_TYPE, newType});
        expect(state.newService.type).toBe(newType);
    });
    it('CHANGE_TYPE from csw to wms', () => {
        const state = catalog({
            newService: {
                type: "csw",
                showTemplate: true,
                metadataTemplate: "{description}"
            }
        }, {type: CHANGE_TYPE, newType: "wms"});
        expect(state.newService.type).toBe("wms");
        expect(state.newService.showTemplate).toBe(false);
        expect(state.newService.metadataTemplate).toBe("");
    });
    it('CHANGE_TYPE from to wms to csw', () => {
        const state = catalog(
            {
                newService: {
                    type: "wms"
                }
            }, {type: CHANGE_TYPE, newType: "csw"});
        expect(state.newService.type).toBe("csw");
        expect(state.newService.showTemplate).toEqual(undefined);
        expect(state.newService.metadataTemplate).toEqual(undefined);
    });
    it('CHANGE_TEXT', () => {
        let val = "text";
        const state = catalog({}, changeText(val));
        expect(state.searchOptions.text).toBe(val);
    });
    it('CHANGE_URL', () => {
        const state = catalog({}, {type: CHANGE_URL, url});
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
    it('CHANGE_SERVICE_FORMAT', () => {
        const format = "image/jpeg";
        const state = catalog({}, changeServiceFormat(format));
        expect(state.newService).toExist();
        expect(state.newService.format).toBe(format);
    });
    it('CHANGE_SELECTED_SERVICE', () => {
        const serviceName = "wms";
        const state = catalog({}, {type: CHANGE_SELECTED_SERVICE, service: serviceName});
        expect(state.result).toBe(null);
        expect(state.loadingError).toBe(null);
        expect(state.layerError).toBe(null);
        expect(state.selectedService).toBe(serviceName);
        const state2 = catalog({selectedService: serviceName}, {type: CHANGE_SELECTED_SERVICE, service: serviceName});
        expect(state2.selectedService).toBe(serviceName);
    });
    it('addCatalogService', () => {
        const state = catalog({ selectedService: "X"}, addCatalogService({service}));
        expect(state.result).toBe(null);
        expect(state.loadingError).toBe(null);
        expect(state.layerError).toBe(null);
        expect(state.selectedService).toBe(Object.keys(state.services)[0]);

        const state2 = catalog({services: {
            [title]: service
        }
        }, addCatalogService(serviceNew));
        expect(Object.keys(state2.services).length).toBe(2);
        expect(Object.keys(state2.services)[1]).toBe(state2.selectedService);
        service.title = "modified";
    });
    it('default reducer ', () => {
        const state = catalog({mode: "edit"}, {type: "default"});
        expect(state.mode).toBe("edit");
    });
    // it should return an empty service as a new service
    it('CHANGE_CATALOG_MODE with no configured services, new service', () => {
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
        expect(state.newService.showAdvancedSettings).toBe(false);
        expect(state.newService.showTemplate).toBe(false);
        expect(state.newService.hideThumbnail).toBe(false);
        expect(state.newService.metadataTemplate).toBe("<p>${description}</p>");

        isNew = false;
        const state2 = catalog({selectedService: "serv", services: {
            "serv": {
                title: "tit"
            }
        }}, {type: CHANGE_CATALOG_MODE, mode, isNew});
        expect(state2.newService.title).toBe("tit");
    });
    it('CHANGE_CATALOG_MODE with no configured services, not new', () => {
        const mode = "edit";
        let isNew = false;
        const state = catalog({}, {type: CHANGE_CATALOG_MODE, mode, isNew});
        expect(state.result).toBe(null);
        expect(state.loadingError).toBe(null);
        expect(state.layerError).toBe(null);
        expect(state.mode).toBe(mode);
        expect(state.newService.oldService).toBe('');
        expect(state.newService.type).toBe(undefined);
        expect(state.newService.title).toBe(undefined);
        expect(state.newService.url).toBe(undefined);
        isNew = false;
        const state2 = catalog({selectedService: "serv", services: {
            "serv": {
                title: "tit"
            }
        }}, {type: CHANGE_CATALOG_MODE, mode, isNew});
        expect(state2.newService.title).toBe("tit");
    });
    it('TOGGLE_THUMBNAIL ', () => {
        const state = catalog({
            newService: {}
        }, {type: TOGGLE_THUMBNAIL});
        expect(state.newService.hideThumbnail).toBe(true);
        const state2 = catalog({
            newService: {hideThumbnail: true}
        }, {type: TOGGLE_THUMBNAIL});
        expect(state2.newService.hideThumbnail).toBe(false);
    });
    it('TOGGLE_TEMPLATE toggling on the template', () => {
        const state = catalog({
            newService: {showTemplate: false}
        }, {type: TOGGLE_TEMPLATE});
        expect(state.newService.metadataTemplate).toBe("<p>${description}</p>");
        expect(state.newService.showTemplate).toBe(true);
    });
    it('TOGGLE_TEMPLATE toggling off the template ', () => {
        const state = catalog({
            newService: {showTemplate: true, metadataTemplate: "<p>${descriptionTest}</p>"}
        }, {type: TOGGLE_TEMPLATE});
        expect(state.newService.showTemplate).toBe(false);
        expect(state.newService.metadataTemplate).toBe("<p>${descriptionTest}</p>");

    });
    it('TOGGLE_ADVANCED_SETTINGS ', () => {
        const state = catalog({
            newService: {}
        }, {type: TOGGLE_ADVANCED_SETTINGS});
        expect(state.newService.showAdvancedSettings).toBe(true);
        const state2 = catalog({
            newService: {showAdvancedSettings: true}
        }, {type: TOGGLE_ADVANCED_SETTINGS});
        expect(state2.newService.showAdvancedSettings).toBe(false);
    });
    it('CHANGE_METADATA_TEMPLATE ', () => {
        const state = catalog({
            newService: {}
        }, {type: CHANGE_METADATA_TEMPLATE, metadataTemplate: ""});
        expect(state.newService.metadataTemplate).toBe("");
    });
});
