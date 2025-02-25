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
import { deleteGroup } from '../../../actions/usergroups';
import { Alert } from 'react-bootstrap';
import Confirm from '../../../components/layout/ConfirmDialog';
import GroupCard from '../../../components/manager/users/GroupCard';
import Message from '../../../components/I18N/Message';
import { findIndex } from 'lodash';

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

    render() {
        if (!this.props.group) {
            return null;
        }
        return (<Confirm
            show={!!this.props.group}
            onCancel={() => this.props.deleteGroup(this.props.deleteId, "cancelled")}
            onConfirm={ () => { this.props.deleteGroup(this.props.deleteId, "delete"); } }
            confirmId={this.renderConfirmButtonContent()}
            cancelId="cancel"
            preventHide
            titleId={"usergroups.confirmDeleteGroup"}
            disabled={this.props.deleteStatus === "deleting"}>
            <div style={{margin: "10px 0"}}><GroupCard group={this.props.group} /></div>
            <div>{this.renderError()}</div>
        </Confirm>);
    }
}

export default connect((state) => {
    let groupsstate = state && state.usergroups;
    if (!groupsstate) return {};
    let groups = groupsstate && groupsstate.groups;
    let deleteId = groupsstate.deletingGroup && groupsstate.deletingGroup.id;
    if (groups && deleteId) {
        let index = findIndex(groups, (user) => user.id === deleteId);
        let group = groups[index];
        return {
            group,
            deleteId,
            deleteError: groupsstate.deletingGroup.error,
            deleteStatus: groupsstate.deletingGroup.status
        };
    }
    return {
        deleteId
    };
}, {deleteGroup} )(GroupDeleteConfirm);
