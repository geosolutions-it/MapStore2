import PropTypes from 'prop-types';

/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

// const Message = require('../I18N/Message').default;
import Select from 'react-select';

import Message from '../../I18N/Message';
import { findIndex } from 'lodash';
import SecurityUtils from '../../../utils/SecurityUtils';

// const ConfirmModal = require('./modals/ConfirmModal');
// const GroupManager = require('./GroupManager');

class UserCard extends React.Component {
    static propTypes = {
        // props
        groups: PropTypes.array,
        onUserGroupsChange: PropTypes.func,
        user: PropTypes.object
    };

    static defaultProps = {
        groups: [],
        onUserGroupsChange: () => {},
        user: {}
    };

    onChange = (values) => {
        if (values === null) {
            return;
        }
        this.props.onUserGroupsChange("groups", values.map((group) => {
            let index = findIndex(this.props.groups, (availableGroup)=>availableGroup.id === group.value);
            return index >= 0 ? this.props.groups[index] : null;
        }).filter(group => group));
    };

    getDefaultGroups = () => {
        return this.props.groups.filter((group) => group.groupName === SecurityUtils.USER_GROUP_ALL);
    };

    getOptions = () => {
        return this.props.groups.map((group) => ({
            label: group.groupName,
            value: group.id,
            clearableValue: group.groupName !== SecurityUtils.USER_GROUP_ALL
        }));
    };

    renderGroupsSelector = () => {
        return (<Select key="groupSelector"
            clearable={false}
            isLoading={this.props.groups.length === 0 }
            name="user-groups-selector"
            multi
            value={ (this.props.user && this.props.user.groups ? this.props.user.groups : this.getDefaultGroups() ).map(group => group.id) }
            options={this.getOptions()}
            onChange={this.onChange}
            style={{marginTop: "10px"}}
        />);
    };

    render() {
        return this.props.groups ? (
            <div style={{marginTop: "10px"}} key="groups-page">
                <span><Message msgId="users.selectedGroups"/></span>
                {this.renderGroupsSelector()}
            </div>
        ) : null;
    }
}

/*

*/

export default UserCard;
