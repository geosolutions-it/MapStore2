/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const UsersTable = require('./UsersTable');
const {Alert, Tabs, Tab, Button, Glyphicon, FormControl, FormGroup, ControlLabel} = require('react-bootstrap');
const PropTypes = require('prop-types');

const Dialog = require('../../../components/misc/Dialog');
const assign = require('object-assign');
const Message = require('../../../components/I18N/Message');
const Spinner = require('react-spinkit');
const {findIndex} = require('lodash');
const PagedCombobox = require('../../misc/combobox/PagedCombobox');
const CloseConfirmButton = require('./CloseConfirmButton').default;

require('./style/userdialog.css');

const PAGINATION_LIMIT = 5;

/**
 * A Modal window to show password reset form
 */
class GroupDialog extends React.Component {
    static propTypes = {
        // props
        group: PropTypes.object,
        users: PropTypes.array,
        availableUsers: PropTypes.array,
        availableUsersCount: PropTypes.number,
        searchUsers: PropTypes.func,
        availableUsersLoading: PropTypes.bool,
        show: PropTypes.bool,
        onClose: PropTypes.func,
        onChange: PropTypes.func,
        onSave: PropTypes.func,
        modal: PropTypes.bool,
        closeGlyph: PropTypes.string,
        style: PropTypes.object,
        buttonSize: PropTypes.string,
        descLimit: PropTypes.number,
        nameLimit: PropTypes.number,
        inputStyle: PropTypes.object
    };

    static contextTypes = {
        intl: PropTypes.object
    };

    static defaultProps = {
        group: {},
        availableUsers: [],
        searchUsers: () => {},
        onClose: () => {},
        onChange: () => {},
        onSave: () => {},
        options: {},
        useModal: true,
        closeGlyph: "",
        descLimit: 255,
        nameLimit: 255,
        style: {},
        buttonSize: "small",
        includeCloseButton: true,
        inputStyle: {
            height: "32px",
            width: "260px",
            marginTop: "3px",
            marginBottom: "20px",
            padding: "5px",
            border: "1px solid #078AA3"
        }
    };

    state = {
        key: 1,
        openSelectMember: false,
        selectedMember: ''
    };

    componentDidMount() {
        this.selectMemberPage = 0;
        this.searchUsers();
    }
    // Only to keep the selected button, not for the modal window

    getCurrentGroupMembers = () => {
        return this.props.group && (this.props.group.newUsers || this.props.group.users) || [];
    };

    renderGeneral = () => {
        return (<div style={{clear: "both", marginTop: "10px"}}>
            <FormGroup>
                <ControlLabel><Message msgId="usergroups.groupName"/>{' '}<span style={{ fontWeight: 'bold' }}>*</span></ControlLabel>
                <FormControl ref="groupName"
                    key="groupName"
                    type="text"
                    name="groupName"
                    readOnly={this.props.group && this.props.group.id}
                    style={this.props.inputStyle}
                    onChange={this.handleChange}
                    maxLength={this.props.nameLimit}
                    value={this.props.group && this.props.group.groupName || ""}/>
            </FormGroup>
            <FormGroup>
                <ControlLabel><Message msgId="usergroups.groupDescription"/></ControlLabel>
                <FormControl componentClass="textarea"
                    ref="description"
                    key="description"
                    name="description"
                    maxLength={this.props.descLimit}
                    readOnly={this.props.group && this.props.group.id}
                    style={this.props.inputStyle}
                    onChange={this.handleChange}
                    value={this.props.group && this.props.group.description || ""}/>
            </FormGroup>
            <div style={{ fontStyle: 'italic' }}><Message msgId="users.requiredFiedsMessage"/></div>
        </div>);
    };

