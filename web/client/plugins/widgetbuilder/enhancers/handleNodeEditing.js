/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { connect } from 'react-redux';

import { createSelector } from 'reselect';
import { changeEditorSetting } from '../../../actions/widgets';
import { getEditorSettings } from '../../../selectors/widgets';

export default connect( createSelector(
    getEditorSettings,
    ({ editNode } = {}) => ({
        editNode
    })
), {
    setEditNode: node => changeEditorSetting('editNode', node),
    closeNodeEditor: () => changeEditorSetting('editNode', undefined)
});
