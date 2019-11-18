/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import {createPlugin} from '../utils/PluginsUtils';
import {newContextSelector, creationStepSelector} from '../selectors/contextcreator';
import {setCreationStep, changeAttribute, saveNewContext} from '../actions/contextcreator';
import contextcreator from '../reducers/contextcreator';
import * as epics from '../epics/contextcreator';
import ContextCreator from '../components/contextcreator/ContextCreator';

export default createPlugin('ContextCreator', {
    component: connect(createStructuredSelector({
        curStepId: creationStepSelector,
        newContext: newContextSelector
    }), {
        onSetStep: setCreationStep,
        onChangeAttribute: changeAttribute,
        onSave: saveNewContext
    })(ContextCreator),
    reducers: {
        contextcreator
    },
    epics
});
