/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PropTypes = require('prop-types');
const React = require('react');
const {Alert, Tabs, Tab, Button, Glyphicon, Checkbox, FormControl, FormGroup, ControlLabel} = require('react-bootstrap');
const tooltip = require('../../../components/misc/enhancers/tooltip');
const GlyphiconTooltip = tooltip(Glyphicon);
const Dialog = require('../../../components/misc/Dialog');
const UserGroups = require('./UserGroups');
const assign = require('object-assign');
const Message = require('../../../components/I18N/Message');
const Spinner = require('react-spinkit');
const {findIndex} = require('lodash');
const CloseConfirmButton = require('./CloseConfirmButton').default;

require('./style/userdialog.css');

/**
 * A Modal window to show password reset form
 */
class UserDialog extends React.Component {
    static propTypes = {
        // props
        user: PropTypes.object,
        groups: PropTypes.array,
        groupsStatus: PropTypes.string,
        show: PropTypes.bool,
        onClose: PropTypes.func,
        onChange: PropTypes.func,
        onSave: PropTypes.func,
        modal: PropTypes.bool,
        closeGlyph: PropTypes.string,
        style: PropTypes.object,
        buttonSize: PropTypes.string,
        inputStyle: PropTypes.object,
        attributes: PropTypes.array,
        minPasswordSize: PropTypes.number,
        hidePasswordFields: PropTypes.bool,
        buttonTooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    };

    static defaultProps = {
        user: {},
        onClose: () => {},
        onChange: () => {},
        onSave: () => {},
        options: {},
        useModal: true,
        closeGlyph: "",
        style: {},
        buttonSize: "small",
        includeCloseButton: true,
        attributes: [{
            name: "email"
        }, {
            name: "company"
        }, {
            name: "notes"
        }],
        inputStyle: {
            height: "32px",
            width: "260px",
            marginTop: "3px",
            marginBottom: "20px",
            padding: "5px",
            border: "1px solid #078AA3"
        },
        minPasswordSize: 6,
        hidePasswordFields: false
    };

    state = {
        key: 1
    };
    // Only to keep the selected button, not for the modal window

    getAttributeValue = (name) => {
        let attrs = this.props.user && this.props.user.attribute;
        if (attrs) {
            let index = findIndex(attrs, a => a.name === name);
            return attrs[index] && attrs[index].value;
        }
        return null;
    };

    getPwStyle = () => {
        if (!this.props.user || !this.props.user.newPassword) {
            return null;
        }
        let pw = this.props.user.newPassword;
        const validation = this.isMainPasswordValid(pw);
        return validation.valid ? "success" : "error";
    };

    getPwValidationMeta = () => {
        if (!this.props.user || !this.props.user.newPassword) {
            return {
                valid: true,
                message: "user.passwordMessage",
                args: null
            };
        }

        let pw = this.props.user.newPassword;
        const validation = this.isMainPasswordValid(pw);
        return validation;
    }

    renderPasswordFields = () => {
        const validation = this.getPwValidationMeta();
        const tooltipId = validation.message;
        const args = validation.args;

        return (
            <div>
                <FormGroup validationState={this.getPwStyle()}>
                    <ControlLabel><Message msgId="user.password"/>
                        {' '}<span style={{ fontWeight: 'bold' }}>*</span>
                        <GlyphiconTooltip tooltipId={tooltipId} args={args} tooltipPosition="right"
                            glyph="info-sign" style={{position: "relative", marginLeft: "10px", display: "inline-block", width: 24}}
                            helpText="Password must contain at least 6 characters"/>
                    </ControlLabel>
                    <FormControl ref="newPassword"
                        inputRef={node => {this.newPasswordField = node;}}
                        key="newPassword"
                        type="password"
                        name="newPassword"
                        autoComplete="new-password"
                        style={this.props.inputStyle}
                        onChange={this.handleChange} />
                </FormGroup>
                <FormGroup validationState={ (this.isValidPassword() ? "success" : "error") }>
                    <ControlLabel><Message msgId="user.retypePwd"/>{' '}<span style={{ fontWeight: 'bold' }}>*</span></ControlLabel>
                    <FormControl ref="confirmPassword"
                        inputRef={node => {this.confirmPasswordField = node;}}
                        key="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        style={this.props.inputStyle}
                        onChange={this.handleChange} />
                </FormGroup>
            </div>
        );
    };

    renderGeneral = () => {
        return (<div style={{clear: "both", marginTop: "10px"}}>
            <FormGroup>
                <ControlLabel><Message msgId="user.username"/>{' '}<span style={{ fontWeight: 'bold' }}>*</span></ControlLabel>
                <FormControl ref="name"
                    key="name"
                    type="text"
                    name="name"
                    readOnly={this.props.user && this.props.user.id}
                    style={this.props.inputStyle}
                    onChange={this.handleChange}
                    value={this.props.user && this.props.user.name || ""}/>
            </FormGroup>
            {this.props.hidePasswordFields ? null : this.renderPasswordFields() }
            <select name="role" style={this.props.inputStyle} onChange={this.handleChange} value={this.props.user && this.props.user.role || ""}>
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER</option>
            </select>
            <FormGroup>
                <ControlLabel style={{"float": "left", marginRight: "10px"}}><Message msgId="users.enabled"/></ControlLabel>
                <Checkbox
                    defaultChecked={this.props.user && (this.props.user.enabled === undefined ? false : this.props.user.enabled)}
                    type="checkbox"
                    key={"enabled" + (this.props.user ? this.props.user.enabled : "missing")}
                    name="enabled"
                    onClick={(evt) => {this.props.onChange("enabled", evt.target.checked ? true : false); }} />
            </FormGroup>
            <div style={{ fontStyle: 'italic' }}><Message msgId="users.requiredFiedsMessage"/></div>
        </div>);
    };

