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
    selectWidget,
    updateWidgetProperty,
    toggleMaximize,
    replaceLayoutView,
    replaceWidgets,
    setSelectedLayoutViewId
} from '../actions/widgets';
import Dashboard from '../components/dashboard/Dashboard';
import widgetsReducers from '../reducers/widgets';
import {
    dashboardResource,
    isBrowserMobile,
    isDashboardLoading,
    showConnectionsSelector,
    isDashboardAvailable,
    dashboardTitleSelector,
    buttonCanEdit
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
    getMaximizedState,
    getSelectedLayoutId
} from '../selectors/widgets';
import dashboardReducers from '../reducers/dashboard';
import dashboardEpics from '../epics/dashboard';
import widgetsEpics from '../epics/widgets';
import GlobalSpinner from '../components/misc/spinners/GlobalSpinner/GlobalSpinner';
import { createPlugin } from '../utils/PluginsUtils';
import { canTableWidgetBeDependency } from '../utils/WidgetsUtils';
import usePluginItems from '../hooks/usePluginItems';

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
            getSelectedLayoutId,
            buttonCanEdit,
            (resource, widgets, layouts, dependencies, selectionActive, editingWidget, groups, showGroupColor, loading, isMobile, currentLocaleLanguage, isLocalizedLayerStylesEnabled,
                env, maximized, currentLocale, isDashboardOpened, selectedLayoutId, edit) => ({
                resource,
                loading,
                canEdit: edit,
                layouts,
                dependencies,
                selectionActive,
                editingWidget,
                widgets: !isEmpty(maximized) && Array.isArray(maximized.widget) && maximized.widget.some(w => w.layoutId === selectedLayoutId)
                    ? widgets.filter(w => maximized.widget.some(mw => mw.id === w.id))
                    : widgets,
                groups,
                showGroupColor,
                language: isLocalizedLayerStylesEnabled ? currentLocaleLanguage : null,
                env,
                maximized: !isEmpty(maximized) && (
                    (Array.isArray(maximized.widget)
                        ? maximized.widget.every(w => w.layoutId !== selectedLayoutId)
                        : maximized.widget.layoutId !== selectedLayoutId
                    )
                ) ? {} : maximized,
                currentLocale,
                isDashboardOpened,
                selectedLayoutId
            })
        ), {
            editWidget,
            updateWidgetProperty,
            exportCSV,
            deleteWidget,
            onWidgetSelected: selectWidget,
            onLayoutChange: changeLayout,
            toggleMaximize,
            onLayoutViewReplace: replaceLayoutView,
            onWidgetsReplace: replaceWidgets,
            onLayoutViewSelected: setSelectedLayoutViewId
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
        items: PropTypes.array,
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
        let isExistingDashboardResource = this.props?.did;
        if (isExistingDashboardResource) {
            this.oldDocumentTitle = document.title;
        }
    }
    componentDidUpdate() {
        let isExistingDashboardResource = this.props?.did;
        if (this.props.dashboardTitle && isExistingDashboardResource) {
            document.title = this.props.dashboardTitle;
        }
    }
    componentWillUnmount() {
        let isExistingDashboardResource = this.props?.did;
        if (isExistingDashboardResource) {
            document.title = this.oldDocumentTitle;
        }
    }
    render() {
        return this.props.enabled
            ? <WidgetsView
                items={this.props.items}
                width={this.props.width}
                height={this.props.height}
                rowHeight={this.props.rowHeight}
                cols={this.props.cols}
                minLayoutWidth={this.props.minLayoutWidth}
                enableZoomInTblWidget={this.props.enableZoomInTblWidget}
                widgetOpts={this.props.widgetOpts}
                isDashboardWidget
            />
            : null;

    }
}

const DashboardComponentWrapper = (props, context) => {
    const { loadedPlugins } = context;
    const items = usePluginItems({ items: props.items, loadedPlugins })
        .filter(({ target }) => target === 'menu');

    return <DashboardPlugin {...props} items={items}/>;
};

DashboardComponentWrapper.contextTypes = {
    loadedPlugins: PropTypes.object
};

export default createPlugin("Dashboard", {
    component: connect((state) => ({dashboardTitle: dashboardTitleSelector(state)}))(withResizeDetector(DashboardComponentWrapper)),
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
