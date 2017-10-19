/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const INSERT = "WIDGETS:INSERT";
const uuid = require('uuid/v1');

const insertWidget = (widget, target = "floating") => ({
    type: INSERT,
    target,
    id: uuid(),
    widget
});


module.exports = {
    INSERT,
    insertWidget
};
