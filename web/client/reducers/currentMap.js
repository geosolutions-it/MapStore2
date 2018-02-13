/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

// const {isNil} = require('lodash');
const {
    EDIT_MAP,
    UPDATE_CURRENT_MAP,
    ERROR_CURRENT_MAP,
    UPDATE_CURRENT_MAP_PERMISSIONS,
    UPDATE_CURRENT_MAP_GROUPS,
    RESET_CURRENT_MAP,
    ADD_CURRENT_MAP_PERMISSION
} = require('../actions/currentMap');

const {
    THUMBNAIL_ERROR,
    MAP_UPDATING,
    SAVE_MAP,
    DISPLAY_METADATA_EDIT,
    RESET_UPDATING,
    MAP_ERROR,
    MAP_CREATED,
    PERMISSIONS_LIST_LOADING,
    PERMISSIONS_LIST_LOADED,
    TOGGLE_DETAILS_SHEET,
    UPDATE_DETAILS,
    SAVE_DETAILS,
    DELETE_DETAILS,
    BACK_DETAILS,
    UNDO_DETAILS,
    TOGGLE_GROUP_PROPERTIES,
    TOGGLE_UNSAVED_CHANGES,
    SET_DETAILS_CHANGED,
    SET_UNSAVED_CHANGES,
    METADATA_CHANGED,
    DETAILS_SAVING,
    TOGGLE_DETAILS_EDITABILITY
} = require('../actions/maps');

const assign = require('object-assign');
const {isArray} = require('lodash');

function currentMap(state = {}, action) {
    switch (action.type) {
    case EDIT_MAP: {
        return assign({}, state, action.map, {
            newThumbnail: action.map && action.map.thumbnail ? action.map.thumbnail : null,
            displayMetadataEdit: action.openModalProperties,
            thumbnailError: null,
            errors: [],
            metadata: {
                name: action.map.name,
                description: action.map.description
            },
            hideGroupProperties: false,
            detailsSheetReadOnly: true });
    }
    case TOGGLE_DETAILS_EDITABILITY: {
        return assign({}, state, {
            editDetailsDisabled: !state.editDetailsDisabled
        });
    }
    case UPDATE_CURRENT_MAP: {
        return assign({}, state, {
            newThumbnail: action.thumbnail,
            thumbnailData: action.thumbnailData,
            unsavedChanges: true
        });
    }
    case MAP_UPDATING: {
        return assign({}, state, {updating: true});
    }
    case UPDATE_CURRENT_MAP_PERMISSIONS: {
            // Fix to overcome GeoStore bad encoding of single object arrays
        let fixedSecurityRule = [];
        if (action.permissions && action.permissions.SecurityRuleList && action.permissions.SecurityRuleList.SecurityRule) {
            if ( isArray(action.permissions.SecurityRuleList.SecurityRule)) {
                fixedSecurityRule = action.permissions.SecurityRuleList.SecurityRule;
            } else {
                fixedSecurityRule.push(action.permissions.SecurityRuleList.SecurityRule);
            }
        }
        return assign({}, state, {permissions: {
            SecurityRuleList: {
                SecurityRule: fixedSecurityRule
            }
        }});
    }
    case UPDATE_CURRENT_MAP_GROUPS: {
        return assign({}, state, {availableGroups: action.groups});
    }
    case ADD_CURRENT_MAP_PERMISSION: {
        let newPermissions = {
            SecurityRuleList: {
                SecurityRule: state.permissions && state.permissions.SecurityRuleList && state.permissions.SecurityRuleList.SecurityRule ? state.permissions.SecurityRuleList.SecurityRule.slice() : []
            }
        };
        if (action.rule) {
            newPermissions.SecurityRuleList.SecurityRule.push(action.rule);
        }
        return assign({}, state, { permissions: newPermissions });
    }
    case ERROR_CURRENT_MAP: {
        return assign({}, state, {thumbnailError: null, mapError: null, errors: action.errors});
    }
    case THUMBNAIL_ERROR: {
        return assign({}, state, {thumbnailError: action.error, errors: [], updating: false});
    }
    case MAP_ERROR: {
        return assign({}, state, {mapError: action.error, errors: [], updating: false});
    }
    case SAVE_MAP: {
        return assign({}, state, {thumbnailError: null});
    }
    case DISPLAY_METADATA_EDIT: {
        return assign({}, state, {displayMetadataEdit: action.displayMetadataEditValue});
    }
    case RESET_UPDATING: {
        return assign({}, state, {updating: false});
    }
    case MAP_CREATED: {
        return assign({}, state, {mapId: action.resourceId});
    }
    case PERMISSIONS_LIST_LOADING: {
        return assign({}, state, {permissionLoading: true});
    }
    case PERMISSIONS_LIST_LOADED: {
        return assign({}, state, {permissionLoading: false});
    }
    case RESET_CURRENT_MAP: {
        return {};
    }
    case TOGGLE_DETAILS_SHEET: {
        return assign({}, state, {
            showDetailEditor: !state.showDetailEditor,
            detailsBackup: !state.showDetailEditor && !state.detailsDeleted ? "" : state.detailsBackup,
            detailsSheetReadOnly: action.detailsSheetReadOnly
        });
    }
    case METADATA_CHANGED: {
        let prop = action.prop;
        return assign({}, state, {
            metadata: assign({}, state.metadata, {[action.prop]: action.value }),
            unsavedChanges:
                (prop === "name" ? action.value : state.metadata.name) !== state.name ||
                (prop === "description" ? action.value : state.metadata.description) !== state.description
        });
    }
    case UPDATE_DETAILS: {
        return assign({}, state, {
            detailsText: action.detailsText,
            originalDetails: action.originalDetails || state.originalDetails,
            detailsBackup: action.doBackup ? state.detailsText : state.detailsBackup
        });
    }
    case BACK_DETAILS: {
        return assign({}, state, {
            detailsText: state.detailsDeleted ? "" : action.backupDetails,
            detailsBackup: state.detailsDeleted ? state.detailsBackup : "",
            showDetailEditor: false
        });
    }
    case UNDO_DETAILS: {
        return assign({}, state, {
            detailsText: state.detailsBackup,
            detailsBackup: "",
            detailsDeleted: false
        });
    }
    case SAVE_DETAILS: {
        return action.detailsText.length <= 500000 ? assign({}, state, {
            detailsText: action.detailsText,
            detailsBackup: "",
            detailsDeleted: false
        }) : state;
    }
    case DETAILS_SAVING: {
        return assign({}, state, {
            saving: action.saving/*,
            unsavedChanges: action.saving === false ? true : state.unsavedChanges*/
        });
    }
    case DELETE_DETAILS: {
        return assign({}, state, {
            detailsText: "",
            detailsBackup: state.detailsText,
            detailsChanged: true,
            unsavedChanges: true,
            detailsDeleted: true
        });
    }
    case SET_UNSAVED_CHANGES: {
        return assign({}, state, {
            unsavedChanges: action.value
        });
    }
    case TOGGLE_GROUP_PROPERTIES: {
        return assign({}, state, {
            hideGroupProperties: !state.hideGroupProperties
        });
    }
    case TOGGLE_UNSAVED_CHANGES: {
        return assign({}, state, {
            showUnsavedChanges: !state.showUnsavedChanges
        });
    }
    case SET_DETAILS_CHANGED: {
        return assign({}, state, {
            unsavedChanges: action.detailsChanged ? action.detailsChanged : state.unsavedChanges,
            detailsChanged: action.detailsChanged
        });
    }
    default:
        return state;
    }
}

module.exports = currentMap;
