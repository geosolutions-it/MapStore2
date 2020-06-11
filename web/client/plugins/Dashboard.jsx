/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { connect } = require('react-redux');
const { compose, withProps, withHandlers } = require('recompose');
const { createSelector } = require('reselect');
const { getDashboardWidgets, dependenciesSelector, getDashboardWidgetsLayout, isWidgetSelectionActive, getEditingWidget, getWidgetsDependenciesGroups } = require('../selectors/widgets');
const { editWidget, updateWidgetProperty, deleteWidget, changeLayout, exportCSV, exportImage, selectWidget } = require('../actions/widgets');
const { showConnectionsSelector, dashboardResource, isDashboardLoading, isBrowserMobile } = require('../selectors/dashboard');
const { currentLocaleLanguageSelector } = require('../selectors/locale');
const { isLocalizedLayerStylesEnabledSelector, localizedLayerStylesEnvSelector } = require('../selectors/localizedLayerStyles');
const ContainerDimensions = require('react-container-dimensions').default;

const PropTypes = require('prop-types');
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
            (resource, widgets, layouts, dependencies, selectionActive, editingWidget, groups, showGroupColor, loading, isMobile, currentLocaleLanguage, isLocalizedLayerStylesEnabled,
                env) => ({
                resource,
                loading,
                canEdit: isMobile ? !isMobile : resource && !!resource.canEdit,
                layouts,
                dependencies,
                selectionActive,
                editingWidget,
                widgets,
                groups,
                showGroupColor,
                language: isLocalizedLayerStylesEnabled ? currentLocaleLanguage : null,
                env
            })
        ), {
            editWidget,
            updateWidgetProperty,
            exportCSV,
            exportImage,
            deleteWidget,
            onWidgetSelected: selectWidget,
            onLayoutChange: changeLayout
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
                    target.widgetType === "table" &&
                        (editingWidget.widgetType !== "map" && (target.layer && editingWidget.layer && target.layer.name === editingWidget.layer.name)
                        || editingWidget.widgetType === "map") && !target.mapSync
                ) && target.id !== editingWidget.id
    })
)(require('../components/dashboard/Dashboard'));

/**
 * Dashboard Plugin
 * @static
 * @memberof plugins
 * @name Dashboard
 * @class Dashboard
 * @prop {boolean} cfg.enabled if true, render the plugin
 * @prop {number} cfg.rowHeight Rows have a static height
 * @prop {object} cfg.cols Number of columns in this layout. default { lg: 6, md: 6, sm: 4, xs: 2, xxs: 1 }
 * for more info about rowHeight and cols, see https://github.com/STRML/react-grid-layout#grid-layout-props
 */
class DashboardPlugin extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool,
        rowHeight: PropTypes.number,
        cols: PropTypes.object
    };
    static defaultProps = {
        enabled: true,
        cols: { lg: 6, md: 6, sm: 4, xs: 2, xxs: 1 }
    };
    render() {
        return this.props.enabled ? (<ContainerDimensions>{({ width, height }) => <WidgetsView width={width} height={height} rowHeight={this.props.rowHeight} cols={this.props.cols} />}</ContainerDimensions>) : null;

    }
}

module.exports = {
    DashboardPlugin,
    reducers: {
        widgets: require('../reducers/widgets')
    }
};