    renderAttributes = () => {
        return this.props.attributes.map((attr, index) => {
            return (<FormGroup key={"form-n-" + index} style={{marginTop: "10px"}}>
                <ControlLabel>{attr.name}</ControlLabel>
                <FormControl ref={"attribute." + attr.name}
                    key={"attribute." + attr.name}
                    name={"attribute." + attr.name}
                    type="text"
                    style={this.props.inputStyle}
                    onChange={this.handleChange}
                    value={this.getAttributeValue(attr.name) || ""} /></FormGroup>);
        });
    };

    renderSaveButtonContent = () => {
        let status = this.props.user && this.props.user.status;
        let defaultMessage = this.props.user && this.props.user.id ? <Message key="text" msgId="users.saveUser"/> : <Message key="text" msgId="users.createUser" />;
        let messages = {
            error: defaultMessage,
            success: defaultMessage,
            modified: defaultMessage,
            save: <Message key="text" msgId="users.saveUser"/>,
            saving: <Message key="text" msgId="users.savingUser" />,
            saved: <Message key="text" msgId="users.userSaved" />,
            creating: <Message key="text" msgId="users.creatingUser" />,
            created: <Message key="text" msgId="users.userCreated" />
        };
        let message = messages[status] || defaultMessage;
        return [this.isSaving() ? <Spinner key="saving-spinner" spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/> : null, message];
    };

    renderButtons = () => {
        let CloseBtn = <CloseConfirmButton status={this.props.user && this.props.user.status} onClick={this.close}/>;
        return [
            <Button key="save" bsSize={this.props.buttonSize}
                bsStyle={this.isSaved() ? "success" : "primary" }
                onClick={() => this.props.onSave(this.props.user)}
                disabled={!this.isValid() || this.isSaving()}>
                {this.renderSaveButtonContent()}</Button>,
            CloseBtn
        ];
    };

    renderGroups = () => {
        return <UserGroups onUserGroupsChange={this.props.onChange} user={this.props.user} groups={this.props.groups} />;
    };

    renderError = () => {
        let error = this.props.user && this.props.user.status === "error";
        if ( error ) {
            let lastError = this.props.user && this.props.user.lastError;
            return <Alert key="error" bsStyle="warning"><Message msgId="users.errorSaving" />{lastError && lastError.statusText}</Alert>;
        }
        return null;
    };

    render() {
        return (<Dialog modal draggable={false} maskLoading={this.props.user && (this.props.user.status === "loading" || this.props.user.status === "saving")} id="mapstore-user-dialog" className="user-edit-dialog" style={assign({}, this.props.style, {display: this.props.show ? "block" : "none"})}>

            <span role="header">
                <span className="user-panel-title">{(this.props.user && this.props.user.name) || <Message msgId="users.newUser" />}</span>
                <button onClick={this.close} className="login-panel-close close">
                    {this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span><Glyphicon glyph="1-close"/></span>}
                </button>
            </span>
            <div role="body">
                <Tabs justified defaultActiveKey={1} onSelect={ ( key) => { this.setState({key}); }} key="tab-panel" id="userDetails-tabs">
                    <Tab eventKey={1} title={<Glyphicon glyph="user" style={{ display: 'block', padding: 8 }}/>} >
                        {this.renderGeneral()}
                    </Tab>
                    <Tab eventKey={2} title={<Glyphicon glyph="info-sign" style={{ display: 'block', padding: 8 }}/>} >
                        {this.renderAttributes()}
                    </Tab>
                    <Tab eventKey={3} title={<Glyphicon glyph="1-group" style={{ display: 'block', padding: 8 }}/>} >
                        {this.renderGroups()}
                    </Tab>
                </Tabs>
            </div>
            <div role="footer">
                {this.renderError()}
                {this.renderButtons()}
            </div>
        </Dialog>);
    }

    close = () => {
        this.props.onClose();
        this.newPasswordField.value = '';
        this.confirmPasswordField.value = '';
    }

    isMainPasswordValid = (password) => {
        const validation = {
            valid: true,
            message: "user.passwordMessage",
            args: null
        };
        let p = password || this.props.user.newPassword || "";

        // Empty password field will signal the GeoStoreDAO not to change the password
        if (p === "" && this.props.user && this.props.user.id) {
            return validation;
        }

        if (p.length < this.props.minPasswordSize) {
            return {
                valid: false,
                message: "user.passwordMinlenght",
                args: this.props.minPasswordSize
            };
        }

        if (/[^a-zA-Z0-9\!\@\#\$\%\&\*\_]/.test(p)) {
            return {
                valid: false,
                message: "user.passwordInvalidChar",
                args: p.match(/[^a-zA-Z0-9\!\@\#\$\%\&\*\_]/).toString()
            };
        }

        return validation;
    };

    isSaving = () => {
        return this.props.user && this.props.user.status === "saving";
    };

    isSaved = () => {
        return this.props.user && (this.props.user.status === "saved" || this.props.user.status === "created");
    };

    isValid = () => {
        let user = this.props.user;
        return user && user.name && user.status === "modified" && this.isValidPassword();
    };

    isValidPassword = () => {
        let user = this.props.user;
        return user && this.isMainPasswordValid(user.newPassword).valid && (user.confirmPassword === user.newPassword);
    };

    handleChange = (event) => {
        this.props.onChange(event.target.name, event.target.value);
        // this.setState(() => ({[event.target.name]: event.target.value}));
    };
}

module.exports = UserDialog;
