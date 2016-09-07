/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {
    // CREATE_THUMBNAIL, createThumbnail,
    MAP_UPDATING, mapUpdating,
    PERMISSIONS_UPDATED, permissionsUpdated,
    ATTRIBUTE_UPDATED, attributeUpdated,
    SAVE_MAP, saveMap,
    DISPLAY_METADATA_EDIT, onDisplayMetadataEdit,
    RESET_UPDATING, resetUpdating,
    THUMBNAIL_ERROR, thumbnailError
} = require('../maps');

describe('Test correctness of the maps actions', () => {

    it('mapUpdating', () => {
        let resourceId = 13;
        var retval = mapUpdating(resourceId);
        expect(retval).toExist();
        expect(retval.type).toBe(MAP_UPDATING);
        expect(retval.resourceId).toBe(resourceId);
    });

    it('permissionsUpdated', () => {
        let resourceId = 13;
        let group = {groupName: "everyone", id: 3};
        let user = {name: "tt", id: 20};
        let userPermission = {
            canRead: true,
            canWrite: true
        };
        let groupPermission = {
            canRead: true,
            canWrite: false
        };
        var retval = permissionsUpdated(resourceId, groupPermission, group, userPermission, user, null);
        expect(retval).toExist();
        expect(retval.type).toBe(PERMISSIONS_UPDATED);
        expect(retval.resourceId).toBe(resourceId);
        expect(retval.groupPermission).toBe(groupPermission);
        expect(retval.group).toBe(group);
        expect(retval.userPermission).toBe(userPermission);
        expect(retval.user).toBe(user);
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
});
