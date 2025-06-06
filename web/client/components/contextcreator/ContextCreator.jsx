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
import ConfigureThemes from './ConfigureThemes';
import {CONTEXT_TUTORIALS} from '../../actions/contextcreator';
/**
 * Merges plugins "cfg" from pluginsConfigs and applies "overrides" from viewerPlugins.
 * The resulting array will return viewerPlugins with "cfg" applied directly from the pluginsConfigs and optionally overridden
 * with "overrides" from viewerPlugins.
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
 * NOTE: Logic has changed to support custom list of plugins to be active on the map configuration step of context wizard.
 * The final result will match previous implementation except that it will also contain plugins that are missing
 * in "viewer"/"desktop" array inside localConfig.json -> plugins
 * @param {array} pluginsConfigs array of plugins (Strings or objects) to override
 * @param {array} viewerPlugins list of plugins to use
 */
export const pluginsFilterOverride = (pluginsConfigs, viewerPlugins) => {
    return viewerPlugins.map((viewerPlugin) => {
        const pName = isObject(viewerPlugin) ? viewerPlugin.name : viewerPlugin;
        // find out
        const p = find(pluginsConfigs, plugin => {
            return pName === (isObject(plugin) ? plugin.name : plugin);
        });
        if (p) {
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
        return viewerPlugin;
    });
};

export default class ContextCreator extends React.Component {
    static propTypes = {
        user: PropTypes.object,
        loading: PropTypes.bool,
        loadFlags: PropTypes.object,
        contextId: PropTypes.object,
        isValidContextName: PropTypes.bool,
        contextNameChecked: PropTypes.bool,
        curStepId: PropTypes.string,
        tutorialStatus: PropTypes.string,
        tutorialStep: PropTypes.string,
        newContext: PropTypes.object,
        resource: PropTypes.object,
        pluginsConfig: PropTypes.object,
        pluginsToUpload: PropTypes.array,
        viewerPlugins: PropTypes.array,
        ignoreViewerPlugins: PropTypes.bool,
        allAvailablePlugins: PropTypes.array,
        editedPlugin: PropTypes.string,
        editedCfg: PropTypes.string,
        isCfgValidated: PropTypes.bool,
        cfgError: PropTypes.object,
        mapTemplates: PropTypes.array,
        parsedTemplate: PropTypes.object,
        editedTemplate: PropTypes.object,
        fileDropStatus: PropTypes.string,
        availablePluginsFilterText: PropTypes.string,
        enabledPluginsFilterText: PropTypes.string,
        availableTemplatesFilterText: PropTypes.string,
        enabledTemplatesFilterText: PropTypes.string,
        documentationBaseURL: PropTypes.string,
        showPluginDescriptionTooltip: PropTypes.bool,
        pluginDescriptionTooltipDelay: PropTypes.number,
        onFilterAvailablePlugins: PropTypes.func,
        onFilterEnabledPlugins: PropTypes.func,
        onFilterAvailableTemplates: PropTypes.func,
        onFilterEnabledTemplates: PropTypes.func,
        setSelectedPlugins: PropTypes.func,
        setSelectedTemplates: PropTypes.func,
        setParsedTemplate: PropTypes.func,
        setFileDropStatus: PropTypes.func,
        changePluginsKey: PropTypes.func,
        changeTemplatesKey: PropTypes.func,
        mapType: PropTypes.string,
        showReloadConfirm: PropTypes.bool,
        showDialog: PropTypes.object,
        onInit: PropTypes.func,
        onSetStep: PropTypes.func,
        onShowTutorial: PropTypes.func,
        onChangeAttribute: PropTypes.func,
        onSave: PropTypes.func,
        onSaveTemplate: PropTypes.func,
        onDeleteTemplate: PropTypes.func,
        onEditTemplate: PropTypes.func,
        onEditPlugin: PropTypes.func,
        onEnablePlugins: PropTypes.func,
        onDisablePlugins: PropTypes.func,
        onUpdateCfg: PropTypes.func,
        onEnableUploadPlugin: PropTypes.func,
        onUploadPlugin: PropTypes.func,
        onAddUploadPlugin: PropTypes.func,
        onRemoveUploadPlugin: PropTypes.func,
        uploadEnabled: PropTypes.bool,
        onMapViewerReload: PropTypes.func,
        onReloadConfirm: PropTypes.func,
        saveDestLocation: PropTypes.string,
        uploading: PropTypes.array,
        uploadResult: PropTypes.object,
        onShowDialog: PropTypes.func,
        onRemovePlugin: PropTypes.func,
        onShowBackToPageConfirmation: PropTypes.func,
        showBackToPageConfirmation: PropTypes.bool,
        backToPageDestRoute: PropTypes.string,
        backToPageConfirmationMessage: PropTypes.string,
        tutorials: PropTypes.object,
        tutorialsList: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
        themes: PropTypes.array,
        setSelectedTheme: PropTypes.func,
        selectedTheme: PropTypes.string,
        basicVariables: PropTypes.object,
        customVariablesEnabled: PropTypes.bool,
        onToggleCustomVariables: PropTypes.func,
        enableClickOnStep: PropTypes.bool,
        items: PropTypes.array,
        stepIds: PropTypes.array,
        hideUploadExtension: PropTypes.bool,
        hideSaveButton: PropTypes.bool,
        hideCloseButton: PropTypes.bool
    };

    static contextTypes = {
        messages: PropTypes.object,
        plugins: PropTypes.object,
        router: PropTypes.object
    };

    static defaultProps = {
        loading: false,
        loadFlags: {},
        isValidContextName: true,
        contextNameChecked: true,
        newContext: {},
        resource: {},
        themes: [{
            id: 'dark',
            label: 'Dark',
            type: 'link',
            href: (__MAPSTORE_PROJECT_CONFIG__.themePath || 'dist/themes') + '/dark.css',
            defaultVariables: {
                "ms-main-color": "#eeeeee",
                "ms-main-bg": "#333333",
                "ms-primary-contrast": "#111111",
                "ms-primary": "#43a4ff",
                "ms-success-contrast": "#111111",
                "ms-success": "#398439"
            }
        }
        ],
        viewerPlugins: [
            "Map",
            "BackgroundSelector",
            "MetadataExplorer",
            {
                "name": "TOC",
                "overrides": {
                    "cfg": { activateQueryTool: true }

                }
            },
            "TOCItemsSettings",
            "SecurityPopup",
            "DrawerMenu",
            "OmniBar",
            "Search",
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
            "StyleEditor",
            {
                "name": "Identify",
                "overrides": {
                    "cfg": {
                        showEdit: false
                    }
                }
            },
            "Locate",
            "ZoomIn",
            "ZoomOut",
            "ZoomAll",
            "Annotations",
            "MapImport",
            "MapExport",
            "Undo",
            "Redo",
            "Expander",
            "FilterLayer",
            "GlobeViewSwitcher",
            {
                "name": "FeatureEditor",
                "overrides": {
                    "cfg": {
                        // To forcefully hide edit feature for all user roles
                        editingAllowedRoles: []
                    }
                }
            }
        ],
        ignoreViewerPlugins: false,
        allAvailablePlugins: [],
        isCfgValidated: false,
        curStepId: 'general-settings',
        saveDestLocation: '/',
        onInit: () => { },
        onSetStep: () => { },
        onShowTutorial: () => { },
        onChangeAttribute: () => { },
        onToggleCustomVariables: () => { },
        onReloadConfirm: () => { },
        uploadEnabled: false,
        pluginsToUpload: [],
        onShowBackToPageConfirmation: () => { },
        showBackToPageConfirmation: false,
        backToPageDestRoute: '/',
        backToPageConfirmationMessage: 'contextCreator.undo',
        tutorials: CONTEXT_TUTORIALS,
        tutorialsList: false,
        stepIds: [
            'general-settings',
            'configure-map',
            'configure-plugins',
            'configure-themes'
        ]
    };

    componentDidMount() {
        this.props.onInit({
            tutorials: this.props.tutorials
        });
    }

    componentDidUpdate() {
        if (!this.props.tutorialsList) {
            this.props.onInit({
                tutorials: this.props.tutorials
            });
        }
    }

    render() {
        const extraToolbarButtons = (stepId) => {
            let toolbarButton = this.props.tutorials[stepId] ? [{
                id: 'show-tutorial',
                onClick: () => this.props.onShowTutorial(stepId),
                label: 'contextCreator.showTutorial'
            }] : [];
            const importExportButtons = this.props.items?.map(({toolbarBtn} = {}) => toolbarBtn) ?? [];
            toolbarButton = toolbarButton.concat(importExportButtons);
            if (stepId === 'configure-map') {
                toolbarButton = toolbarButton.concat({
                    id: "map-reload",
                    onClick: () => this.props.onReloadConfirm(true),
                    label: 'contextCreator.configureMap.reload'
                });
            }
            return toolbarButton;
        };

        const defaultSteps = [{
            id: 'general-settings',
            label: 'contextCreator.generalSettings.label',
            extraToolbarButtons: extraToolbarButtons('general-settings'),
            disableNext: !this.props.resource.name ||
                !this.props.newContext.windowTitle || !this.props.newContext.windowTitle.length ||
                this.props.loading || !this.props.isValidContextName || !this.props.contextNameChecked,
            component:
                <GeneralSettings
                    contextId={this.props.contextId}
                    contextName={this.props.resource.name}
                    windowTitle={this.props.newContext.windowTitle}
                    isValidContextName={this.props.isValidContextName}
                    contextNameChecked={this.props.contextNameChecked}
                    loading={this.props.loading && this.props.loadFlags.contextNameCheck}
                    context={this.context}
                    onChange={this.props.onChangeAttribute} />
        }, {
            id: 'configure-map',
            label: 'contextCreator.configureMap.label',
            extraToolbarButtons: extraToolbarButtons('configure-map'),
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
        }, {
            id: 'configure-plugins',
            label: 'contextCreator.configurePlugins.label',
            extraToolbarButtons: extraToolbarButtons('configure-plugins'),
            disableNext: !this.props.allAvailablePlugins.filter(
                plugin => plugin.enabled && get(plugin, 'pluginConfig.cfg.containerPosition') === undefined).length ||
                !!this.props.cfgError ||
                !this.props.isCfgValidated,
            component:
                <ConfigurePlugins
                    user={this.props.user}
                    loading={this.props.loading}
                    loadFlags={this.props.loadFlags}
                    tutorialMode={this.props.tutorialStatus === 'run'}
                    tutorialStep={this.props.tutorialStep}
                    allPlugins={this.props.allAvailablePlugins}
                    editedPlugin={this.props.editedPlugin}
                    editedCfg={this.props.editedCfg}
                    cfgError={this.props.cfgError}
                    availablePluginsFilterText={this.props.availablePluginsFilterText}
                    enabledPluginsFilterText={this.props.enabledPluginsFilterText}
                    documentationBaseURL={this.props.documentationBaseURL}
                    showDescriptionTooltip={this.props.showPluginDescriptionTooltip}
                    descriptionTooltipDelay={this.props.pluginDescriptionTooltipDelay}
                    showDialog={this.props.showDialog}
                    mapTemplates={this.props.mapTemplates}
                    parsedTemplate={this.props.parsedTemplate}
                    editedTemplate={this.props.editedTemplate}
                    fileDropStatus={this.props.fileDropStatus}
                    availableTemplatesFilterText={this.props.availableTemplatesFilterText}
                    enabledTemplatesFilterText={this.props.enabledTemplatesFilterText}
                    onFilterAvailablePlugins={this.props.onFilterAvailablePlugins}
                    onFilterEnabledPlugins={this.props.onFilterEnabledPlugins}
                    onEditPlugin={this.props.onEditPlugin}
                    onEnablePlugins={this.props.onEnablePlugins}
                    onDisablePlugins={this.props.onDisablePlugins}
                    onUpdateCfg={this.props.onUpdateCfg}
                    setSelectedPlugins={this.props.setSelectedPlugins}
                    changePluginsKey={this.props.changePluginsKey}
                    uploading={this.props.uploading}
                    uploadResult={this.props.uploadResult}
                    onEnableUpload={this.props.onEnableUploadPlugin}
                    uploadEnabled={this.props.uploadEnabled}
                    pluginsToUpload={this.props.pluginsToUpload}
                    onUpload={this.props.onUploadPlugin}
                    onAddUpload={this.props.onAddUploadPlugin}
                    onRemoveUpload={this.props.onRemoveUploadPlugin}
                    changeTemplatesKey={this.props.changeTemplatesKey}
                    setSelectedTemplates={this.props.setSelectedTemplates}
                    setParsedTemplate={this.props.setParsedTemplate}
                    setFileDropStatus={this.props.setFileDropStatus}
                    onShowDialog={this.props.onShowDialog}
                    onRemovePlugin={this.props.onRemovePlugin}
                    onSaveTemplate={this.props.onSaveTemplate}
                    onDeleteTemplate={this.props.onDeleteTemplate}
                    onEditTemplate={this.props.onEditTemplate}
                    onFilterAvailableTemplates={this.props.onFilterAvailableTemplates}
                    onFilterEnabledTemplates={this.props.onFilterEnabledTemplates}
                    hideUploadExtension={this.props.hideUploadExtension}/>
        },
        {
            id: 'configure-themes',
            label: 'contextCreator.configureThemes.label',
            extraToolbarButtons: extraToolbarButtons('configure-themes'),
            disableNext: false,
            component: <ConfigureThemes
                themes={this.props.themes}
                customVariablesEnabled={this.props.customVariablesEnabled}
                basicVariables={this.props.basicVariables}
                setSelectedTheme={this.props.setSelectedTheme}
                onToggleCustomVariables={this.props.onToggleCustomVariables}
                selectedTheme={this.props.selectedTheme}
            />
        }
        ];

        return (
            <Stepper
                enableClickOnStep={this.props.enableClickOnStep}
                loading={this.props.loading && this.props.loadFlags.contextSaving}
                currentStepId={this.props.curStepId}
                onSetStep={this.props.onSetStep}
                onSave={() => this.props.onSave(this.props.saveDestLocation)}
                onShowBackToPageConfirmation={this.props.onShowBackToPageConfirmation}
                showBackToPageConfirmation={this.props.showBackToPageConfirmation}
                backToPageConfirmationMessage={this.props.backToPageConfirmationMessage}
                onConfirmBackToPage={() => this.context.router.history.push(this.props.backToPageDestRoute)}
                steps={this.props.stepIds.map((step) => defaultSteps.find(defaultStep => defaultStep.id === step))}
                hideSaveButton={this.props.hideSaveButton}
                hideCloseButton={this.props.hideCloseButton} />
        );
    }
}
