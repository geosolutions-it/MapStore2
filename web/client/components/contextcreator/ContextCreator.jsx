/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import * as PropTypes from 'prop-types';
import { keys, isObject, find, get } from 'lodash';

import Stepper from '../misc/Stepper';
import GeneralSettings from './GeneralSettingsStep';
import ConfigurePlugins from './ConfigurePluginsStep';
import ConfigureMap from './ConfigureMapStep';

/**
 * Filters plugins and applies overrides.
 * The resulting array will filter the pluginsConfig returning only the ones present in viewerPlugins.
 * If some viewerPlugin is an object, it can contain a special entry "overrides". If so, the configuration here
 * will override the ones in the original plugin config.
 * Actually overrides are supported only for "cfg" values.
 * For example:
 * ```
 * pluginsConfigs:
 *         "SomePlugin",
 *         "MetadataExplorer",
 *           {
 *               "name": "TOC",
 *               "cfg": { activateQueryTool: true, otherOptions: true }
 *           },
 * viewerPlugins:
 *         "MetadataExplorer",
 *           {
 *               "name": "TOC",
 *               "overrides": {
 *                   "cfg": { activateQueryTool: false }
 *               }
 *           },
 * result:
 *         "MetadataExplorer",
 *           {
 *               "name": "TOC",
 *               "cfg": { activateQueryTool: false, otherOptions: true }
 *           },
 *   ```
 * @param {array} pluginsConfigs array of plugins (Strings or objects) to override
 * @param {array} viewerPlugins list of plugins to use
 */
export const pluginsFilterOverride = (pluginsConfigs, viewerPlugins) => {
    return pluginsConfigs.map(p => {
        const pName = isObject(p) ? p.name : p;
        // find out
        const viewerPlugin = find(viewerPlugins, vp => {
            return pName === (isObject(vp) ? vp.name : vp);
        });
        if (viewerPlugin) {
            if (isObject(viewerPlugin) && viewerPlugin.overrides) {
                const newP = isObject(p) ? p : { name: p };
                const cfg = {
                    ...(p.cfg || {}),
                    ...(viewerPlugin.overrides && viewerPlugin.overrides.cfg || {})
                };
                return {
                    ...newP,
                    cfg
                };
            }
            return p;
        }
        return null;
    }).filter(p => p); // remove plugins not found
};

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
        isCfgValidated: PropTypes.bool,
        cfgError: PropTypes.object,
        availablePluginsFilterText: PropTypes.string,
        enabledPluginsFilterText: PropTypes.string,
        documentationBaseURL: PropTypes.string,
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
        onEnablePlugins: PropTypes.func,
        onDisablePlugins: PropTypes.func,
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
            {
                "name": "TOC",
                "overrides": {
                    "cfg": { activateQueryTool: false }

                }
            },
            "TOCItemsSettings",
            "DrawerMenu",
            "OmniBar",
            "BurgerMenu",
            "AddGroup",
            "Notifications",
            "QueryPanel",
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
            "ZoomAll",
            "Annotations",
            "MapImport"
        ],
        ignoreViewerPlugins: false,
        allAvailablePlugins: [],
        isCfgValidated: false,
        curStepId: 'general-settings',
        saveDestLocation: '/context-manager',
        onSetStep: () => { },
        onChangeAttribute: () => { },
        onReloadConfirm: () => { }
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
                            onChange={this.props.onChangeAttribute} />
                }, {
                    id: 'configure-plugins',
                    label: 'contextCreator.configurePlugins.label',
                    disableNext: !this.props.allAvailablePlugins.filter(
                        plugin => plugin.enabled && get(plugin, 'pluginConfig.cfg.containerPosition') === undefined).length ||
                        !!this.props.cfgError ||
                        !this.props.isCfgValidated,
                    component:
                        <ConfigurePlugins
                            allPlugins={this.props.allAvailablePlugins}
                            editedPlugin={this.props.editedPlugin}
                            editedCfg={this.props.editedCfg}
                            cfgError={this.props.cfgError}
                            availablePluginsFilterText={this.props.availablePluginsFilterText}
                            enabledPluginsFilterText={this.props.enabledPluginsFilterText}
                            documentationBaseURL={this.props.documentationBaseURL}
                            onFilterAvailablePlugins={this.props.onFilterAvailablePlugins}
                            onFilterEnabledPlugins={this.props.onFilterEnabledPlugins}
                            onEditPlugin={this.props.onEditPlugin}
                            onEnablePlugins={this.props.onEnablePlugins}
                            onDisablePlugins={this.props.onDisablePlugins}
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
                                    [mode]: pluginsFilterOverride(this.props.pluginsConfig[mode], this.props.viewerPlugins)
                                }), {})}
                            plugins={this.context.plugins}
                            mapType={this.props.mapType}
                            showConfirm={this.props.showReloadConfirm}
                            onReloadConfirm={this.props.onReloadConfirm}
                            onMapViewerReload={this.props.onMapViewerReload} />
                }]} />
        );
    }
}
