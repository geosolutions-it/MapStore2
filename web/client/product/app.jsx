/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Editor = require('../components/data/featuregrid/editors/AttributeEditor');
const NumberEditor = require('../components/data/featuregrid/editors/NumberEditor');
const AutocompleteEditor = require('../components/data/featuregrid/editors/AutocompleteEditor');

const ReactDOM = require('react-dom');
const assign = require('object-assign');
const {connect} = require('react-redux');
const LocaleUtils = require('../utils/LocaleUtils');

const startApp = () => {
    const ConfigUtils = require('../utils/ConfigUtils');
    const {loadMaps} = require('../actions/maps');
    const {loadVersion} = require('../actions/version');
    const StandardApp = require('../components/app/StandardApp');
    const {setupCustomEditors} = require('../actions/featuregrid');

    const {pages, pluginsDef, initialState, storeOpts, appEpics = {}} = require('./appConfig');

    const StandardRouter = connect((state) => ({
        locale: state.locale || {},
        pages
    }))(require('../components/app/StandardRouter'));

    const appStore = require('../stores/StandardStore').bind(null, initialState, {
        maptype: require('../reducers/maptype'),
        maps: require('../reducers/maps')
    }, appEpics);

    const defaultEditors = {
        "My_Custom_Editor_1": (editorProps) => {
            return {
            "defaultEditor": (props) => <Editor {...assign({}, props, editorProps)}/>,
            "int": (props) => <NumberEditor dataType="int" inputProps={{step: 1, type: "number"}} {...assign({}, props, editorProps)}/>,
            "string": (props) => props.autocompleteEnabled ?
                <AutocompleteEditor dataType="string" {...assign({}, props, editorProps)}/> :
                <Editor dataType="string" {...assign({}, props, editorProps)}/>
        }; }
    };

    const initialActions = [
        () => loadMaps(ConfigUtils.getDefaults().geoStoreUrl, ConfigUtils.getDefaults().initialMapFilter || "*"),
        () => setupCustomEditors(defaultEditors),
        loadVersion
    ];

    const appConfig = {
        storeOpts,
        appEpics,
        appStore,
        pluginsDef,
        initialActions,
        appComponent: StandardRouter,
        printingEnabled: true
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
