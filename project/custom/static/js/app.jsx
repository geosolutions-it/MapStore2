/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import StandardApp from '../MapStore2/web/client/components/app/StandardApp';
import StandardRouterComp from '../MapStore2/web/client/components/app/StandardRouter';
import StandardStore from '../MapStore2/web/client/components/stores/StandardStore';

import {pages, pluginsDef, initialState, storeOpts} from './appConfig';

import { checkForMissingPlugins } from '../MapStore2/web/client/utils/DebugUtils';

checkForMissingPlugins(pluginsDef.plugins);
const StandardRouter = connect((state) => ({
    locale: state.locale || {},
    pages
}))(StandardRouterComp);

const appStore = StandardStore.bind(null, { initialState });

const appConfig = {
    storeOpts,
    appStore,
    pluginsDef,
    initialActions: [],
    appComponent: StandardRouter
};

ReactDOM.render(
    <StandardApp {...appConfig}/>,
    document.getElementById('container')
);
