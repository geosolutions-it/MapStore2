/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import Confirm from '../../../components/layout/ConfirmDialog';
import Message from '../../../components/I18N/Message';

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

    handleDeleteUser = () =>{
        this.props.deleteUser(this.props.deleteId, "delete");
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

export default UserDeleteConfirm;
