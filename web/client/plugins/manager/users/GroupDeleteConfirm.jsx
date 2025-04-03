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
import Message from '../../../components/I18N/Message';
import { findIndex } from 'lodash';
import { searchResources } from '../../ResourcesCatalog/actions/resources';

class GroupDeleteConfirm extends React.Component {
    static propTypes = {
        group: PropTypes.object,
        deleteGroup: PropTypes.func,
        onRefresh: PropTypes.func,
        deleteId: PropTypes.number,
        deleteError: PropTypes.object,
        deleteStatus: PropTypes.string

    };

    static defaultProps = {
        deleteGroup: () => {},
        onRefresh: () => {}
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
        this.props.onRefresh();
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

export default connect((state) => {
    let resourcesState = state && state.resources;
    let groupsstate = state && state.usergroups;
    if (!groupsstate) return {};
    let resources = resourcesState && resourcesState.sections?.groups?.resources;
    let deleteId = groupsstate.deletingGroup && groupsstate.deletingGroup.id;
    if (resources && deleteId) {
        let index = findIndex(resources, (group) => group.id === deleteId);
        let group =  resources[index];
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
}, {deleteGroup, onRefresh: searchResources.bind(null, { refresh: true })} )(GroupDeleteConfirm);
