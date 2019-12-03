/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import * as PropTypes from 'prop-types';
import {keys, isObject} from 'lodash';

import Stepper from '../misc/Stepper';
import GeneralSettings from './GeneralSettingsStep';
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
        mapType: PropTypes.string,
        showReloadConfirm: PropTypes.bool,
        onSetStep: PropTypes.func,
        onChangeAttribute: PropTypes.func,
        onSave: PropTypes.func,
        onMapViewerReload: PropTypes.func,
        onReloadConfirm: PropTypes.func,
        saveDestLocation: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object,
        plugins: PropTypes.array
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
                                        .filter(p => this.props.viewerPlugins.findIndex(x => x === (isObject(p) ? p.name : p)) > -1)
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
