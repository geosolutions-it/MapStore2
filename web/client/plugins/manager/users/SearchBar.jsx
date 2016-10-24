/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {connect} = require('react-redux');


const {getUsers, usersSearchTextChanged} = require('../../../actions/users');

const {trim} = require('lodash');

const SearchBar = connect((state) => ({
    className: "user-search",
    hideOnBlur: false,
    placeholderMsgId: "users.searchUsers",
    typeAhead: false,
    start: state && state.users && state.users.start,
    limit: state && state.users && state.users.limit,
    searchText: (state.users && state.users.searchText && trim(state.users.searchText, '*')) || ""
}), {
    onSearchTextChange: usersSearchTextChanged,
    onSearch: (text, options) => {
        let searchText = (text && text !== "") ? ("*" + text + "*") : "*";
        return getUsers(searchText, options);
    },
    onSearchReset: getUsers.bind(null, "*")
}, (stateProps, dispatchProps) => {
    return {
        ...stateProps,
        onSearch: (text) => {
            let limit = stateProps.limit;
            dispatchProps.onSearch(text, {params: {start: 0, limit}});
        },
        onSearchReset: () => {
            dispatchProps.onSearchReset({params: {start: 0, limit: stateProps.limit}});
        },
        onSearchTextChange: dispatchProps.onSearchTextChange
    };
})(require("../../../components/mapcontrols/search/SearchBar"));

module.exports = SearchBar;
