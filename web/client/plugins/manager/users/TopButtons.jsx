/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {Button, Grid, Glyphicon} = require('react-bootstrap');
const {editUser} = require('../../../actions/users');
const {editGroup} = require('../../../actions/usergroups');
const {setControlProperty} = require('../../../actions/controls');
const Message = require('../../../components/I18N/Message');
const USERS = "users";
const GROUPS = "groups";
const Bar = React.createClass({
    propTypes: {
        selectedTool: React.PropTypes.string,
        onNewUser: React.PropTypes.func,
        onNewGroup: React.PropTypes.func,
        onToggleUsersGroups: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            selectedTool: "users",
            onNewUser: () => {},
            onNewGroup: () => {},
            onToggleUsersGroups: () => {}
        };
    },
    onNew() {
        if (this.props.selectedTool === "users") {
            this.props.onNewUser();
        } else if (this.props.selectedTool === "groups") {
            this.props.onNewGroup();
        }
    },
    renderNewButton() {
        if (this.props.selectedTool === USERS) {
            return <span><Glyphicon glyph="1-user-add" /><Message msgId="users.newUser" /></span>;
        } else if (this.props.selectedTool === GROUPS) {
            return <span><Glyphicon glyph="1-group-add" /><Message msgId="usergroups.newGroup" /></span>;
        }
    },
    renderToggle() {
        if (this.props.selectedTool === (USERS)) {
            return <span><Glyphicon glyph="1-group" /><Message msgId="usergroups.manageGroups" /></span>;
        } else if (this.props.selectedTool === GROUPS) {
            return <span><Glyphicon glyph="user" /><Message msgId="users.title" /></span>;
        }
    },
    render() {
        return (<Grid style={{marginBottom: "10px"}} fluid={true}>
            <Button style={{marginRight: "10px"}} bsStyle="primary" onClick={this.onNew}>{this.renderNewButton()}</Button>
            <Button bsStyle="primary" onClick={this.toogleTools}>{this.renderToggle()}</Button>
        </Grid>);
    },
    toogleTools() {
        this.props.onToggleUsersGroups(this.props.selectedTool === USERS ? GROUPS : USERS );
    }
});
const TopButtons = connect((state) => ({
    selectedTool: state && state.controls && state.controls.usermanager && state.controls.usermanager && state.controls.usermanager.selectedTool
}), {
    onNewUser: editUser.bind(null, {role: "USER", "enabled": true}),
    onNewGroup: editGroup.bind(null, {}),
    onToggleUsersGroups: setControlProperty.bind(null, "usermanager", "selectedTool")
})(Bar);

module.exports = TopButtons;
