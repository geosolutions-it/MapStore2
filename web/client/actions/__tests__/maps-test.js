/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
const assign = require('object-assign');
const {
    toggleDetailsSheet, TOGGLE_DETAILS_SHEET,
    toggleGroupProperties, TOGGLE_GROUP_PROPERTIES,
    toggleUnsavedChanges, TOGGLE_UNSAVED_CHANGES,
    deleteMap, DELETE_MAP,
    updateDetails, UPDATE_DETAILS,
    saveDetails, SAVE_DETAILS,
    deleteDetails, DELETE_DETAILS,
    setDetailsChanged, SET_DETAILS_CHANGED,
    saveResourceDetails, SAVE_RESOURCE_DETAILS,
    backDetails, BACK_DETAILS,
    undoDetails, UNDO_DETAILS,
    doNothing, DO_NOTHING,
    setUnsavedChanged, SET_UNSAVED_CHANGES,
    openDetailsPanel, OPEN_DETAILS_PANEL,
    closeDetailsPanel, CLOSE_DETAILS_PANEL,
    MAP_UPDATING, mapUpdating,
    DETAILS_LOADED, detailsLoaded,
    PERMISSIONS_UPDATED, permissionsUpdated,
    ATTRIBUTE_UPDATED, attributeUpdated,
    SAVE_MAP, saveMap,
    DISPLAY_METADATA_EDIT, onDisplayMetadataEdit,
    RESET_UPDATING, resetUpdating,
    THUMBNAIL_ERROR, thumbnailError,
    TOGGLE_DETAILS_EDITABILITY, toggleDetailsEditability,
    MAPS_SEARCH_TEXT_CHANGED, mapsSearchTextChanged,
    MAPS_LIST_LOAD_ERROR, loadError,
    MAP_ERROR, mapError, updatePermissions,
    MAP_METADATA_UPDATED, mapMetadataUpdated,
    METADATA_CHANGED, metadataChanged,
    setShowMapDetails, SHOW_DETAILS,
    updateAttribute, saveAll,
    SAVE_MAP_RESOURCE, saveMapResource
} = require('../maps');

let GeoStoreDAO = require('../../api/GeoStoreDAO');
let oldAddBaseUri = GeoStoreDAO.addBaseUrl;