    renderSaveButtonContent = () => {
        let defaultMessage = this.props.group && this.props.group.id ? <Message key="text" msgId="usergroups.saveGroup"/> : <Message key="text" msgId="usergroups.createGroup" />;
        let messages = {
            error: defaultMessage,
            success: defaultMessage,
            modified: defaultMessage,
            save: <Message key="text" msgId="usergroups.saveGroup"/>,
            saving: <Message key="text" msgId="usergroups.savingGroup" />,
            saved: <Message key="text" msgId="usergroups.groupSaved" />,
            creating: <Message key="text" msgId="usergroups.creatingGroup" />,
            created: <Message key="text" msgId="usergroups.groupCreated" />
        };
        let message = messages[status] || defaultMessage;
        return [this.isSaving() ? <Spinner key="saving-spinner" spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/> : null, message];
    };

    renderButtons = () => {
        let CloseBtn = <CloseConfirmButton status={this.props.group && this.props.group.status} onClick={this.props.onClose}/>;
        return [
            <Button key="save" bsSize={this.props.buttonSize}
                bsStyle={this.isSaved() ? "success" : "primary" }
                onClick={() => this.props.onSave(this.props.group)}
                disabled={!this.isValid() || this.isSaving()}>
                {this.renderSaveButtonContent()}</Button>,
            CloseBtn
        ];
    };

    renderError = () => {
        let error = this.props.group && this.props.group.status === "error";
        if ( error ) {
            let lastError = this.props.group && this.props.group.lastError;
            return <Alert key="error" bsStyle="warning"><Message msgId="usergroups.errorSaving" />{lastError && lastError.statusText}</Alert>;
        }
        return null;
    };

    renderMembers = () => {
        let members = this.getCurrentGroupMembers();
        if (!members || members.length === 0) {
            return (<div style={{
                width: "100%",
                textAlign: "center"
            }}><Message msgId="usergroups.noUsers"/></div>);
        }
        // NOTE: faking group Id
        return (<UsersTable users={[...members].sort((u1, u2) => u1.name > u2.name)} onRemove={(user) => {
            let id = user.id;
            let newUsers = this.getCurrentGroupMembers().filter(u => u.id !== id);
            this.props.onChange("newUsers", newUsers);
        }}/>);
    };


    renderMembersTab = () => {
        let availableUsers = this.props.availableUsers.filter((user) => findIndex(this.getCurrentGroupMembers(), member => member.id === user.id) < 0).map(u => ({ value: u.id, label: u.name }));
        const pagination = {
            firstPage: this.selectMemberPage === 0,
            lastPage: this.isLastPage(),
            loadNextPage: this.loadNextPageMembers,
            loadPrevPage: this.loadPrevPageMembers,
            paginated: true
        };
        const placeholder = this.context.intl ? this.context.intl.formatMessage({id: 'usergroups.selectMemberPlaceholder'}) : '';
        return (<div style={{ marginTop: "10px" }}>
            <label key="member-label" className="control-label"><Message msgId="usergroups.groupMembers" /></label>
            <div key="member-list" style={
                {
                    maxHeight: "200px",
                    padding: "5px",
                    overflow: "auto",
                    boxShadow: "inset 0 2px 5px 0 #AAA"
                }} >{this.renderMembers()}</div>
            <div key="add-member" style={{ marginTop: "10px" }}>
                <label key="add-member-label" className="control-label"><Message msgId="usergroups.addMember" /></label>
                <PagedCombobox
                    busy={this.props.availableUsersLoading}
                    data={availableUsers}
                    open={this.state.openSelectMember}
                    onToggle={this.handleToggleSelectMember}
                    onChange={this.handleSelectMemberOnChange}
                    placeholder={placeholder}
                    pagination={pagination}
                    selectedValue={this.state.selectedMember}
                    onSelect={this.handleSelect}
                    stopPropagation
                />
            </div>
        </div>);
    };

