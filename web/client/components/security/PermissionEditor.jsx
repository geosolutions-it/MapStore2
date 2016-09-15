/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const assign = require('object-assign');
const _ = require('lodash');
const {Table, Button, Glyphicon} = require('react-bootstrap');
const Choice = require('../form/Choice');
const Message = require('../I18N/Message');

/**
* Map permission editor
*/
const PermissionEditor = React.createClass({
    propTypes: {
        // props
        id: React.PropTypes.string,
        user: React.PropTypes.object,
        onGroupsChange: React.PropTypes.func,
        onAddPermission: React.PropTypes.func,
        buttonSize: React.PropTypes.string,
        includeCloseButton: React.PropTypes.bool,
        map: React.PropTypes.object,
        style: React.PropTypes.object,
        fluid: React.PropTypes.bool,
        // CALLBACKS
        onErrorCurrentMap: React.PropTypes.func,
        onUpdateCurrentMap: React.PropTypes.func,
        onNewGroupChoose: React.PropTypes.func,
        onNewPermissionChoose: React.PropTypes.func,
        availablePermissions: React.PropTypes.arrayOf(React.PropTypes.string),
        availableGroups: React.PropTypes.arrayOf(React.PropTypes.object),
        updatePermissions: React.PropTypes.func,
        groups: React.PropTypes.arrayOf(React.PropTypes.object),
        newGroup: React.PropTypes.object,
        newPermission: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            id: "PermissionEditor",
            onGroupsChange: ()=> {},
            onAddPermission: ()=> {},
            onNewGroupChoose: ()=> {},
            onNewPermissionChoose: ()=> {},
            user: {
                name: "Guest"
            },
            style: {},
            buttonSize: "small",
            // CALLBACKS
            onErrorCurrentMap: ()=> {},
            onUpdateCurrentMap: ()=> {},
            availablePermissions: ["canRead", "canWrite"],
            availableGroups: [],
            updatePermissions: () => {},
            groups: []
        };
    },
    onNewGroupChoose(id) {
        // TODO: use _.find(this.props.availableGroups,['id', _.toInteger(id)]) when lodash will be updated to version 4
        this.props.onNewGroupChoose(_.find(this.props.availableGroups, (o)=> o.id.toString() === id));
    },
    onAddPermission() {
        // Check if the new permission will edit ad existing one
        if (this.props.map && this.props.map.permissions && this.props.map.permissions.SecurityRuleList && this.props.map.permissions.SecurityRuleList.SecurityRule &&
            _.findIndex(this.props.map.permissions.SecurityRuleList.SecurityRule, (o) => o.group && o.group.groupName === this.props.newGroup.groupName) >= 0) {
            this.props.onGroupsChange(
                {
                    SecurityRuleList: {
                        SecurityRule: this.props.map.permissions.SecurityRuleList.SecurityRule.map(
                                function(rule) {
                                    if (rule.group && rule.group.groupName === this.props.newGroup.groupName) {
                                        if (this.props.newPermission === "canWrite") {
                                            return assign({}, rule, {canRead: true, canWrite: true});
                                        }
                                        return assign({}, rule, {canRead: true, canWrite: false});
                                    }
                                    return rule;
                                }, this
                            ).filter(rule => rule.canRead || rule.canWrite)
                    }
                }
            );

        } else {
            this.props.onAddPermission({
                     canRead: true,
                     canWrite: this.props.newPermission === "canWrite",
                     group: this.props.newGroup
                 });
        }
    },
    onChangePermission(index, input) {
        if (this.props.map.permissions) {
            this.props.onGroupsChange(
            {
                SecurityRuleList: {
                    SecurityRule: this.props.map.permissions.SecurityRuleList.SecurityRule.map(
                        function(rule) {
                            if (rule.group && rule.group.groupName === this.localGroups[index].name) {
                                if (input === "canWrite") {
                                    return assign({}, rule, {canRead: true, canWrite: true});
                                } else if (input === "canRead") {
                                    return assign({}, rule, {canRead: true, canWrite: false});
                                }
                                // TODO: this entry is useless, it should be removed from the array
                                return assign({}, rule, {canRead: false, canWrite: false});
                            }
                            return rule;
                        }, this
                     ).filter(rule => rule.canRead || rule.canWrite)
                 }
             }
         );
        }
    },
    render() {
        // Hack to convert map permissions to a simpler format, TODO: remove this
        if (this.props.map && this.props.map.permissions && this.props.map.permissions.SecurityRuleList && this.props.map.permissions.SecurityRuleList.SecurityRule) {
            this.localGroups = this.props.map.permissions.SecurityRuleList.SecurityRule.map(function(rule) {
                if (rule && rule.group && rule.canRead) {
                    return {name: rule.group.groupName, permission: rule.canWrite ? "canWrite" : "canRead" };
                }
            }
            ).filter(rule => rule);  // filter out undefined values
        } else {
            this.localGroups = this.props.groups;
        }
        return (
            <div>
                <b style={{cursor: "default"}} ><Message msgId="groups" /> <Message msgId="permissions" /></b>
                <Table className="permissions-table" bordered condensed hover>
                    <thead>
                        <tr>
                            <th><Message msgId="group" /></th>
                            <th><Message msgId="permission" /></th>
                            {
                                // <th><Message msgId="groupEdit" /></th> TODO: Add a Group Editor
                            }
                            <th><Message msgId="permissionDelete" /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.localGroups.map((group, index) => {
                            return (
                                <tr key={index} className={index / 2 === 0 ? "even" : "odd"}>
                                    <td>{group.name}</td>
                                    <td>
                                        <Choice
                                            ref="permChoice"
                                            onChange={this.onChangePermission.bind(this, index)}
                                            label=""
                                            items={this.props.availablePermissions.map((perm) => ({name: perm, value: perm}))}
                                            selected={group.permission}/>
                                    </td>
                                    {
                                        // <td><Button bsStyle="primary" className="square-button"><Glyphicon glyph="1-group-mod"/></Button></td> TODO: Add a Group Editor
                                    }
                                    <td>{
                                        // <Button bsStyle="danger" className="square-button" onClick={this.onChangePermission.bind(this, index, "delete")} ><Glyphicon glyph="1-close"/></Button>
                                    }
                                        <Button
                                            key={"deleteButton" + index}
                                            ref="deleteButton"
                                            bsStyle="danger"
                                            onClick={this.onChangePermission.bind(this, index, "delete")}><Glyphicon glyph="1-close"/></Button>
                                    </td>
                                </tr>
                            );
                        })}
                        <tr key="addRowKey">
                            <td>
                                <b>Select a group</b><br/>
                                <Choice
                                    ref="newGroup"
                                    label=""
                                    items={this.props.availableGroups.map((group) => ({name: group.groupName, value: group.id}))}
                                    selected={this.props.newGroup && this.props.newGroup.id && this.props.newGroup.id.toString()}
                                    onChange={this.onNewGroupChoose}/>
                            </td>
                            <td>
                            <Choice
                                ref="newChoice"
                                label=""
                                items={this.props.availablePermissions.map((perm) => ({name: perm, value: perm}))}
                                selected={this.props.newPermission}
                                onChange={this.props.onNewPermissionChoose}/>
                            </td>
                            <td>
                                <Button disabled={!this.props.availableGroups || this.props.availableGroups.length === 0} bsStyle="success" onClick={this.onAddPermission} >Add Permission</Button>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        );
    }
});

module.exports = PermissionEditor;
