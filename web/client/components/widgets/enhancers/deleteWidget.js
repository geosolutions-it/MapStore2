/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {withState} = require('recompose');

/**
 * manage state confirm delete.
 * Can be applied to a widget inside `WidgetContainer` to allow toggle delete confirmation.
 */
module.exports = withState('confirmDelete', 'toggleDeleteConfirm', false);
