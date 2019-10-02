/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const { changeEditorSetting } = require('../../../actions/widgets');
const {getEditorSettings} = require('../../../selectors/widgets');
module.exports = connect( createSelector(
    getEditorSettings,
    ({ editNode } = {}) => ({
        editNode
    })
), {
    setEditNode: node => changeEditorSetting('editNode', node),
    closeNodeEditor: () => changeEditorSetting('editNode', undefined)
});
