
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {connect} = require('react-redux');


const {getUsers, usersSearchTextChanged} = require('../../../actions/users');
const {getUserGroups, groupSearchTextChanged} = require('../../../actions/usergroups');

const {trim} = require('lodash');
const USERS = "users";
// const GROUPS = "groups";
const SearchBar = connect((state) => {
    let tool = state && state.controls && state.controls.managerchoice && state.controls.managerchoice.selectedTool;
    let searchState = tool === USERS ? (state && state.users) : (state && state.usergroups);
    return {
        tool,
        className: "user-search",
        hideOnBlur: false,
        placeholderMsgId: tool === USERS ? "users.searchUsers" : "usergroups.searchGroups",
        typeAhead: false,
        start: searchState && searchState.start,
        limit: searchState && searchState.limit,
        searchText: (searchState && searchState.searchText && trim(searchState.searchText, '*')) || ""
    };
}, {
    usersSearchTextChanged, groupSearchTextChanged,
    onSearchUser: (text, options) => {
        let searchText = (text && text !== "") ? ("*" + text + "*") : "*";
        return getUsers(searchText, options);
    },
    onSearchGroup: (text, options) => {
        let searchText = (text && text !== "") ? ("*" + text + "*") : "*";
        return getUserGroups(searchText, options);
    }
}, (stateProps, dispatchProps) => {
    return {
        ...stateProps,
        onSearch: (text) => {
            let limit = stateProps.limit;
            if (stateProps.tool === USERS) {
                dispatchProps.onSearchUser(text, {params: {start: 0, limit}});
            } else {
                dispatchProps.onSearchGroup(text, {params: {start: 0, limit}});
            }
        },
        onSearchReset: () => {
            if (stateProps.tool === USERS) {
                dispatchProps.onSearchUser();
            } else {
                dispatchProps.onSearchGroup();
            }
        },
        onSearchTextChange: (text) => {
            if (stateProps.tool === USERS) {
                dispatchProps.usersSearchTextChanged(text);
            } else {
                dispatchProps.groupSearchTextChanged(text);
            }
        }
    };
})(require("../../../components/mapcontrols/search/SearchBar"));

module.exports = SearchBar;
