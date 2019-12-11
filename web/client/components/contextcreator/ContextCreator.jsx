/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import * as PropTypes from 'prop-types';
import {keys, findIndex, isObject} from 'lodash';

import Stepper from '../misc/Stepper';
import GeneralSettings from './GeneralSettingsStep';
import ConfigurePlugins from './ConfigurePluginsStep';
import ConfigureMap from './ConfigureMapStep';


export default class ContextCreator extends React.Component {
    static propTypes = {
        curStepId: PropTypes.string,
        newContext: PropTypes.object,
        resource: PropTypes.object,
        plugins: PropTypes.object,
        pluginsConfig: PropTypes.object,
        viewerPlugins: PropTypes.array,
        ignoreViewerPlugins: PropTypes.bool,
        allAvailablePlugins: PropTypes.array,
        editedPlugin: PropTypes.string,
        editedCfg: PropTypes.string,
        availablePluginsFilterText: PropTypes.string,
        enabledPluginsFilterText: PropTypes.string,
        onFilterAvailablePlugins: PropTypes.func,
        onFilterEnabledPlugins: PropTypes.func,
        setSelectedPlugins: PropTypes.func,
        changePluginsKey: PropTypes.func,
        mapType: PropTypes.string,
        showReloadConfirm: PropTypes.bool,
        onSetStep: PropTypes.func,
        onChangeAttribute: PropTypes.func,
        onSave: PropTypes.func,
        onEditPlugin: PropTypes.func,
        onUpdateCfg: PropTypes.func,
        onMapViewerReload: PropTypes.func,
        onReloadConfirm: PropTypes.func,
        saveDestLocation: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object,
        plugins: PropTypes.object
    };

    static defaultProps = {
        newContext: {},
        resource: {},
        viewerPlugins: [
            "Map",
            "BackgroundSelector",
            "MetadataExplorer",
            "TOC",
            "TOCItemsSettings",
            "DrawerMenu",
            "OmniBar",
            "BurgerMenu",
            "AddGroup",
            "Notifications",
            "QueryPanel",
            "FeatureEditor",
            "MapFooter",
            "CRSSelector",
            "MousePosition",
            "ScaleBox",
            "Toolbar",
            "MapLoading",
            "Identify",
            "Locate",
            "ZoomIn",
            "ZoomOut",
            "ZoomAll"
        ],
        ignoreViewerPlugins: false,
        allAvailablePlugins: [],
        curStepId: 'general-settings',
        saveDestLocation: '/context-manager',
        onSetStep: () => {},
        onChangeAttribute: () => {},
        onReloadConfirm: () => {}
    };

    render() {
        return (
            <Stepper
                currentStepId={this.props.curStepId}
                onSetStep={this.props.onSetStep}
                onSave={() => this.props.onSave(this.props.saveDestLocation)}
                steps={[{
                    id: 'general-settings',
                    label: 'contextCreator.generalSettings.label',
                    disableNext: !this.props.resource.name || !this.props.resource.name.length ||
                        !this.props.newContext.windowTitle || !this.props.newContext.windowTitle.length,
                    component:
                        <GeneralSettings
                            contextName={this.props.resource.name}
                            windowTitle={this.props.newContext.windowTitle}
                            context={this.context}
                            onChange={this.props.onChangeAttribute}/>
                }, {
                    id: 'configure-plugins',
                    label: 'contextCreator.configurePlugins.label',
                    component:
                        <ConfigurePlugins
                            allPlugins={this.props.allAvailablePlugins}
                            editedPlugin={this.props.editedPlugin}
                            editedCfg={this.props.editedCfg}
                            availablePluginsFilterText={this.props.availablePluginsFilterText}
                            enabledPluginsFilterText={this.props.enabledPluginsFilterText}
                            onFilterAvailablePlugins={this.props.onFilterAvailablePlugins}
                            onFilterEnabledPlugins={this.props.onFilterEnabledPlugins}
                            onEditPlugin={this.props.onEditPlugin}
                            onUpdateCfg={this.props.onUpdateCfg}
                            setSelectedPlugins={this.props.setSelectedPlugins}
                            changePluginsKey={this.props.changePluginsKey}/>
                }, {
                    id: 'configure-map',
                    label: 'contextCreator.configureMap.label',
                    extraToolbarButtons: [{
                        id: "map-reload",
                        onClick: () => this.props.onReloadConfirm(true),
                        label: 'contextCreator.configureMap.reload'
                    }],
                    component:
                        <ConfigureMap
                            pluginsConfig={this.props.ignoreViewerPlugins ?
                                this.props.pluginsConfig :
                                keys(this.props.pluginsConfig).reduce((curConfig, mode) => ({
                                    ...curConfig,
                                    [mode]: this.props.pluginsConfig[mode]
                                        .filter(p => findIndex(this.props.viewerPlugins, x => x === (isObject(p) ? p.name : p)) > -1)
                                }), {})}
                            plugins={this.context.plugins}
                            mapType={this.props.mapType}
                            showConfirm={this.props.showReloadConfirm}
                            onReloadConfirm={this.props.onReloadConfirm}
                            onMapViewerReload={this.props.onMapViewerReload}/>
                }]}/>
        );
    }
}
