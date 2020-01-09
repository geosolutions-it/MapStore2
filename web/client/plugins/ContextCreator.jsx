/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import ConfigUtils from '../utils/ConfigUtils';
import {createPlugin} from '../utils/PluginsUtils';
import {newContextSelector, resourceSelector, creationStepSelector, reloadConfirmSelector, isLoadingSelector,
    isValidContextNameSelector} from '../selectors/contextcreator';
import {mapTypeSelector} from '../selectors/maptype';
import {setCreationStep, changeAttribute, saveNewContext, mapViewerReload,
    showMapViewerReloadConfirm} from '../actions/contextcreator';
import contextcreator from '../reducers/contextcreator';
import * as epics from '../epics/contextcreator';
import ContextCreator from '../components/contextcreator/ContextCreator';

/**
 * Plugin for creation of Contexts.
 * @memberof plugins
 * @name ContextCreator
 * @class
 * @prop {string} cfg.saveDestLocation router path when the application is redirected when a context is saved
 *
 */
export default createPlugin('ContextCreator', {
    component: connect(createStructuredSelector({
        curStepId: creationStepSelector,
        newContext: newContextSelector,
        resource: resourceSelector,
        mapType: mapTypeSelector,
        showReloadConfirm: reloadConfirmSelector,
        loading: isLoadingSelector,
        isValidContextName: isValidContextNameSelector,
        pluginsConfig: () => ConfigUtils.getConfigProp('plugins')
    }), {
        onSetStep: setCreationStep,
        onChangeAttribute: changeAttribute,
        onSave: saveNewContext,
        onMapViewerReload: mapViewerReload,
        onReloadConfirm: showMapViewerReloadConfirm
    })(ContextCreator),
    reducers: {
        contextcreator
    },
    epics
});