describe('Test correctness of the maps actions', () => {
    beforeEach(() => {
        GeoStoreDAO.addBaseUrl = (options) => {
            return assign(options, {baseURL: 'base/web/client/test-resources/geostore/'});
        };
    });
    afterEach(() => {
        GeoStoreDAO.addBaseUrl = oldAddBaseUri;
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
    it('saveAll - with metadataMap, without thumbnail', (done) => {
        const resourceId = 1;
        // saveAll(map, metadataMap, nameThumbnail, dataThumbnail, categoryThumbnail, resourceIdMap, options)
        const retFun = saveAll({}, {name: "name"}, null, null, null, resourceId, {});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            switch (count) {
                case 0: expect(action.type).toBe(MAP_UPDATING); break;
                case 1: expect(action.type).toBe("NONE"); break;
                default: done();
            }
            count++;
        }, () => {});
    });
    it('saveAll - without metadataMap, without thumbnail', (done) => {
        const resourceId = 1;
        // saveAll(map, metadataMap, nameThumbnail, dataThumbnail, categoryThumbnail, resourceIdMap, options)
        const retFun = saveAll({}, null, null, null, null, resourceId, {});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            switch (count) {
            case 0: expect(action.type).toBe(MAP_UPDATING); break;
            case 1: expect(action.type).toBe("NONE"); break;
            default: done();
            }
            count++;
        }, () => {});
    });
    it('saveAll - without metadataMap, without thumbnail, detailsChanged', (done) => {
        const resourceId = 1;
        // saveAll(map, metadataMap, nameThumbnail, dataThumbnail, categoryThumbnail, resourceIdMap, options)
        const retFun = saveAll({}, null, null, null, null, resourceId, {});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            switch (count) {
            case 0: expect(action.type).toBe(MAP_UPDATING); break;
            case 1: expect(action.type).toBe("NONE"); break;
            case 2: expect(action.type).toBe(SAVE_RESOURCE_DETAILS); done(); break;
            default: done();
            }
            count++;
        }, () => ({currentMap: {
            detailsChanged: true
        }}
        ));
    });
    it('updatePermissions with securityRules list & without', (done) => {
        const securityRules = {
            SecurityRuleList: {
                RuleCount: 1,
                SecurityRule: [{
                    canRead: true,
                    canWrite: true,
                    user: {
                        id: 1
                    }
                }]
            }
        };
        const resourceId = 1;
        const retFun = updatePermissions(resourceId, securityRules);
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            switch (count) {
                // TODO: this should return PERMISSIONS_UPDATED
            case 0: expect(action.type).toBe(PERMISSIONS_UPDATED); break;
            default: done();
            }
            count++;
            done();
        });
        const retFun2 = updatePermissions(-1, securityRules);
        expect(retFun).toExist();
        let count2 = 0;
        retFun2((action) => {
            switch (count2) {
            case 0: expect(action.type).toBe(THUMBNAIL_ERROR); break;
            default: done();
            }
            count2++;
            done();
        });
    });
    it('mapUpdating', () => {
        let resourceId = 13;
        var retval = mapUpdating(resourceId);
        expect(retval).toExist();
        expect(retval.type).toBe(MAP_UPDATING);
        expect(retval.resourceId).toBe(resourceId);
    });

    it('permissionsUpdated', () => {
        let resourceId = 13;
        var retval = permissionsUpdated(resourceId, null);
        expect(retval).toExist();
        expect(retval.type).toBe(PERMISSIONS_UPDATED);
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

    it('resetUpdating', () => {
        let resourceId = 1;
        let retval = resetUpdating(resourceId);
        expect(retval).toExist();
        expect(retval.type).toBe(RESET_UPDATING);
        expect(retval.resourceId).toBe(resourceId);
    });

    it('onDisplayMetadataEdit', () => {
        let dispMetadataValue = true;
        let retval = onDisplayMetadataEdit(dispMetadataValue);
        expect(retval).toExist();
        expect(retval.type).toBe(DISPLAY_METADATA_EDIT);
        expect(retval.displayMetadataEditValue).toBe(dispMetadataValue);
    });

    it('saveMap', () => {
        let thumbnail = "myThumnbnailUrl";
        let resourceId = 13;
        let map = {
            thumbnail: thumbnail,
            id: 123,
            canWrite: true
        };
        var retval = saveMap(map, resourceId);
        expect(retval).toExist();
        expect(retval.type).toBe(SAVE_MAP);
        expect(retval.resourceId).toBe(resourceId);
        expect(retval.map).toBe(map);
    });

    it('mapsSearchTextChanged', () => {
        const a = mapsSearchTextChanged("TEXT");
        expect(a.type).toBe(MAPS_SEARCH_TEXT_CHANGED);
        expect(a.text).toBe("TEXT");
    });
    it('toggleDetailsEditability', () => {
        const a = toggleDetailsEditability();
        expect(a.type).toBe(TOGGLE_DETAILS_EDITABILITY);
    });
    it('loadError', () => {
        const a = loadError();
        expect(a.type).toBe(MAPS_LIST_LOAD_ERROR);
    });
    it('mapError', () => {
        const a = mapError("error");
        expect(a.type).toBe(MAP_ERROR);
        expect(a.error).toBe("error");
    });
    it('mapMetadataUpdated', () => {
        const a = mapMetadataUpdated("resourceId", "newName", "newDescription", "result", "error");
        expect(a.type).toBe(MAP_METADATA_UPDATED);
        expect(a.resourceId).toBe("resourceId");
        expect(a.newName).toBe("newName");
        expect(a.newDescription).toBe("newDescription");
        expect(a.result).toBe("result");
        expect(a.error).toBe("error");
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

    it('toggleDetailsSheet', () => {
        const detailsSheetReadOnly = true;
        const a = toggleDetailsSheet(detailsSheetReadOnly);
        expect(a.type).toBe(TOGGLE_DETAILS_SHEET);
        expect(a.detailsSheetReadOnly).toBeTruthy();

    });
    it('setShowMapDetails', () => {
        const showMapDetails = true;
        const action = setShowMapDetails(showMapDetails);
        expect(action.type).toBe(SHOW_DETAILS);
        expect(action.showMapDetails).toBe(showMapDetails);

    });
    it('toggleGroupProperties', () => {
        const a = toggleGroupProperties();
        expect(a.type).toBe(TOGGLE_GROUP_PROPERTIES);
    });
    it('toggleUnsavedChanges', () => {
        const a = toggleUnsavedChanges();
        expect(a.type).toBe(TOGGLE_UNSAVED_CHANGES);
    });
    it('updateDetails', () => {
        const detailsText = "<p>some value</p>";
        const originalDetails = "<p>old value</p>";
        const doBackup = true;
        const a = updateDetails(detailsText, doBackup, originalDetails);
        expect(a.doBackup).toBeTruthy();
        expect(a.detailsText).toBe(detailsText);
        expect(a.originalDetails).toBe(originalDetails);
        expect(a.type).toBe(UPDATE_DETAILS);
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
    it('saveDetails', () => {
        const detailsText = "<p>some detailsText</p>";
        const a = saveDetails(detailsText);
        expect(a.type).toBe(SAVE_DETAILS);
        expect(a.detailsText).toBe(detailsText);
    });
    it('deleteDetails', () => {
        const a = deleteDetails();
        expect(a.type).toBe(DELETE_DETAILS);
    });
    it('setDetailsChanged', () => {
        const detailsChanged = true;
        const a = setDetailsChanged(detailsChanged);
        expect(a.type).toBe(SET_DETAILS_CHANGED);
        expect(a.detailsChanged).toBe(detailsChanged);
    });
    it('backDetails', () => {
        const backupDetails = true;
        const a = backDetails(backupDetails);
        expect(a.type).toBe(BACK_DETAILS);
        expect(a.backupDetails).toBe(backupDetails);
    });
    it('undoDetails', () => {
        const a = undoDetails();
        expect(a.type).toBe(UNDO_DETAILS);
    });
    it('setUnsavedChanged', () => {
        const value = true;
        const a = setUnsavedChanged(value);
        expect(a.type).toBe(SET_UNSAVED_CHANGES);
        expect(a.value).toBe(value);
    });
    it('openDetailsPanel', () => {
        const a = openDetailsPanel();
        expect(a.type).toBe(OPEN_DETAILS_PANEL);
    });
    it('closeDetailsPanel', () => {
        const a = closeDetailsPanel();
        expect(a.type).toBe(CLOSE_DETAILS_PANEL);
    });
    it('doNothing', () => {
        const a = doNothing();
        expect(a.type).toBe(DO_NOTHING);
    });
    it('saveResourceDetails', () => {
        const a = saveResourceDetails();
        expect(a.type).toBe(SAVE_RESOURCE_DETAILS);
    });
    it('detailsLoaded', () => {
        const mapId = 1;
        const detailsUri = "sada/da/";
        const a = detailsLoaded(mapId, detailsUri);
        expect(a.type).toBe(DETAILS_LOADED);
        expect(a.detailsUri).toBe(detailsUri);
        expect(a.mapId).toBe(mapId);
    });
    it('saveMapResource', () => {
        const resource = {};
        const a = saveMapResource(resource);
        expect(a.type).toBe(SAVE_MAP_RESOURCE);
        expect(a.resource).toBe(resource);
    });

});
