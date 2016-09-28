/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {deleteUser} = require('../../../actions/users');
const {Alert} = require('react-bootstrap');
const Confirm = require('../../../components/misc/ConfirmDialog');
const UserCard = require('../../../components/manager/users/UserCard');

const UserDeleteConfirm = React.createClass({
    propTypes: {
        user: React.PropTypes.object,
        deleteUser: React.PropTypes.func,
        deleteId: React.PropTypes.number,
        deleteError: React.PropTypes.object,
        deleteStatus: React.PropTypes.string

    },
    getDefaultProps() {
        return {
            deleteUser: () => {}
        };
    },
    renderError() {
        if (this.props.deleteError) {
            return <Alert bsStyle="danger">{"Error deleting user: "}{this.props.deleteError.statusText}</Alert>;
        }
    },
    renderConfirmButtonContent() {
        switch (this.props.deleteStatus) {
            case "deleting":
                return "Deleting...";
            default:
                return "Delete";
        }
    },
    render() {
        if (!this.props.user) {
            return null;
        }
        return (<Confirm
            show={!!this.props.user}
            onClose={() => this.props.deleteUser(this.props.deleteId, "cancelled")}
            onConfirm={ () => { this.props.deleteUser(this.props.deleteId, "delete"); } }
            confirmButtonContent={this.renderConfirmButtonContent()}
            confirmButtonDisabled={this.props.deleteStatus === "deleting"}>
            <div>Are you sure you want to delete this user:</div>
            <div style={{margin: "10px 0"}}><UserCard user={this.props.user} /></div>
            <div>{this.renderError()}</div>
        </Confirm>);
    }
});
module.exports = connect((state) => {
    let usersState = state && state.users;
    if (!usersState) return {};
    let users = usersState && usersState.users;
    let deleteId = usersState.deletingUser && usersState.deletingUser.id;
    if (users && deleteId) {
        let index = users.findIndex((user) => user.id === deleteId);
        let user = users[index];
        return {
            user,
            deleteId,
            deleteError: usersState.deletingUser.error,
            deleteStatus: usersState.deletingUser.status
        };
    }
    return {
        deleteId
    };
}, {deleteUser} )(UserDeleteConfirm);
