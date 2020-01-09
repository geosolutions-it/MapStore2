/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { get } = require('lodash');
const { connect } = require('react-redux');
const { compose, withProps, withHandlers } = require('recompose');
const { createSelector } = require('reselect');
const { getDashboardWidgets, dependenciesSelector, getDashboardWidgetsLayout, isWidgetSelectionActive, getEditingWidget, getWidgetsDependenciesGroups } = require('../selectors/widgets');
const { editWidget, updateWidgetProperty, deleteWidget, changeLayout, exportCSV, exportImage, selectWidget } = require('../actions/widgets');
const { showConnectionsSelector, dashboardResource, isDashboardLoading } = require('../selectors/dashboard');
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
            (resource, widgets, layouts, dependencies, selectionActive, editingWidget, groups, showGroupColor, loading) => ({
                resource,
                loading,
                canEdit: (resource ? !!resource.canEdit : true),
                layouts,
                dependencies,
                selectionActive,
                editingWidget,
                widgets,
                groups,
                showGroupColor
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
            ({ widgetType, id, layer = {}, dependenciesMap, mapSync }) =>
                (widgetType === "map" ||
                    /*
                     * when the target is a table widget then check among its dependencies
                     * if it has other connection that are for sure map or table
                     * then make it non selectable
                    */
                    widgetType === "table" && layer.name === editingWidget.layer.name &&
                    ( !dependenciesMap || (dependenciesMap && !mapSync)
                    /* ||
                        dependenciesMap &&
                        Object.keys(dependenciesMap)
                            .map(d => dependenciesMap[d] && (WIDGETS_REGEX.exec(dependenciesMap[d]) || [])[1])
                            .filter(widgetsId => {
                                let widget = find(widgets, {id: wId});

                            })*/

                    )
                ) && id !== editingWidget.id
    })
)(require('../components/dashboard/Dashboard'));


class Widgets extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool
    };
    static defaultProps = {
        enabled: true
    };
    render() {
        return this.props.enabled ? (<ContainerDimensions>{({ width, height }) => <WidgetsView width={width} height={height} />}</ContainerDimensions>) : null;

    }
}

const DashboardPlugin = Widgets;

module.exports = {
    DashboardPlugin,
    reducers: {
        widgets: require('../reducers/widgets')
    }
};