    render() {
        return (<Dialog
            modal
            maskLoading={this.props.group && (this.props.group.status === "loading" || this.props.group.status === "saving")}
            id="mapstore-group-dialog"
            className="group-edit-dialog"
            style={assign({}, this.props.style, {display: this.props.show ? "block" : "none"})}
            draggable={false}
        >
            <span role="header">
                <button onClick={this.props.onClose} className="login-panel-close close">
                    {this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span><Glyphicon glyph="1-close"/></span>}
                </button>
                <span className="user-panel-title">{(this.props.group && this.props.group.groupName) || <Message msgId="usergroups.newGroup" />}</span>
            </span>
            <div role="body">
                <Tabs justified defaultActiveKey={1} onSelect={ ( key) => { this.setState({key}); }} key="tab-panel">
                    <Tab eventKey={1} title={<Glyphicon glyph="1-group" style={{ display: 'block', padding: 8 }} />} >
                        {this.renderGeneral()}
                        {this.checkNameLenght()}
                        {this.checkDescLenght()}
                    </Tab>
                    <Tab eventKey={2} title={<Glyphicon glyph="1-group-add" style={{ display: 'block', padding: 8 }} />} >
                        {this.renderMembersTab()}
                    </Tab>
                </Tabs>
            </div>
            <div role="footer">
                {this.renderError()}
                {this.renderButtons()}
            </div>
        </Dialog>);
    }

    // check if pagination last page
    isLastPage = () => {
        return (this.selectMemberPage + PAGINATION_LIMIT) > this.props.availableUsersCount;
    }

    // called before onChange
    handleSelect = () => {
        this.selected = true;
    };

    handleToggleSelectMember = () => {
        this.setState(prevState => ({
            openSelectMember: !prevState.openSelectMember
        }));
    }

    handleSelectMemberOnChange = (selected) => {
        if (typeof selected === 'string') {
            this.selectMemberPage = 0;
            this.setState({selectedMember: selected});
            this.searchUsers(selected, true);
            return;
        }

        if (this.selected) {
            this.selected = false;
            let value = selected.value;
            let newMemberIndex = findIndex(this.props.availableUsers, u => u.id === value);
            if (newMemberIndex >= 0) {
                let newMember = this.props.availableUsers[newMemberIndex];
                let newUsers = this.getCurrentGroupMembers();
                newUsers = [...newUsers, newMember];
                this.props.onChange("newUsers", newUsers);
                this.setState({selectedMember: '', openSelectMember: false});
                this.searchUsers('*', true);
            }
            return;
        }
        if (selected.value) {
            this.setState({selectedMember: selected.label});
            this.selectMemberPage = 0;
        }
    }

    loadNextPageMembers = () => {
        if (this.selectMemberPage === 0) {
            this.selectMemberPage = this.selectMemberPage + PAGINATION_LIMIT + 1;
        } else {
            this.selectMemberPage = this.selectMemberPage + PAGINATION_LIMIT;
        }
        this.searchUsers();
    }

    loadPrevPageMembers = () => {
        this.selectMemberPage = this.selectMemberPage - PAGINATION_LIMIT;
        if (this.selectMemberPage === 1) {
            this.selectMemberPage = 0;
        }
        this.searchUsers();
    }

    searchUsers = (q, textChanged) => {
        const start = this.selectMemberPage;
        const text = textChanged ? q : (typeof this.state.selectedMember === 'string' && this.state.selectedMember ? this.state.selectedMember : q);
        this.props.searchUsers(text, start, PAGINATION_LIMIT);
    }

    checkNameLenght = () => {
        return this.props.group && this.props.group.groupName && this.props.group.groupName.length === this.props.nameLimit ? <div className="alert alert-warning">
            <Message msgId="usergroups.nameLimit"/>
        </div> : null;
    };

    checkDescLenght = () => {
        return this.props.group && this.props.group.description && this.props.group.description.length === this.props.descLimit ? <div className="alert alert-warning">
            <Message msgId="usergroups.descLimit"/>
        </div> : null;
    };

    isSaving = () => {
        return this.props.group && this.props.group.status === "saving";
    };

    isSaved = () => {
        return this.props.group && (this.props.group.status === "saved" || this.props.group.status === "created");
    };

    isValid = () => {
        let valid = true;
        let group = this.props.group;
        if (!group) return false;
        valid = valid && group.groupName && group.status === "modified";
        return valid;
    };

    handleChange = (event) => {
        this.props.onChange(event.target.name, event.target.value);
    };
}

module.exports = GroupDialog;
