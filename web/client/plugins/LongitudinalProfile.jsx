/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import GlobalSpinner from '../components/misc/spinners/GlobalSpinner/GlobalSpinner';
import Main from './longitudinalProfile/Main';
import UserMenuConnected from './longitudinalProfile/Menu';
import { setControlProperty } from "../actions/controls";
import {
    addMarker,
    changeCRS,
    changeDistance,
    changeGeometry,
    changeReferential,
    closeDock,
    hideMarker,
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
    crsSelectedSelector,
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

const MainComponent = connect(
    createSelector(
        [
            chartTitleSelector,
            crsSelectedSelector,
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
            crsSelected,
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
            crsSelected,
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
        onExportCSV: exportCSV,
        onHideMarker: hideMarker,
        onSetup: setup,
        onTearDown: tearDown,
        onToggleMaximize: toggleMaximize,
        onToggleParameters: setControlProperty.bind(this, "longitudinalProfileParameters", "enabled", true, true),
        onToggleSourceMode: toggleMode,
        onWarning: warning
    })(Main);

export default createPlugin(
    "LongitudinalProfile",
    {
        component: MainComponent,
        containers: {
            SidebarMenu: {
                name: 'LongitudinalProfile',
                position: 2100,
                doNotHide: true,
                tool: UserMenuConnected,
                priority: 1
            },
            Toolbar: {
                name: "LongitudinalProfile-spinner",
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

// exploit in Mapstore the altitude or depth data present in digital terrain models or bathymetric surveys
// INPUT
// [x] Height data: The input height data (from a list - currently data used is the IGN DEM at 75 m)
// [ ] linear profile: Three(3) options
//   [x] Drawing it directly on the map;
//   [x] Importing it as JSON selected from file system
//   [x] Importing it as ESRI Shapefile, selected from file system (compressed zip containing shp, shx, dbf and prj files)
//   [x] Importing it as DXF file, selected from file system, and related coordinate system to be used (from a list)
// [v] Title of the graphic profile
// [v] Pitch used: Maximum distance between 2 points along the profile, in meters)
// [ ] After drawing the linear profile or importing it as a file (shp or dxf), the module offers to display and export the profile produced in several ways
// [ ] ADD Option to use bathymetric data sources as height data input, in addition to DTMs from IGN (and lidar)

// OUTPUT
// [ ] Graph display
//   [ ] The graph is interactive. Altitude and distance traveled values are dynamically displayed on hover
//   [ ] The x-axis indicates the distance traveled from the starting point of the drawn or imported linear
//   [ ] The y-axis indicates the altitude returned by the height source at the coordinates along the profile.
//   [ ] The y-axis is initialized at 10 m below the minimum altitude encountered on the profile and 10 m above the maximum altitude encountered on the profile
//   [ ] Information on altimetric data source and altimetric reference is specified.
// [x] Summary display
//   [x] Elevation data source used
//   [x] Total linear length of the profile
//   [x] Positive elevation
//   [X] Negative elevation
//   [X] Number of vertex points on which the altimetry was calculated. The number of stitches varies according to the pitch chosen.
// [ ] Output data - Export
//   [v] Image format (PNG) of the graph (only chart or also with other info?)
//   [x] Tabular format (CSV) of the longitudinal profile, specifying for each coordinate of the profile the Z value in addition to the X and Y values. The distance of each point from the starting point is also mentioned.
//   [ ] Printable format (PDF) of the longitudinal profile. The PDF document should include the graphic information as well as the extract from the map allowing you to visualize the line of the profile in 2D (whether the latter has been drawn on the map or imported via an ESRI Shapefile or DXF file)
//   [ ] Export of longitudinal profile to DXF format as 3D polyline
