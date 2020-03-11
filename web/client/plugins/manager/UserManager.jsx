const PropTypes = require('prop-types');
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
const {editUser} = require('../../actions/users');
const {getUsers, usersSearchTextChanged} = require('../../actions/users');
const SearchBar = require("../../components/search/SearchBar").default;
const UserGrid = require('./users/UserGrid');
const UserDialog = require('./users/UserDialog');
const UserDeleteConfirm = require('./users/UserDeleteConfirm');
const Message = require('../../components/I18N/Message');
const assign = require('object-assign');
const {trim} = require('lodash');

class UserManager extends React.Component {
    static propTypes = {
        onNewUser: PropTypes.func,
        splitTools: PropTypes.bool,
        isSearchClickable: PropTypes.bool,
        className: PropTypes.string,
        hideOnBlur: PropTypes.bool,
        placeholderMsgId: PropTypes.string,
        typeAhead: PropTypes.bool,
        searchText: PropTypes.string,
        onSearch: PropTypes.func,
        onSearchReset: PropTypes.func,
        onSearchTextChange: PropTypes.func,
        start: PropTypes.number,
        limit: PropTypes.number
    };

    static defaultProps = {
        className: "user-search",
        hideOnBlur: false,
        isSearchClickable: true,
        splitTools: false,
        placeholderMsgId: "users.searchUsers",
        typeAhead: false,
        searchText: "",
        start: 0,
        limit: 20,
        onSearch: () => {},
        onSearchReset: () => {},
        onSearchTextChange: () => {},
        onNewUser: () => {}
    };

    onNew = () => {
        this.props.onNewUser();
    };

    render() {
        return (<div>
            <SearchBar
                className={this.props.className}
                splitTools={this.props.splitTools}
                isSearchClickable={this.props.isSearchClickable}
                hideOnBlur={this.props.hideOnBlur}
                placeholderMsgId ={this.props.placeholderMsgId}
                onSearch={this.props.onSearch}
                onSearchReset={this.props.onSearchReset}
                onSearchTextChange={this.props.onSearchTextChange}
                typeAhead={this.props.typeAhead}
                searchText={this.props.searchText}/>
            <Grid style={{marginBottom: "10px"}} fluid>
                <h1 className="usermanager-title"><Message msgId={"users.users"}/></h1>
                <Button style={{marginRight: "10px"}} bsStyle="success" onClick={this.onNew}>&nbsp;<span><Glyphicon glyph="1-user-add" /><Message msgId="users.newUser" /></span></Button>
            </Grid>
            <UserGrid />
            <UserDialog />
            <UserDeleteConfirm />
        </div>);
    }
}

module.exports = {
    UserManagerPlugin: assign(
        connect((state) => {
            let searchState = state && state.users;
            return {
                start: searchState && searchState.start,
                limit: searchState && searchState.limit,
                searchText: searchState && searchState.searchText && trim(searchState.searchText, '*') || ""
            };
        },
        {
            onNewUser: editUser.bind(null, {role: "USER", "enabled": true}),
            onSearchTextChange: usersSearchTextChanged,
            onSearch: getUsers
        }, (stateProps, dispatchProps, ownProps) => {
            return {
                ...stateProps,
                ...dispatchProps,
                ...ownProps,
                onSearchReset: (text) => {
                    let limit = stateProps.limit;
                    let searchText = text && text !== "" ? "*" + text + "*" : "*";
                    dispatchProps.onSearch(searchText, {params: {start: 0, limit}});
                },
                onSearch: (text) => {
                    let limit = stateProps.limit;
                    let searchText = text && text !== "" ? "*" + text + "*" : "*";
                    dispatchProps.onSearch(searchText, {params: {start: 0, limit}});
                }
            };
        })(UserManager), {
            hide: true,
            Manager: {
                id: "usermanager",
                name: 'usermanager',
                position: 1,
                priority: 1,
                title: <Message msgId="users.manageUsers" />,
                glyph: "1-user-mod"
            }}),
    reducers: {
        users: require('../../reducers/users')
    }
};
