/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import LocaleUtils from '../../utils/LocaleUtils';
import StandardApp from '../../components/app/StandardApp';
import StandardRouterComponent from '../../components/app/StandardRouter';
import StandardStore from '../../stores/StandardStore';
import maptype from '../../reducers/maptype';
import { setSupportedLocales } from '../../epics/localconfig';
import axios from '../../libs/ajax';
import { setLocalConfigurationFile } from '../../utils/ConfigUtils';
setLocalConfigurationFile('localConfig.json');

import './assets/custom-styles.less';

const version = 'VERSION';

// list of path that need version parameter
const pathsNeedVersion = [
    'localConfig.json',
    'config.json',
    'translations/'
];

axios.interceptors.request.use(
    config => {
        if (config.url && version && pathsNeedVersion.filter(url => config.url.match(url))[0]) {
            return {
                ...config,
                params: {
                    ...config.params,
                    v: version
                }
            };
        }
        return config;
    }
);

import pluginsDef from './plugins';
import config from './appConfig';

const startApp = () => {
    const { pages, initialState, storeOpts, appEpics = {}, themeCfg } = config;

    const StandardRouter = connect((state) => ({
        locale: state.locale || {},
        pages
    }))(StandardRouterComponent);

    const appStore = StandardStore.bind(null, initialState, {
        maptype
    }, {
        ...appEpics,
        setSupportedLocales
    });

    const initialActions = [];

    const appConfig = {
        storeOpts,
        appEpics,
        appStore,
        pluginsDef,
        initialActions,
        appComponent: StandardRouter,
        printingEnabled: true,
        themeCfg
    };

    ReactDOM.render(
        <StandardApp {...appConfig}/>,
        document.getElementById('container')
    );
};

if (!global.Intl ) {
    // Ensure Intl is loaded, then call the given callback
    LocaleUtils.ensureIntl(startApp);
} else {
    startApp();
}
