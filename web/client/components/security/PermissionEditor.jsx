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
const Select = require('react-select');
const Spinner = require('react-spinkit');
const {Table, Button, Glyphicon} = require('react-bootstrap');
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
    onNewGroupChoose(selected) {
        // TODO: use _.find(this.props.availableGroups,['id', _.toInteger(id)]) when lodash will be updated to version 4
        this.props.onNewGroupChoose(_.find(this.props.availableGroups, (o)=> o.id === selected.value));
    },
    onAddPermission() {
        // Check if the new permission will edit ad existing one
        if (this.isPermissionPresent(this.props.newGroup.groupName)) {
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
    getSelectableGroups() {
        return this.props.availableGroups && this.props.availableGroups.filter( (group) => {
            return !this.isPermissionPresent(group.groupName);
        }

        ).map((group) => ({label: group.groupName, value: group.id}));
    },
    getPermissonLabel(perm) {
        // TODO support I18N
        switch (perm) {
            case "canRead":
                return "Can view";
            case "canWrite":
                return "Can edit";
            default:
                return perm;
        }
    },
    getAvailablePermissions() {
        return this.props.availablePermissions.map((perm) => ({value: perm, label: this.getPermissonLabel(perm)}));
    },
    renderPermissionRows() {
        if (this.localGroups.length === 0) {
            return <tr><td colSpan="3">No rules</td></tr>;

        }
        return this.localGroups.map((group, index) => {
            return (
                <tr style={{display: "flex"}} key={index} className={index / 2 === 0 ? "even" : "odd"}>
                    <td style={{flex: 1}}>{group.name}</td>
                    <td style={{width: "150px"}}>
                        <Select
                            ref="permChoice"
                            onChange={(sel) => {this.onChangePermission.call(this, index, sel.value ); }}
                            clearable={false}
                            options={this.getAvailablePermissions()}
                            value={group.permission}/>
                    </td>
                    {
                        // <td><Button bsStyle="primary" className="square-button"><Glyphicon glyph="1-group-mod"/></Button></td> TODO: Add a Group Editor
                    }
                    <td style={{width: "50px"}}>{
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
        });
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
                <Table className="permissions-table" stripped condensed hover>
                    <thead>
                        <tr>
                            <th colSpan="3">Permissions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.map && this.props.map.permissionLoading ?
                        <tr><td colSpan="3"><div><Spinner noFadeIn spinnerName="circle" /></div></td></tr>
                        : this.renderPermissionRows()}
                        <tr>
                            <th colSpan="3">Add a rule...</th>
                        </tr>
                        <tr style={{display: "flex"}} key="addRowKey">
                            <td style={{flex: 1}}>
                                <Select
                                    ref="newGroup"
                                    isLoading={!(this.props.availableGroups && this.props.availableGroups.length > 0)}
                                    clearable={false}
                                    placeholder="Select a group..."
                                    options={this.getSelectableGroups()}
                                    value={this.props.newGroup && this.props.newGroup.id}
                                    onChange={this.onNewGroupChoose}/>
                            </td>
                            <td style={{width: "150px"}}>
                            <Select
                                ref="newChoice"
                                clearable={false}
                                options={this.getAvailablePermissions()}
                                value={this.props.newPermission || _.head(this.props.availablePermissions)}
                                onChange={(sel) => {this.props.onNewPermissionChoose(sel && sel.value); }}/>
                            </td>
                            <td style={{width: "50px"}}>
                                <Button
                                    disabled={!(this.props.newGroup && this.props.newGroup.id && this.props.newGroup.id.toString())}
                                    bsSize="small"
                                    bsStyle="success"
                                    onClick={this.onAddPermission} ><Glyphicon style={{fontSize: "22px"}} glyph="plus"/></Button>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        );
    },
    isPermissionPresent(group) {
        return this.props.map && this.props.map.permissions && this.props.map.permissions.SecurityRuleList && this.props.map.permissions.SecurityRuleList.SecurityRule &&
            _.findIndex(this.props.map.permissions.SecurityRuleList.SecurityRule, (o) => o.group && o.group.groupName === group) >= 0;
    }
});

module.exports = PermissionEditor;
