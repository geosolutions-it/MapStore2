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
import Message from '../../../components/I18N/Message';
import { findIndex } from 'lodash';
import { searchResources } from '../../ResourcesCatalog/actions/resources';

function convertJsonFormat(inputJson) {
    let outputJson = { ...inputJson };
    if (inputJson.groups && inputJson.groups.group) {
        outputJson.groups = [inputJson.groups.group];
    }
    return outputJson;
}

class UserDeleteConfirm extends React.Component {
    static propTypes = {
        user: PropTypes.object,
        deleteUser: PropTypes.func,
        onRefresh: PropTypes.func,
        deleteId: PropTypes.number,
        deleteError: PropTypes.object,
        deleteStatus: PropTypes.string

    };

    static defaultProps = {
        deleteUser: () => {},
        onRefresh: () => {}
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

    handleDeleteUser = () =>{
        this.props.deleteUser(this.props.deleteId, "delete");
        this.props.onRefresh();
    }

    render() {
        if (!this.props.user) {
            return null;
        }
        return (<Confirm
            show={!!this.props.user}
            onCancel={() => this.props.deleteUser(this.props.deleteId, "cancelled")}
            onConfirm={this.handleDeleteUser}
            cancelId="cancel"
            confirmId={this.renderConfirmButtonContent()}
            disabled={this.props.deleteStatus === "deleting"}
            preventHide
            titleId={"users.confirmDeleteUser"}
            titleParams={{title: this.props.user.name}}>
            <div>{this.renderError()}</div>
        </Confirm>);
    }
}

export default connect((state) => {
    let resourcesState = state && state.resources;
    let usersState = state && state.users;
    if (!resourcesState) return {};
    let resources = resourcesState && resourcesState.sections?.users?.resources;
    let deleteId = usersState.deletingUser && usersState.deletingUser.id;
    if (resources && deleteId) {
        let index = findIndex(resources, (user) => user.id === deleteId);
        let user = convertJsonFormat(resources[index]);
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
}, {deleteUser, onRefresh: searchResources.bind(null, { refresh: true })} )(UserDeleteConfirm);

