/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const SearchBar = require('./users/SearchBar');
const UserGrid = require('./users/UserGrid');
const UserDialog = require('./users/UserDialog');
const TopButtons = require('./users/TopButtons');
const UserDeleteConfirm = require('./users/UserDeleteConfirm');
const Message = require('../../components/I18N/Message');
const assign = require('object-assign');

const UserManager = React.createClass({
    render() {
        return (<div>
            <SearchBar />
            <TopButtons />
            <UserGrid />
            <UserDialog />
            <UserDeleteConfirm />
    </div>);
    }
});
module.exports = {
    UserManagerPlugin: assign(UserManager, {
    hide: true,
    Manager: {
        id: "usermanager",
        name: 'usermanager',
        position: 1,
        title: <Message msgId="users.title" />,
        glyph: "1-group-mod"
    }}),
    reducers: {
        users: require('../../reducers/users')
    }
};
