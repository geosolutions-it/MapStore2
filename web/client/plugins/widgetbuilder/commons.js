/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {createSelector} = require('reselect');
const {getEditingWidget, getEditorSettings, getWidgetLayer, dependenciesSelector} = require('../../selectors/widgets');
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
         })
     });
const wizardSelector = createSelector(
     getWidgetLayer,
     getEditingWidget,
     getEditorSettings,
     dependenciesSelector,
     (layer, editorData, settings, dependencies) => ({
         layer: (editorData && editorData.layer) || layer,
         editorData,
         settings,
         dependencies
     })
 );
module.exports = {
    wizardStateToProps,
    wizardSelector
};
