import PropTypes from 'prop-types';

/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { connect } from 'react-redux';
import { deleteUser } from '../../../actions/users';
import { Alert } from 'react-bootstrap';
import Confirm from '../../../components/layout/ConfirmDialog';
import UserCard from '../../../components/manager/users/UserCard';
import Message from '../../../components/I18N/Message';
import { findIndex } from 'lodash';

class UserDeleteConfirm extends React.Component {
    static propTypes = {
        user: PropTypes.object,
        deleteUser: PropTypes.func,
        deleteId: PropTypes.number,
        deleteError: PropTypes.object,
        deleteStatus: PropTypes.string

    };

    static defaultProps = {
        deleteUser: () => {}
    };

    renderError = () => {
        if (this.props.deleteError) {
            return <Alert bsStyle="danger"><Message msgId="users.errorDelete" />{this.props.deleteError.statusText}</Alert>;
        }
        return null;
    };

    renderConfirmButtonContent = () => {
        switch (this.props.deleteStatus) {
        case "deleting":
            return <Message msgId="users.deleting" />;
        default:
            return <Message msgId="users.delete" />;
        }
    };

    render() {
        if (!this.props.user) {
            return null;
        }
        return (<Confirm
            show={!!this.props.user}
            onCancel={() => this.props.deleteUser(this.props.deleteId, "cancelled")}
            onConfirm={ () => { this.props.deleteUser(this.props.deleteId, "delete"); } }
            cancelId="cancel"
            confirmId={this.renderConfirmButtonContent()}
            disabled={this.props.deleteStatus === "deleting"}
            preventHide
            titleId={"users.confirmDeleteUser"}>
            <div style={{margin: "10px 0"}}><UserCard user={this.props.user} /></div>
            <div>{this.renderError()}</div>
        </Confirm>);
    }
}

export default connect((state) => {
    let usersState = state && state.users;
    if (!usersState) return {};
    let users = usersState && usersState.users;
    let deleteId = usersState.deletingUser && usersState.deletingUser.id;
    if (users && deleteId) {
        let index = findIndex(users, (user) => user.id === deleteId);
        let user = users[index];
        return {
            user,
            deleteId,
            deleteError: usersState.deletingUser.error,
            deleteStatus: usersState.deletingUser.status
        };
    }
    return {
        deleteId
    };
}, {deleteUser} )(UserDeleteConfirm);
