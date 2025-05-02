/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isNil from 'lodash/isNil';
import uuid from 'uuid/v1';
import {
    SEARCHUSERS,
    EDITGROUP,
    EDITGROUPDATA,
    DELETEGROUP,
    UPDATEGROUP,
    UPDATE_USER_GROUPS,
    UPDATE_USER_GROUPS_METADATA,
    LOADING_USER_GROUPS,
    SEARCH_USER_GROUPS,
    RESET_SEARCH_USER_GROUPS
} from '../actions/usergroups';

function usergroups(state = {}, action) {
    switch (action.type) {
    case UPDATE_USER_GROUPS: {
        return {
            ...state,
            grid: {
                ...state?.grid,
                isFirstRequest: false,
                userGroups: action.userGroups
            }
        };
    }
    case UPDATE_USER_GROUPS_METADATA: {
        return {
            ...state,
            grid: {
                ...state?.grid,
                total: action.metadata.total,
                isNextPageAvailable: action.metadata.isNextPageAvailable,
                error: action.metadata.error,
                ...(action.metadata.params &&
                    {
                        params: action.metadata.params,
                        previousParams: state?.grid?.params
                    }),
                ...(!isNil(action.metadata.locationSearch) &&
                    {
                        locationSearch: action.metadata.locationSearch
                    }),
                ...(!isNil(action.metadata.locationPathname) &&
                    {
                        locationPathname: action.metadata.locationPathname
                    })
            }
        };
    }
    case LOADING_USER_GROUPS: {
        return {
            ...state,
            grid: {
                ...state?.grid,
                loading: action.loading,
                ...(action.loading && { error: false })
            }
        };
    }
    case SEARCH_USER_GROUPS:
        return {
            ...state,
            grid: {
                ...state?.grid,
                search: {
                    id: uuid(),
                    params: action.params,
                    clear: action.clear,
                    refresh: action.refresh
                }
            }
        };
    case RESET_SEARCH_USER_GROUPS:
        return {
            ...state,
            grid: {
                ...state?.grid,
                search: null
            }
        };
    case EDITGROUP: {
        let newGroup = action.status ? {
            status: action.status,
            ...action.group
        } : action.group;
        if (state.currentGroup && action.group && state.currentGroup.id === action.group.id ) {
            return Object.assign({}, state, {
                currentGroup: Object.assign({}, state.currentGroup, {
                    status: action.status,
                    ...action.group
                })}
            );
            // this to catch user loaded but window already closed
        } else if (action.status === "loading" || action.status === "new" || !action.status) {
            return Object.assign({}, state, {
                currentGroup: newGroup
            });
        }
        return state;

    }
    case EDITGROUPDATA: {
        let k = action.key;
        let currentGroup = state.currentGroup;
        currentGroup = Object.assign({}, currentGroup, {[k]: action.newValue} );
        return Object.assign({}, state, {
            currentGroup: Object.assign({}, {...currentGroup, status: "modified"})
        });
    }
    case UPDATEGROUP: {
        let currentGroup = state.currentGroup;

        return Object.assign({}, state, {
            currentGroup: Object.assign({}, {
                ...currentGroup,
                ...action.group,
                status: action.status,
                lastError: action.error
            })
        });
    }

    case DELETEGROUP: {
        if (action.status === "deleted" || action.status === "cancelled") {
            return Object.assign({}, state, {
                deletingGroup: null
            });
        }
        return Object.assign({}, state, {
            deletingGroup: {
                id: action.id,
                status: action.status,
                error: action.error
            }
        });
    }
    case SEARCHUSERS: {
        switch (action.status) {
        case "loading": {
            return Object.assign({}, state, {
                availableUsersError: null,
                availableUsersLoading: true
            });
        }
        case "success": {
            return Object.assign({}, state, {
                availableUsersError: null,
                availableUsersLoading: false,
                availableUsers: action.users,
                availableUsersCount: action.count
            });
        }
        case "error": {
            return Object.assign({}, state, {
                availableUsersError: action.error,
                availableUsersLoading: false
            });
        }
        default:
            return state;
        }
    }
    default:
        return state;
    }
}
export default usergroups;
