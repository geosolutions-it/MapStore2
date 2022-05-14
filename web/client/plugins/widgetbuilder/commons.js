/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isNil } from 'lodash';
import { createSelector } from 'reselect';

import { showConnectionsSelector, isDashboardEditing } from '../../selectors/dashboard';
import { currentLocaleLanguageSelector } from '../../selectors/locale';
import {
    isLocalizedLayerStylesEnabledDashboardsSelector,
    localizedLayerStylesEnvSelector
} from '../../selectors/localizedLayerStyles';
import {
    availableDependenciesForEditingWidgetSelector,
    dependenciesSelector,
    getEditingWidget,
    getEditorSettings,
    getFloatingWidgets,
    getWidgetLayer
} from '../../selectors/widgets';

export const wizardStateToProps = ( stateProps = {}, dispatchProps = {}, ownProps = {}) => ({
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
export const wizardSelector = createSelector(
    getWidgetLayer,
    getEditingWidget,
    getEditorSettings,
    getFloatingWidgets,
    isDashboardEditing,
    (layer, editorData, settings, widgets, dashBoardEditing) => ({
        layer: (editorData && editorData.layer) || layer,
        editorData,
        settings,
        widgets,
        dashBoardEditing
    })
);
export const dashboardSelector = createSelector(
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

export const dashboardsLocalizedSelector = createSelector(
    isLocalizedLayerStylesEnabledDashboardsSelector,
    currentLocaleLanguageSelector,
    localizedLayerStylesEnvSelector,
    (isLocalizedLayerStylesEnabled, language, env) => ({
        isLocalizedLayerStylesEnabled: !isNil(isLocalizedLayerStylesEnabled),
        language,
        env
    })
);

export default {
    getWidgetLayer,
    availableDependenciesForEditingWidgetSelector,
    dashboardSelector,
    dashboardsLocalizedSelector,
    wizardStateToProps,
    wizardSelector
};
