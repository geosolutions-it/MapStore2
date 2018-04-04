/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {createSelector} = require('reselect');
const { getEditingWidget, dependenciesSelector, getEditorSettings, getWidgetLayer, availableDependenciesSelector} = require('../../selectors/widgets');

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
     (layer, editorData, settings) => ({
         layer: (editorData && editorData.layer) || layer,
         editorData,
         settings
     })
 );
const dashboardSelector = createSelector(
    getEditingWidget,
    dependenciesSelector,
    availableDependenciesSelector,
    ({ layer }, dependencies, dependencyConnectProps) => ({
        layer,
        dependencies,
        ...dependencyConnectProps
    }));

module.exports = {
    getWidgetLayer,
    availableDependenciesSelector,
    dashboardSelector,
    wizardStateToProps,
    wizardSelector
};
