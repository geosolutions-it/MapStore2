/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {compose, withState} = require('recompose');


module.exports = compose(
    withState('newGroup', 'onNewGroupChoose'),
    withState('newPermission', 'onNewPermissionChoose')
);
