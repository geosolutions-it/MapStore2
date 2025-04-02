/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';
import { withResizeDetector } from 'react-resize-detector';
import { connect } from 'react-redux';
import { compose, withHandlers, withProps } from 'recompose';
import { createSelector } from 'reselect';
import { isEmpty } from 'lodash';

import {
    changeLayout,
    deleteWidget,
    editWidget,
    exportCSV,
    exportImage,
    selectWidget,
    updateWidgetProperty,
    toggleMaximize
} from '../actions/widgets';
import Dashboard from '../components/dashboard/Dashboard';
import widgetsReducers from '../reducers/widgets';
import {
    dashboardResource,
    isBrowserMobile,
    isDashboardLoading,
    showConnectionsSelector,
    isDashboardAvailable,
    dashboardTitleSelector
} from '../selectors/dashboard';
import { currentLocaleLanguageSelector, currentLocaleSelector } from '../selectors/locale';
import { isLocalizedLayerStylesEnabledSelector, localizedLayerStylesEnvSelector } from '../selectors/localizedLayerStyles';
import {
    dependenciesSelector,
    getDashboardWidgets,
    getDashboardWidgetsLayout,
    getEditingWidget,
    getWidgetsDependenciesGroups,
    isWidgetSelectionActive,
    getMaximizedState
} from '../selectors/widgets';
import dashboardReducers from '../reducers/dashboard';
import dashboardEpics from '../epics/dashboard';
import widgetsEpics from '../epics/widgets';
import GlobalSpinner from '../components/misc/spinners/GlobalSpinner/GlobalSpinner';
import { createPlugin } from '../utils/PluginsUtils';
import { canTableWidgetBeDependency } from '../utils/WidgetsUtils';

const WidgetsView = compose(
    connect(
        createSelector(
            dashboardResource,
            getDashboardWidgets,
            getDashboardWidgetsLayout,
            dependenciesSelector,
            isWidgetSelectionActive,
            (state) => getEditingWidget(state),
            getWidgetsDependenciesGroups,
            showConnectionsSelector,
            isDashboardLoading,
            isBrowserMobile,
            currentLocaleLanguageSelector,
            isLocalizedLayerStylesEnabledSelector,
            localizedLayerStylesEnvSelector,
            getMaximizedState,
            currentLocaleSelector,
            isDashboardAvailable,
            (resource, widgets, layouts, dependencies, selectionActive, editingWidget, groups, showGroupColor, loading, isMobile, currentLocaleLanguage, isLocalizedLayerStylesEnabled,
                env, maximized, currentLocale, isDashboardOpened) => ({
                resource,
                loading,
                canEdit: isMobile ? !isMobile : resource && !!resource.canEdit,
                layouts,
                dependencies,
                selectionActive,
                editingWidget,
                widgets: !isEmpty(maximized) ? widgets.filter(w => w.id === maximized.widget.id) : widgets,
                groups,
                showGroupColor,
                language: isLocalizedLayerStylesEnabled ? currentLocaleLanguage : null,
                env,
                maximized,
                currentLocale,
                isDashboardOpened
            })
        ), {
            editWidget,
            updateWidgetProperty,
            exportCSV,
            exportImage,
            deleteWidget,
            onWidgetSelected: selectWidget,
            onLayoutChange: changeLayout,
            toggleMaximize
        }
    ),
    withProps(() => ({
        style: {
            height: "100%",
            overflow: "auto"
        }
    })),
    withHandlers({
        // TODO: maybe using availableDependencies here will be better when different widgets type dependencies are supported
        isWidgetSelectable: ({ editingWidget }) =>
            (target) =>
                (target.widgetType === "map" ||
                    /*
                     * when the target is a table widget then check among its dependencies
                     * if it has other connection that are for sure map or table
                     * then make it non selectable
                    */
                    target.widgetType === "table" && canTableWidgetBeDependency(editingWidget, target) && !target.mapSync
                ) && target.id !== editingWidget.id
    })
)(Dashboard);

/**
 * Dashboard Plugin. Renders the main dashboard UI.
 * @static
 * @memberof plugins
 * @name Dashboard
 * @class Dashboard
 * @prop {boolean} cfg.enabled if true, render the plugin
 * @prop {number} cfg.rowHeight Rows have a static height
 * @prop {object} cfg.cols Number of columns in this layout. default { lg: 6, md: 6, sm: 4, xs: 2, xxs: 1 }
 * @prop {object} cfg.minLayoutWidth minimum size of the layout, below this size the widgets are listed in a single column
 * for more info about rowHeight and cols, see https://github.com/STRML/react-grid-layout#grid-layout-props
 * @prop {object} cfg.widgetOpts can be used to configure widget specific options.
 * Currently, it explicitly supports table widget with following options
 * @example
 * {
 *   "name": "Dashboard",
 *   "cfg": {
 *      "rowHeight": 150,
 *      "cols": { lg: 6, md: 6, sm: 4, xs: 2, xxs: 1 },
 *      "widgetOpts": {
 *          "table": {
 *              gridOpts: {
 *                  rowHeight: 20,
 *                  headerRowHeight: 20,
 *                  headerFiltersHeight: 20
 *              }
 *          }
 *      }
 *   }
 * }
 */
class DashboardPlugin extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool,
        rowHeight: PropTypes.number,
        cols: PropTypes.object,
        minLayoutWidth: PropTypes.number,
        widgetOpts: PropTypes.object,
        enableZoomInTblWidget: PropTypes.bool,
        dashboardTitle: PropTypes.string
    };
    static defaultProps = {
        enabled: true,
        minLayoutWidth: 480,
        enableZoomInTblWidget: true
    };
    componentDidMount() {
        let isExistingDashbaordResource = this.props?.did;
        if (isExistingDashbaordResource) {
            this.oldDocumentTitle = document.title;
        }
    }
    componentDidUpdate() {
        let isExistingDashbaordResource = this.props?.did;
        if (this.props.dashboardTitle && isExistingDashbaordResource) {
            document.title = this.props.dashboardTitle;
        }
    }
    componentWillUnmount() {
        let isExistingDashbaordResource = this.props?.did;
        if (isExistingDashbaordResource) {
            document.title = this.oldDocumentTitle;
        }
    }
    render() {
        return this.props.enabled
            ? <WidgetsView
                width={this.props.width}
                height={this.props.height}
                rowHeight={this.props.rowHeight}
                cols={this.props.cols}
                minLayoutWidth={this.props.minLayoutWidth}
                enableZoomInTblWidget={this.props.enableZoomInTblWidget}
                widgetOpts={this.props.widgetOpts}
            />
            : null;

    }
}

export default createPlugin("Dashboard", {
    component: connect((state) => ({dashboardTitle: dashboardTitleSelector(state)}))(withResizeDetector(DashboardPlugin)),
    reducers: {
        dashboard: dashboardReducers,
        widgets: widgetsReducers
    },
    containers: {
        SidebarMenu: {
            name: "Dashboard-spinner",
            alwaysVisible: true,
            position: 2000,
            tool: connect((state) => ({
                loading: isDashboardLoading(state)
            }))(GlobalSpinner)
        }
    },
    epics: {
        ...dashboardEpics,
        ...widgetsEpics
    }
});
