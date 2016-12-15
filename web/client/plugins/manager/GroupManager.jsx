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
const {editGroup} = require('../../actions/usergroups');
const {setControlProperty} = require('../../actions/controls');
const SearchBar = require('./users/SearchBar');
const GroupsGrid = require('./users/GroupGrid');
const GroupDialog = require('./users/GroupDialog');
const GroupDeleteConfirm = require('./users/GroupDeleteConfirm');
const Message = require('../../components/I18N/Message');
const assign = require('object-assign');

const GroupManager = React.createClass({
    propTypes: {
        selectedTool: React.PropTypes.string,
        selectedGroup: React.PropTypes.string,
        onNewGroup: React.PropTypes.func,
        onToggleUsersGroups: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            selectedGroup: "groups",
            onNewGroup: () => {},
            onToggleUsersGroups: () => {}
        };
    },
    onNew() {
        this.props.onNewGroup();
    },
    render() {
        return (<div>
            <SearchBar />
            {this.toogleTools()}
            <Grid style={{marginBottom: "10px"}} fluid={true}>
                <h1 className="usermanager-title"><Message msgId={"usergroups.groups"}/></h1>
                <Button style={{marginRight: "10px"}} bsStyle="success" onClick={this.onNew}>
                    <span><Glyphicon glyph="1-group-add" /><Message msgId="usergroups.newGroup" /></span>
                </Button>
            </Grid>
            <GroupsGrid />
            <GroupDialog />
            <GroupDeleteConfirm />
        </div>);
    },
    toogleTools() {
        this.props.onToggleUsersGroups(this.props.selectedGroup);
    }
});
module.exports = {
    GroupManagerPlugin: assign(
        connect((state) => ({
            selectedTool: state && state.controls && state.controls.managerchoice && state.controls.managerchoice.selectedTool
        }), {
            onNewGroup: editGroup.bind(null, {}),
            onToggleUsersGroups: setControlProperty.bind(null, "managerchoice", "selectedTool")
        })(GroupManager), {
    hide: true,
    Manager: {
        id: "groupmanager",
        name: 'groupmanager',
        position: 1,
        title: <Message msgId="usergroups.manageGroups" />,
        glyph: "1-group-mod"
    }}),
    reducers: {
        users: require('../../reducers/users'),
        usergroups: require('../../reducers/usergroups'),
        controls: require('../../reducers/controls')
    }
};
