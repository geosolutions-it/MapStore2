/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const UserGrid = require('./users/UserGrid');
const UserDialog = require('./users/UserDialog');
const TopButtons = require('./users/TopButtons');
const UserManager = React.createClass({
    render() {
        return (<div>
            <TopButtons />
            <UserGrid />
            <UserDialog />
    </div>);
    }
});
module.exports = {
    UserManagerPlugin: UserManager,
    reducers: {
        users: require('../../reducers/users')
    }
};
