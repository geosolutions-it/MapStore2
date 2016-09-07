/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const EDIT_MAP = 'EDIT_MAP';
const UPDATE_CURRENT_MAP = 'UPDATE_CURRENT_MAP';
const ERROR_CURRENT_MAP = 'ERROR_CURRENT_MAP';
const REMOVE_THUMBNAIL = 'REMOVE_THUMBNAIL';

function editMap(map) {
    return {
        type: EDIT_MAP,
        map
    };
}

// update the thumbnail and the files property of the currentMap
function updateCurrentMap(files, thumbnail) {
    return {
        type: UPDATE_CURRENT_MAP,
        thumbnail,
        files
    };
}

function errorCurrentMap(errors, resourceId) {
    return {
        type: ERROR_CURRENT_MAP,
        errors,
        resourceId
    };
}


function removeThumbnail(resourceId) {
    return {
        type: REMOVE_THUMBNAIL,
        resourceId
    };
}

module.exports = {
    EDIT_MAP, editMap,
    UPDATE_CURRENT_MAP, updateCurrentMap,
    ERROR_CURRENT_MAP, errorCurrentMap,
    REMOVE_THUMBNAIL, removeThumbnail
};
