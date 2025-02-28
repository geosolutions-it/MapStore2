/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import {find, findIndex, head} from 'lodash';
import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';
import { Glyphicon, Table } from 'react-bootstrap';
import Select from 'react-select';
import Spinner from 'react-spinkit';

import {getMessageById} from '../../../../utils/LocaleUtils';
import Message from '../../../I18N/Message';
import Button from '../../../misc/Button';
import SecurityUtils from '../../../../utils/SecurityUtils';
/**
 * @deprecated
 */
class PermissionEditor extends React.Component {
    static propTypes = {
        // props
        id: PropTypes.string,
        user: PropTypes.object,
        loading: PropTypes.bool,
        onUpdateRules: PropTypes.func,
        buttonSize: PropTypes.string,
        disabled: PropTypes.bool,
        style: PropTypes.object,
        fluid: PropTypes.bool,
        // CALLBACKS
        onErrorCurrentMap: PropTypes.func,
        onUpdateCurrentMap: PropTypes.func,
        onNewGroupChoose: PropTypes.func,
        onNewPermissionChoose: PropTypes.func,
        availablePermissions: PropTypes.arrayOf(PropTypes.string),
        availableGroups: PropTypes.arrayOf(PropTypes.object),
        updatePermissions: PropTypes.func,
        rules: PropTypes.arrayOf(PropTypes.object),
        newGroup: PropTypes.object,
        newPermission: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        disabled: false,
        id: "PermissionEditor",
        onUpdateRules: () => { },
        onNewGroupChoose: () => { },
        onNewPermissionChoose: () => { },
        user: {
            name: "Guest"
        },
        style: {},
        buttonSize: "small",
        // CALLBACKS
        onErrorCurrentMap: () => { },
        onUpdateCurrentMap: () => { },
        availablePermissions: ["canRead", "canWrite"],
        availableGroups: [],
        updatePermissions: () => { },
        rules: []
    };

    onGroupChange = (selected) => {
        // TODO: use find(this.props.availableGroups,['id', toInteger(id)]) when lodash will be updated to version 4
        this.props.onNewGroupChoose(find(this.props.availableGroups, (o) => o.id === selected.value));
    };

    onAddPermission = () => {
        // Check if the new permission will edit ad existing one
        if (this.isPermissionPresent(this.props.newGroup.groupName)) {
            this.props.onUpdateRules(this.props.rules.map(
                (rule) => {
                    if (rule.group && rule.group.groupName === this.props.newGroup.groupName) {
                        if (this.props.newPermission === "canWrite") {
                            return assign({}, rule, { canRead: true, canWrite: true });
                        }
                        return assign({}, rule, { canRead: true, canWrite: false });
                    }
                    return rule;
                }, this
            ).filter(rule => rule.canRead || rule.canWrite));

        } else {
            this.props.onUpdateRules(this.props.rules.concat([{
                canRead: true,
                canWrite: this.props.newPermission === "canWrite",
                group: this.props.newGroup
            }]));
        }
    };

    onChangePermission = (groupName, input) => {
        this.props.onUpdateRules(this.props.rules
            // remove items when delete
            .filter(rule => !(input === 'delete') || !(rule.group) || !(rule.group.groupName === groupName))
            // change rules
            .map(
                (rule) => {
                    if (rule.group && rule.group.groupName === groupName) {
                        if (input === "canWrite") {
                            return assign({}, rule, { canRead: true, canWrite: true });
                        } else if (input === "canRead") {
                            return assign({}, rule, { canRead: true, canWrite: false });
                        }
                        return assign({}, rule, { canRead: false, canWrite: false });
                    }
                    return rule;
                }
            ).filter(rule => rule.canRead || rule.canWrite));
    };

    getCurrentPermission = () => {
        return this.props.newPermission || head(this.props.availablePermissions);
    }

    getSelectableGroups = () => {
        return this.props.availableGroups && this.props.availableGroups.filter((group) => {
            return !this.isPermissionPresent(group.groupName);
        })
            .filter(group => this.getCurrentPermission() === "canWrite" ? group.groupName !== SecurityUtils.USER_GROUP_ALL : true)
            .map((group) => ({ label: group.groupName, value: group.id }));
    };

