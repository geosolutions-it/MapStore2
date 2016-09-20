/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Select = require('react-select');
const {Input, Button, Alert} = require('react-bootstrap');
module.exports = React.createClass({
    propTypes: {
        enabled: React.PropTypes.bool,
        status: React.PropTypes.object,
        onStatusDismiss: React.PropTypes.func,
        selectWorkSpace: React.PropTypes.func,
        selectedWorkSpace: React.PropTypes.string,
        workspaces: React.PropTypes.array,
        loadWorkspaces: React.PropTypes.func,
        datastoreTemplates: React.PropTypes.array,
        createWorkspace: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            loadWorkspaces: () => {},
            createWorkspace: () => {},
            selectWorkSpace: () => {},
            onStatusDismiss: () => {},
            datastoreTemplates: []
        };
    },
    getInitialState() {
        return {
            valid: false
        };
    },
    componentDidMount() {
        if (!this.props.workspaces) this.props.loadWorkspaces();
    },
    renderAlert() {
        if (this.props.status && (this.props.status.status === "error")) {
            return (<Alert onDismiss={this.props.onStatusDismiss} key="error" bsStyle="danger"> Error creating workspace: {this.props.status && this.props.status.error && this.props.status.error.data}</Alert>);
        } else if (this.props.status && (this.props.status.status === "success")) {
            return (<Alert onDismiss={this.props.onStatusDismiss} key="success">Workspace "{this.props.status.workspace}" successfully created</Alert>);
        }
    },
    render() {
        return (<div>
            <strong>target workspace: </strong>
            {this.props.enabled ?
                (<div>{this.props.selectedWorkSpace}</div>)
                : (<Select
                isLoading={!this.props.workspaces}
                placeholder={"Select TargetWorkspace"}
                value={this.props.selectedWorkSpace}
                onChange={this.props.selectWorkSpace}
                clearable={false}
                options={this.props.workspaces && this.props.workspaces.map((ws) => ({
                    value: ws.name,
                    label: ws.name
                }))}
                />)}
                <div className="form-inline" style={{marginTop: "10px", display: this.props.enabled ? "none" : "block"}}>
                    <strong>create a new workspace: </strong>
                    <Input
                        onChange={this.validate}
                        ref="workspaceNewName"
                        placeholder="New workspace name..."
                        bsSize="small"
                        name="workspace-name"
                        key="workspace-name"
                        type="text"
                        style={{width: "100%"}}
                    /> <Button disabled={!this.state.valid} bsStyle="primary" bsSize="small" onClick={this.createWorkspace}>Create</Button>
                {this.renderAlert()}
                </div>
        </div>);
    },
    isValid(name) {
        // should not contain spaces
        return name.indexOf(" ") < 0 && name.length > 0;
    },
    validate() {
        let name = this.refs.workspaceNewName.getValue();
        let valid = this.isValid(name);
        this.setState({valid});
    },
    createWorkspace() {
        let name = this.refs.workspaceNewName.getValue();
        let valid = this.isValid(name);
        if (name && valid) {
            this.props.createWorkspace(name, this.props.datastoreTemplates);
        }
    }
});
