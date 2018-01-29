/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {
    EDIT_MAP, editMap,
    UPDATE_CURRENT_MAP, updateCurrentMap,
    ERROR_CURRENT_MAP, errorCurrentMap,
    REMOVE_THUMBNAIL, removeThumbnail,
    UPDATE_CURRENT_MAP_PERMISSIONS, updateCurrentMapPermissions,
    UPDATE_CURRENT_MAP_GROUPS, updateCurrentMapGroups,
    RESET_CURRENT_MAP, resetCurrentMap,
    ADD_CURRENT_MAP_PERMISSION, addCurrentMapPermission
} = require('../currentMap');


describe('Test correctness of the maps actions', () => {

    it('editMap', () => {
        let thumbnail = "myThumnbnailUrl";
        let map = {
            thumbnail: thumbnail,
            id: 123,
            canWrite: true
        };
        var retval = editMap(map);
        expect(retval).toExist();
        expect(retval.type).toBe(EDIT_MAP);
        expect(retval.map.thumbnail).toBe(thumbnail);
        expect(retval.map.id).toBe(123);
        expect(retval.map.canWrite).toBeTruthy();
    });

    it('updateCurrentMap', () => {
        let thumbnailData = [];
        let thumbnail = "myThumnbnailUrl";
        var retval = updateCurrentMap(thumbnailData, thumbnail);
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_CURRENT_MAP);
        expect(retval.thumbnail).toBe(thumbnail);
        expect(retval.thumbnailData).toBe(thumbnailData);
    });
    it('updateCurrentMapGroups', () => {
        let groups = {
            groups: {
                group: {
                    enabled: true,
                    groupName: 'everyone',
                    id: 3
                }
            }
        };
        var retval = updateCurrentMapGroups(groups);
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_CURRENT_MAP_GROUPS);
        expect(retval.groups).toBe(groups);
    });

    it('errorCurrentMap', () => {
        let errors = ["FORMAT"];
        var retval = errorCurrentMap(errors);
        expect(retval).toExist();
        expect(retval.type).toBe(ERROR_CURRENT_MAP);
        expect(retval.errors).toBe(errors);
    });
    it('updateCurrentMapPermissions', () => {
        let permissions = {
            SecurityRuleList: {
                SecurityRule: {
                    canRead: true,
                    canWrite: true,
                    user: {
                        id: 6,
                        name: 'admin'
                    }
                }
            }
        };
        const retval = updateCurrentMapPermissions(permissions);
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_CURRENT_MAP_PERMISSIONS);
        expect(retval.permissions).toBe(permissions);
    });
    it('removeThumbnail', () => {
        let resourceId = 1;
        const retval = removeThumbnail(resourceId);
        expect(retval).toExist();
        expect(retval.type).toBe(REMOVE_THUMBNAIL);
        expect(retval.resourceId).toBe(resourceId);
    });
    it('resetCurrentMap', () => {
        const retval = resetCurrentMap();
        expect(retval).toExist();
        expect(retval.type).toBe(RESET_CURRENT_MAP);
    });
    it('addCurrentMapPermission', () => {
        const rule = {
            canRead: true,
            canWrite: true,
            user: {
                id: 6,
                name: 'admin'
            }
        };
        const retval = addCurrentMapPermission(rule);
        expect(retval).toExist();
        expect(retval.type).toBe(ADD_CURRENT_MAP_PERMISSION);
    });

});
