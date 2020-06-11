/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {createSelector} = require('reselect');
const {isNil} = require('lodash');
const { getEditingWidget, dependenciesSelector, getEditorSettings, getWidgetLayer, getFloatingWidgets, availableDependenciesForEditingWidgetSelector} = require('../../selectors/widgets');
const { isLocalizedLayerStylesEnabledDashboardsSelector } = require('../../selectors/localizedLayerStyles');
const { showConnectionsSelector } = require('../../selectors/dashboard');

const wizardStateToProps = ( stateProps = {}, dispatchProps = {}, ownProps = {}) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    step: stateProps && stateProps.settings && stateProps.settings.step,
    valid: stateProps && stateProps.settings && stateProps.settings.valid,
    onFinish: () => dispatchProps.insertWidget && dispatchProps.insertWidget({
        layer: stateProps.layer,
        url: stateProps.layer && stateProps.layer.url,
        ...(stateProps.editorData || {})
    }, ownProps.target)
});
const wizardSelector = createSelector(
    getWidgetLayer,
    getEditingWidget,
    getEditorSettings,
    getFloatingWidgets,
    (layer, editorData, settings, widgets) => ({
        layer: (editorData && editorData.layer) || layer,
        editorData,
        settings,
        widgets
    })
);
const dashboardSelector = createSelector(
    getEditingWidget,
    showConnectionsSelector,
    dependenciesSelector,
    availableDependenciesForEditingWidgetSelector,
    ({ layer }, showConnections, dependencies, dependencyConnectProps) => ({
        layer,
        showConnections,
        dependencies,
        ...dependencyConnectProps
    }));

const dashboardsSelectorIsLocalizedLayerStylesEnabled =   createSelector(
    isLocalizedLayerStylesEnabledDashboardsSelector,
    (isLocalizedLayerStylesEnabled) => ({
        isLocalizedLayerStylesEnabled: !isNil(isLocalizedLayerStylesEnabled)
    })
);

module.exports = {
    getWidgetLayer,
    availableDependenciesForEditingWidgetSelector,
    dashboardSelector,
    dashboardsSelectorIsLocalizedLayerStylesEnabled,
    wizardStateToProps,
    wizardSelector
};
