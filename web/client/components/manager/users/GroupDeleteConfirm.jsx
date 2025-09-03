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

class GroupDeleteConfirm extends React.Component {
    static propTypes = {
        group: PropTypes.object,
        deleteGroup: PropTypes.func,
        deleteId: PropTypes.number,
        deleteError: PropTypes.object,
        deleteStatus: PropTypes.string

    };

    static defaultProps = {
        deleteGroup: () => {}
    };

    renderError = () => {
        if (this.props.deleteError) {
            return <Alert bsStyle="danger"><Message msgId="usergroups.errorDelete" />{this.props.deleteError.statusText}</Alert>;
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

    handleDeleteGroup = () =>{
        this.props.deleteGroup(this.props.deleteId, "delete");
    }

    render() {
        if (!this.props.group) {
            return null;
        }
        return (<Confirm
            show={!!this.props.group}
            onCancel={() => this.props.deleteGroup(this.props.deleteId, "cancelled")}
            onConfirm={this.handleDeleteGroup}
            confirmId={this.renderConfirmButtonContent()}
            cancelId="cancel"
            preventHide
            titleId={"usergroups.confirmDeleteGroup"}
            titleParams={{title: this.props.group.groupName}}
            disabled={this.props.deleteStatus === "deleting"}>
            <div>{this.renderError()}</div>
        </Confirm>);
    }
}

export default GroupDeleteConfirm;
