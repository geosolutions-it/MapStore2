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
    USERMANAGER_EDIT_USER,
    USERMANAGER_EDIT_USER_DATA,
    USERMANAGER_UPDATE_USER,
    USERMANAGER_DELETE_USER,
    USERMANAGER_GETGROUPS,
    UPDATE_USERS,
    UPDATE_USERS_METADATA,
    SEARCH_USERS,
    RESET_SEARCH_USERS,
    LOADING_USERS
} from '../actions/users';

import { UPDATEGROUP, STATUS_CREATED, DELETEGROUP, STATUS_DELETED } from '../actions/usergroups';

function users(state = {}, action) {
    switch (action.type) {
    case UPDATE_USERS: {
        return {
            ...state,
            grid: {
                ...state?.grid,
                isFirstRequest: false,
                users: action.users
            }
        };
    }
    case UPDATE_USERS_METADATA: {
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
    case LOADING_USERS: {
        return {
            ...state,
            grid: {
                ...state?.grid,
                loading: action.loading,
                ...(action.loading && { error: false })
            }
        };
    }
    case SEARCH_USERS:
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
    case RESET_SEARCH_USERS:
        return {
            ...state,
            grid: {
                ...state?.grid,
                search: null
            }
        };
    case USERMANAGER_EDIT_USER: {
        let newUser = action.status ? {
            status: action.status,
            ...action.user
        } : action.user;
        if (state.currentUser && action.user && state.currentUser.id === action.user.id ) {
            return Object.assign({}, state, {
                currentUser: Object.assign({}, state.currentUser, {
                    status: action.status,
                    ...action.user
                })}
            );
            // this to catch user loaded but window already closed
        } else if (action.status === "loading" || action.status === "new" || !action.status) {
            return Object.assign({}, state, {
                currentUser: newUser
            });
        }
        return state;

    }
    case USERMANAGER_EDIT_USER_DATA: {
        let k = action.key;
        let currentUser = state.currentUser;
        currentUser = Object.assign({}, currentUser, {[k]: action.newValue} );
        return Object.assign({}, state, {
            currentUser: Object.assign({}, {...currentUser, status: "modified"})
        });
    }
    case USERMANAGER_UPDATE_USER: {
        let currentUser = state.currentUser;

        return Object.assign({}, state, {
            currentUser: Object.assign({}, {
                ...currentUser,
                ...action.user,
                status: action.status,
                lastError: action.error
            })
        });
    }
    case USERMANAGER_DELETE_USER: {
        if (action.status === "deleted" || action.status === "cancelled") {
            return Object.assign({}, state, {
                deletingUser: null
            });
        }
        return Object.assign({}, state, {
            deletingUser: {
                id: action.id,
                status: action.status,
                error: action.error
            }
        });
    }
    case USERMANAGER_GETGROUPS: {
        return Object.assign({}, state, {
            groups: action.groups,
            groupsStatus: action.status,
            groupsError: action.error
        });
    }
    case UPDATEGROUP: {
        if (action.status === STATUS_CREATED) {
            return Object.assign({}, state, {
                groups: null,
                groupsStatus: null,
                groupsError: null
            });
        }
        return state;
    }
    case DELETEGROUP: {
        if (action.status === STATUS_DELETED) {
            return Object.assign({}, state, {
                groups: null,
                groupsStatus: null,
                groupsError: null
            });
        }
        return state;
    }
    default:
        return state;
    }
}
export default users;
