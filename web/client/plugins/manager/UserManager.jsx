/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const UserGrid = require('./users/UserGrid');

module.exports = {
    UserManagerPlugin: UserGrid,
    reducers: {
        users: require('../../reducers/users')
    }
};
