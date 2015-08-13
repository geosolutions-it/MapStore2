/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var assign = require('object-assign');
var keymirror = require('keymirror');

var Dispatcher = require('../dispatchers/Dispatcher');

var I18NActions = {
    launch(actionType, args) {
        Dispatcher.dispatch(assign({type: actionType}, args));
    }
};

assign(I18NActions, keymirror({
    CHANGE_LANG: null
}));

module.exports = I18NActions;
