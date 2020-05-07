const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Select = require('react-select').default;
const {FormControl, Button, Alert} = require('react-bootstrap');
const Message = require('../../I18N/Message');
const LocaleUtils = require('../../../utils/LocaleUtils');

module.exports = class extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool,
        status: PropTypes.object,
        onStatusDismiss: PropTypes.func,
        selectWorkSpace: PropTypes.func,
        selectedWorkSpace: PropTypes.string,
        workspaces: PropTypes.array,
        loadWorkspaces: PropTypes.func,
        datastoreTemplates: PropTypes.array,
        createWorkspace: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        loadWorkspaces: () => {},
        createWorkspace: () => {},
        selectWorkSpace: () => {},
        onStatusDismiss: () => {},
        datastoreTemplates: []
    };

    state = {
        valid: false
    };

    componentDidMount() {
        if (!this.props.workspaces) this.props.loadWorkspaces();
    }

    renderAlert = () => {
        if (this.props.status && this.props.status.status === "error") {
            return (<Alert onDismiss={this.props.onStatusDismiss} key="error" bsStyle="danger">
                <Message msgId="importer.workspace.failure" msgParams={{statusWS: this.props.status && this.props.status.error && this.props.status.error.data}}/>
            </Alert>);
        } else if (this.props.status && this.props.status.status === "success") {
            return (<Alert onDismiss={this.props.onStatusDismiss} key="success">
                <Message msgId="importer.workspace.success" msgParams={{statusWS: this.props.status && this.props.status.workspace}}/>
            </Alert>);
        }
        return null;
    };

    render() {
        return (<div>
            <strong><Message msgId="importer.workspace.target" /></strong>
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
                <strong><Message msgId="importer.workspace.createWS" /></strong>
                <FormControl
                    onChange={this.validate}
                    ref="workspaceNewName"
                    placeholder={LocaleUtils.getMessageById(this.context.messages, "importer.workspace.new")}
                    bsSize="small"
                    name="workspace-name"
                    key="workspace-name"
                    type="text"
                    style={{width: "100%"}}/>
                <Button disabled={!this.state.valid} bsStyle="primary" bsSize="small" onClick={this.createWorkspace}><Message msgId="importer.workspace.create"/></Button>
                {this.renderAlert()}
            </div>
        </div>);
    }

    isValid = (name) => {
        // should not contain spaces
        return name.indexOf(" ") < 0 && name.length > 0;
    };

    validate = (e) => {
        let name = e.target.value;
        let valid = this.isValid(name);
        this.setState({valid, name});
    };

    createWorkspace = () => {
        let name = this.state && this.state.name;
        let valid = this.isValid(name);
        if (name && valid) {
            this.props.createWorkspace(name, this.props.datastoreTemplates);
        }
    };
};
