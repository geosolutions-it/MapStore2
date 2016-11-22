/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const SearchBar = require('./users/SearchBar');
const UserGrid = require('./users/UserGrid');
const GroupsGrid = require('./users/GroupGrid');
const UserDialog = require('./users/UserDialog');
const GroupDialog = require('./users/GroupDialog');
const TopButtons = require('./users/TopButtons');
const UserDeleteConfirm = require('./users/UserDeleteConfirm');
const GroupDeleteConfirm = require('./users/GroupDeleteConfirm');
const Message = require('../../components/I18N/Message');
const assign = require('object-assign');

const UserManager = React.createClass({
    propTypes: {
        selectedTool: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            selectedTool: "users"
        };
    },
    render() {
        return (<div>
            <SearchBar />
            <TopButtons />
            {this.props.selectedTool === "users" ? <UserGrid /> : <GroupsGrid />}
            <UserDialog />
            <GroupDialog />
            <GroupDeleteConfirm />
            <UserDeleteConfirm />
    </div>);
    }
});
module.exports = {
    UserManagerPlugin: assign(
        connect((state) => ({ selectedTool: state && state.controls && state.controls.usermanager && state.controls.usermanager.selectedTool}))(UserManager), {
    hide: true,
    Manager: {
        id: "usermanager",
        name: 'usermanager',
        position: 1,
        title: <Message msgId="users.title" />,
        glyph: "1-group-mod"
    }}),
    reducers: {
        users: require('../../reducers/users'),
        usergroups: require('../../reducers/usergroups'),
        controls: require('../../reducers/controls')
    }
};