    getPermissionLabel = (perm) => {
        switch (perm) {
        case "canRead":
            return getMessageById(this.context.messages, "map.permissions.canView");
        case "canWrite":
            return getMessageById(this.context.messages, "map.permissions.canWrite");
        default:
            return perm;
        }
    };

    getAvailablePermissions = (groupName) => {
        return this.props.availablePermissions
            .map((perm) => ({ value: perm, label: this.getPermissionLabel(perm) }))
            .filter(perm => (groupName ?? this.props.newGroup?.groupName) === SecurityUtils.USER_GROUP_ALL ? perm.value !== 'canWrite' : true);
    };

    renderPermissionRows = () => {
        const rules = this.props.rules.filter(rule => rule.group);
        if (rules.length === 0) {
            return <tr><td colSpan="3"><Message msgId="map.permissions.noRules" /></td></tr>;
        }
        return rules
            .map(({canWrite, group}, index) => {
                return (
                    <tr key={index} className={index / 2 === 0 ? "even" : "odd"}>
                        <td>{group.groupName}</td>
                        <td style={{ width: "150px" }}>
                            <Select
                                ref={"permChoice" + index}
                                onChange={(sel) => { this.onChangePermission.call(this, group.groupName, sel.value); }}
                                clearable={false}
                                options={this.getAvailablePermissions(group.groupName)}
                                value={canWrite ? "canWrite" : "canRead" } />
                        </td>
                        {
                            // <td><Button bsStyle="primary" className="square-button"><Glyphicon glyph="1-group-mod"/></Button></td> TODO: Add a Group Editor
                        }
                        <td style={{ width: "50px" }}>{
                            // <Button bsStyle="danger" className="square-button" onClick={this.onChangePermission.bind(this, index, "delete")} ><Glyphicon glyph="1-close"/></Button>
                        }
                        <Button
                            key={"deleteButton" + index}
                            ref="deleteButton"
                            bsStyle="danger"
                            disabled={this.props.disabled}
                            onClick={this.onChangePermission.bind(this, group.groupName, "delete")}><Glyphicon glyph="1-close" /></Button>
                        </td>
                    </tr>
                );
            });
    }
    render() {
        return (
            <div>
                <Table className="permissions-table" stripped condensed hover>
                    <thead>
                        <tr>
                            <th colSpan="3"><Message msgId="map.permissions.title" /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.loading ?
                            <tr><td colSpan="3"><div><Spinner noFadeIn overrideSpinnerClassName="spinner" spinnerName="circle" /></div></td></tr>
                            : this.renderPermissionRows()}


                        <tr>
                            <th colSpan="3"><Message msgId="map.permissions.addRule" /></th>
                        </tr>


                        <tr key="addRowKey" className="insert-row">
                            <td>
                                <Select
                                    noResultsText={getMessageById(this.context.messages, "map.permissions.noResult")}
                                    ref="newGroup"
                                    isLoading={!this.getSelectableGroups()}
                                    clearable={false}
                                    placeholder={getMessageById(this.context.messages, "map.permissions.selectGroup")}
                                    options={this.getSelectableGroups()}
                                    value={this.props.newGroup && this.props.newGroup.id}
                                    onChange={this.onGroupChange} />
                            </td>
                            <td style={{ width: "150px" }}>
                                <Select
                                    ref="newChoice"
                                    clearable={false}
                                    options={this.getAvailablePermissions()}
                                    value={this.getCurrentPermission()}
                                    onChange={(sel) => { this.props.onNewPermissionChoose(sel && sel.value); }} />
                            </td>
                            <td style={{ width: "50px" }}>
                                <Button
                                    ref="buttonAdd"
                                    disabled={this.props.disabled || !this.props.newGroup || this.isPermissionPresent(this.props.newGroup && this.props.newGroup.groupName)}
                                    bsSize="small"
                                    bsStyle="success"
                                    onClick={this.onAddPermission} ><Glyphicon style={{ fontSize: "22px" }} glyph="plus" /></Button>
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
        return this.props.rules && findIndex(this.props.rules, (o) => o.group && o.group.groupName === group) >= 0;
    };
}

export default PermissionEditor;
