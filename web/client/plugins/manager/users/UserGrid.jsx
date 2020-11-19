/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from 'object-assign';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { deleteUser, editUser, getUsers } from '../../../actions/users';
import UserGrid from '../../../components/manager/users/UserGrid';
import PaginationToolbar from './UsersPaginationToolbar';

const mapStateToProps = (state) => {
    const users = state && state.users;
    return {
        users: users && users.users,
        loading: users && users.status === "loading",
        stateProps: users && users.stateProps,
        start: users && users.start,
        limit: users && users.limit,
        myUserId: state && state.security && state.security.user && state.security.user.id
    };
};
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        loadUsers: getUsers,
        onEdit: editUser,
        onDelete: deleteUser
    }, dispatch);
};
const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return assign({}, stateProps, dispatchProps, ownProps, {
        bottom: <PaginationToolbar />,
        loadUsers: () => {
            dispatchProps.loadUsers(stateProps && stateProps.searchText, {
                params: {
                    start: stateProps && stateProps.start || 0,
                    limit: stateProps && stateProps.limit || 12
                }
            });
        }
    });
};
export default connect(mapStateToProps, mapDispatchToProps, mergeProps, {pure: false})(UserGrid);
