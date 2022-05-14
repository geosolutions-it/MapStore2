/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';

import PropTypes from 'prop-types';
import assign from 'object-assign';
import {find, findIndex, head} from 'lodash';
import Select from 'react-select';
import Spinner from 'react-spinkit';
import { Table, Glyphicon } from 'react-bootstrap';
import Message from '../I18N/Message';
import { getMessageById } from '../../utils/LocaleUtils';
import Button from '../misc/Button';

/**
* Map permission editor
*/
class PermissionEditor extends React.Component {
    static propTypes = {
        // props
        id: PropTypes.string,
        user: PropTypes.object,
        buttonSize: PropTypes.string,
        includeCloseButton: PropTypes.bool,
        disabled: PropTypes.bool,
        map: PropTypes.object,
        style: PropTypes.object,
        fluid: PropTypes.bool,
        // CALLBACKS
        onGroupsChange: PropTypes.func,
        onAddPermission: PropTypes.func,
        onErrorCurrentMap: PropTypes.func,
        onUpdateCurrentMap: PropTypes.func,
        onNewGroupChoose: PropTypes.func,
        onNewPermissionChoose: PropTypes.func,
        availablePermissions: PropTypes.arrayOf(PropTypes.string),
        availableGroups: PropTypes.arrayOf(PropTypes.object),
        updatePermissions: PropTypes.func,
        groups: PropTypes.arrayOf(PropTypes.object),
        newGroup: PropTypes.object,
        newPermission: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        disabled: true,
        id: "PermissionEditor",
        user: {
            name: "Guest"
        },
        style: {},
        buttonSize: "small",
        // CALLBACKS
        onGroupsChange: ()=> {},
        onAddPermission: ()=> {},
        onNewGroupChoose: ()=> {},
        onNewPermissionChoose: ()=> {},
        onErrorCurrentMap: ()=> {},
        onUpdateCurrentMap: ()=> {},
        availablePermissions: ["canRead", "canWrite"],
        availableGroups: [],
        updatePermissions: () => {},
        groups: []
    };

    onNewGroupChoose = (selected) => {
        // TODO: use find(this.props.availableGroups,['id', toInteger(id)]) when lodash will be updated to version 4
        this.props.onNewGroupChoose(find(this.props.availableGroups, (o)=> o.id === selected.value));
    };

    onAddPermission = () => {
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
    };

    onChangePermission = (index, input) => {
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
    };

    getSelectableGroups = () => {
        return this.props.availableGroups && this.props.availableGroups.filter( (group) => {
            return !this.isPermissionPresent(group.groupName);
        }).map((group) => ({label: group.groupName, value: group.id}));
    };

    getPermissonLabel = (perm) => {
        switch (perm) {
        case "canRead":
            return getMessageById(this.context.messages, "map.permissions.canView");
        case "canWrite":
            return getMessageById(this.context.messages, "map.permissions.canWrite");
        default:
            return perm;
        }
    };

    getAvailablePermissions = () => {
        return this.props.availablePermissions.map((perm) => ({value: perm, label: this.getPermissonLabel(perm)}));
    };

    renderPermissionRows = () => {
        if (this.localGroups.length === 0) {
            return <tr><td colSpan="3"><Message msgId="map.permissions.noRules" /></td></tr>;
        }
        return this.localGroups.map((group, index) => {
            return (
                <tr key={index} className={index / 2 === 0 ? "even" : "odd"}>
                    <td>{group.name}</td>
                    <td style={{width: "150px"}}>
                        <Select
                            ref={"permChoice" + index}
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
                        disabled={this.props.disabled}
                        onClick={this.onChangePermission.bind(this, index, "delete")}><Glyphicon glyph="1-close"/></Button>
                    </td>
                </tr>
            );
        });
    };
    render() {
        // Hack to convert map permissions to a simpler format, TODO: remove this
        if (this.props.map && this.props.map.permissions && this.props.map.permissions.SecurityRuleList && this.props.map.permissions.SecurityRuleList.SecurityRule) {
            this.localGroups = this.props.map.permissions.SecurityRuleList.SecurityRule
                .map(function(rule) {
                    if (rule && rule.group && rule.canRead) {
                        return {name: rule.group.groupName, permission: rule.canWrite ? "canWrite" : "canRead" };
                    }
                    return null;
                }
                ).filter(rule => rule);  // filter out undefined values
        } else {
            this.localGroups = this.props.groups;
        }
        return (
            <div>
                <Table className="permissions-table" stripped condensed hover>
                    <thead>
                        <tr>
                            <th colSpan="3"><Message msgId="map.permissions.title" /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.map && this.props.map.permissionLoading ?
                            <tr><td colSpan="3"><div><Spinner noFadeIn overrideSpinnerClassName="spinner" spinnerName="circle" /></div></td></tr>
                            : this.renderPermissionRows()}


                        <tr>
                            <th colSpan="3"><Message msgId="map.permissions.addRule" /></th>
                        </tr>


                        <tr key="addRowKey">
                            <td>
                                <Select
                                    noResultsText={getMessageById(this.context.messages, "map.permissions.noResult")}
                                    ref="newGroup"
                                    isLoading={!this.getSelectableGroups()}
                                    clearable={false}
                                    placeholder={getMessageById(this.context.messages, "map.permissions.selectGroup")}
                                    options={this.getSelectableGroups()}
                                    value={this.props.newGroup && this.props.newGroup.id}
                                    onChange={this.onNewGroupChoose}/>
                            </td>
                            <td style={{width: "150px"}}>
                                <Select
                                    ref="newChoice"
                                    clearable={false}
                                    options={this.getAvailablePermissions()}
                                    value={this.props.newPermission || head(this.props.availablePermissions)}
                                    onChange={(sel) => {this.props.onNewPermissionChoose(sel && sel.value); }}/>
                            </td>
                            <td style={{width: "50px"}}>
                                <Button
                                    ref="buttonAdd"
                                    disabled={this.props.disabled || !(this.props.newGroup && this.props.newGroup.id && this.props.newGroup.id.toString())}
                                    bsSize="small"
                                    bsStyle="success"
                                    onClick={this.onAddPermission} ><Glyphicon style={{fontSize: "22px"}} glyph="plus"/></Button>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        );
    }

    disablePermission(a, b) {
        return a || !b;
    }
    isPermissionPresent = (group) => {
        return this.props.map && this.props.map.permissions && this.props.map.permissions.SecurityRuleList && this.props.map.permissions.SecurityRuleList.SecurityRule &&
            findIndex(this.props.map.permissions.SecurityRuleList.SecurityRule, (o) => o.group && o.group.groupName === group) >= 0;
    };
}

export default PermissionEditor;
