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
    UPDATE_CURRENT_MAP_PERMISSIONS,
    UPDATE_CURRENT_MAP_GROUPS,
    RESET_CURRENT_MAP,
    ADD_CURRENT_MAP_PERMISSION
} = require('../actions/currentMap');

const {
    THUMBNAIL_ERROR,
    MAP_UPDATING,
    DISPLAY_METADATA_EDIT,
    RESET_UPDATING,
    MAP_ERROR,
    MAP_CREATED,
    PERMISSIONS_LIST_LOADING,
    SHOW_DETAILS_SHEET,
    HIDE_DETAILS_SHEET,
    UPDATE_DETAILS,
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
    case THUMBNAIL_ERROR: {
        return assign({}, state, {thumbnailError: action.error, errors: [], updating: false});
    }
    case MAP_ERROR: {
        return assign({}, state, {mapError: action.error, errors: [], updating: false});
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
    case RESET_CURRENT_MAP: {
        return {};
    }
    case SHOW_DETAILS_SHEET: {
        return {
            ...state,
            showDetailsSheet: true
        };
    }
    case HIDE_DETAILS_SHEET: {
        return {
            ...state,
            showDetailsSheet: false
        };
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
    case DETAILS_SAVING: {
        return assign({}, state, {
            saving: action.saving
        });
    }
    case SET_UNSAVED_CHANGES: {
        return assign({}, state, {
            unsavedChanges: action.value
        });
    }
    default:
        return state;
    }
}

module.exports = currentMap;
