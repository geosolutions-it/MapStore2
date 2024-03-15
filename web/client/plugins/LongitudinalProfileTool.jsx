/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import GlobalSpinner from '../components/misc/spinners/GlobalSpinner/GlobalSpinner';
import Main from './longitudinalProfile/Main';
import MenuConnected from './longitudinalProfile/Menu';
import MenuForBurger from './longitudinalProfile/MenuForBurger';
import { setControlProperty } from "../actions/controls";
import {
    addMarker,
    changeCRS,
    changeDistance,
    changeGeometry,
    changeReferential,
    closeDock,
    hideMarker,
    showError,
    setup,
    tearDown,
    toggleMaximize,
    toggleMode
} from "../actions/longitudinalProfile";
import { warning } from '../actions/notifications';
import {exportCSV} from "../actions/widgets";
import * as epics from '../epics/longitudinalProfile';
import longitudinalProfile from '../reducers/longitudinalProfile';
import {
    getSelectedLayer as getSelectedLayerSelector
} from '../selectors/layers';
import {
    currentLocaleSelector,
    currentMessagesSelector
} from '../selectors/locale';
import {
    chartTitleSelector,
    crsSelectedDXFSelector,
    configSelector,
    dataSourceModeSelector,
    distanceSelector,
    infosSelector,
    isDockOpenSelector,
    isInitializedSelector,
    isLoadingSelector,
    isMaximizedSelector,
    isParametersOpenSelector,
    isSupportedLayerSelector,
    pointsSelector,
    projectionSelector,
    referentialSelector
} from '../selectors/longitudinalProfile';
import {
    dockStyleSelector,
    helpStyleSelector,
    boundingSidebarRectSelector
} from '../selectors/maplayout';

import { createPlugin } from '../utils/PluginsUtils';

/**
 * Plugin for generating a chart with longitudinal profile
 * @name LongitudinalProfileTool
 * @memberof plugins
 * @class
 * @prop {Object} cfg.config the plugin configuration
 * @prop {string} cfg.config.wpsurl optional, the geoserver url the the wps endpoint to use. It can be an absolute url. default is "/geoserver/wps".
 * @prop {string} cfg.config.chartTitle the default title of the chart
 * @prop {number} cfg.config.noDataThreshold the number that beyond it will exclude data
 * @prop {number} cfg.config.defaultDistance the default distance value in meters
 * @prop {string} cfg.config.identifier the profile to use in the wps request, defaulted to gs:LongitudinalProfile
 * @prop {string} cfg.config.defaultReferentialName the default referential name
 * @prop {Object[]} cfg.config.referentials (required) the layers that can be used as referentials
 * @prop {string[]} cfg.filterAllowedCRS the allowed crs to be proposed when dropping a DXF file, (needs to be supported by mapstore)
 * @prop {Object} cfg.additionalCRS the crs object that allow to define also a label
 *
 * @example
 *
 * {
 *   "name": "LongitudinalProfileTool",
 *   "cfg": {
 *     "config": {
 *       "wpsurl": "/geoserver/wps",
 *       "chartTitle": "Longitudinal profile",
 *       "defaultDistance": 75,
 *       "noDataThreshold": 999999,
 *       "defaultReferentialName": "sfdem",
 *       "referentials": [{
 *          "layerName": "sfdem",
 *          "title": "sfdem"
 *        }]
 *      },
 *      "filterAllowedCRS": ["EPSG:4326", "EPSG:3857"],
 *      "additionalCRS": {
 *        "EPSG:3003": { "label": "EPSG:3003" }
 *       }
 *    }
 * }
 */
const MainComponent = connect(
    createSelector(
        [
            chartTitleSelector,
            crsSelectedDXFSelector,
            configSelector,
            isInitializedSelector,
            isLoadingSelector,
            dataSourceModeSelector,
            isParametersOpenSelector,
            isDockOpenSelector,
            infosSelector,
            pointsSelector,
            projectionSelector,
            referentialSelector,
            distanceSelector,
            dockStyleSelector,
            helpStyleSelector,
            getSelectedLayerSelector,
            isSupportedLayerSelector,
            currentMessagesSelector,
            currentLocaleSelector,
            isMaximizedSelector,
            boundingSidebarRectSelector
        ],
        (
            chartTitle,
            crsSelectedDXF,
            config,
            initialized,
            loading,
            dataSourceMode,
            isParametersOpen,
            showDock,
            infos,
            points,
            projection,
            referential,
            distance,
            dockStyle,
            helpStyle,
            selectedLayer,
            isSupportedLayer,
            messages,
            currentLocale,
            maximized,
            boundingRect
        ) => ({
            chartTitle,
            crsSelectedDXF,
            config,
            initialized,
            loading,
            dataSourceMode,
            isParametersOpen,
            showDock,
            infos,
            points,
            projection,
            referential,
            distance,
            dockStyle,
            helpStyle,
            selectedLayer,
            isSupportedLayer,
            messages,
            currentLocale,
            maximized,
            boundingRect
        })),
    {
        onAddMarker: addMarker,
        onChangeCRS: changeCRS,
        onChangeDistance: changeDistance,
        onChangeGeometry: changeGeometry,
        onChangeReferential: changeReferential,
        onCloseDock: closeDock,
        onError: showError,
        onExportCSV: exportCSV,
        onHideMarker: hideMarker,
        onSetup: setup,
        onTearDown: tearDown,
        onToggleMaximize: toggleMaximize,
        onToggleParameters: setControlProperty.bind(this, "LongitudinalProfileToolParameters", "enabled", true, true),
        onToggleSourceMode: toggleMode,
        onWarning: warning
    })(Main);

export default createPlugin(
    "LongitudinalProfileTool",
    {
        component: MainComponent,
        options: {
            disablePluginIf: "{state('mapType') === 'cesium'}"
        },
        containers: {
            SidebarMenu: {
                name: 'LongitudinalProfileTool',
                position: 2100,
                doNotHide: true,
                tool: MenuConnected,
                priority: 1
            },
            BurgerMenu: {
                tool: MenuForBurger,
                name: 'LongitudinalProfileTool',
                position: 2100,
                doNotHide: true,
                priority: 2
            },
            Toolbar: {
                name: "LongitudinalProfileTool-spinner",
                alwaysVisible: true,
                position: 1,
                tool: connect((state) => ({
                    loading: isLoadingSelector(state)
                }))(GlobalSpinner)
            }
        },
        reducers: { longitudinalProfile },
        epics
    });
