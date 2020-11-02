/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';

import main from '../components/app/main';
import StandardApp from '../components/app/StandardApp';
import withExtensions from '../components/app/withExtensions';
import StandardRouter from '../components/app/StandardRouter';

import { loadVersion } from '../actions/version';
import { themeLoaded } from '../actions/theme';

import { updateMapLayoutEpic } from '../epics/maplayout';
import { setSupportedLocales } from '../epics/localconfig';
import { readQueryParamsOnMapEpic } from '../epics/queryparams';

import maptype from '../reducers/maptype';
import maps from '../reducers/maps';
import maplayout from '../reducers/maplayout';
import version from '../reducers/version';
import mapPopups from '../reducers/mapPopups';

import { versionSelector } from '../selectors/version';
import { loadAfterThemeSelector } from '../selectors/config';

import {
    standardReducers,
    standardEpics,
    standardRootReducerFunc
} from '../stores/defaultOptions';

export default (config = {}, pluginsDef, overrideConfig = cfg => cfg) => {

    const {
        // store config
        initialState,
        appEpics: configAppEpics = {},
        baseEpics,
        appReducers: configAppReducers = {},
        baseReducers,
        // app config
        storeOpts,
        pages,
        printingEnabled = true,
        themeCfg = {},
        mode
    } = config;

    const appComponent = connect((state) => ({
        locale: state.locale || {},
        pages,
        themeCfg,
        version: versionSelector(state),
        loadAfterTheme: loadAfterThemeSelector(state),
        themeLoaded: state.theme && state.theme.loaded
    }), {
        onThemeLoaded: themeLoaded
    })(StandardRouter);

    const appReducers = {
        ...(baseReducers
            ? baseReducers
            : {
                maptype,
                maps,
                maplayout,
                version,
                mapPopups,
                ...configAppReducers
            }),

        ...standardReducers
    };

    const appEpics = {
        ...(baseEpics
            ? baseEpics
            : {
                updateMapLayoutEpic,
                setSupportedLocales,
                readQueryParamsOnMapEpic,
                ...configAppEpics
            }),

        ...standardEpics
    };

    const initialActions = [
        loadVersion
    ];

    const appConfig = overrideConfig({
        // store config
        initialState,
        appReducers,
        appEpics,
        rootReducerFunc: standardRootReducerFunc,
        // app config
        pluginsDef,
        storeOpts,
        initialActions,
        appComponent,
        printingEnabled,
        themeCfg,
        mode
    });

    const App = withExtensions(StandardApp);

    return main(appConfig, App);
};
