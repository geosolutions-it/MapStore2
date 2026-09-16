/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isArray, isFunction, isNil } from 'lodash';
import { compose, lifecycle, withHandlers } from 'recompose';

/**
 * Basic toc settings lificycle used in TOCItemsSettings plugin with TOCItemsSettings component
 * Handlers:
 * - onClose: triggers onHideSettings only if the settings doesn't change, in case of changes will trigger onShowAlertModal
 * - onSave: triggers onHideSettings
 * Lifecycle:
 * - UNSAFE_componentWillMount: set original and initial settings of current node
 * - componentWillReceiveProps: in case of missing description of node, it sends a get capabilities requiest to retrieve data of layer
 * - componentWillUpdate: check if current settings are not expanded and next are expanded to restore initial and original settings of component
 * @memberof enhancers.settingsLifecycle
 * @class
 */
export const settingsLifecycle = compose(
    withHandlers({
        onClose: ({ onHideSettings = () => {}}) => (tabsCloseActions = []) => {
            if (isArray(tabsCloseActions)) {
                tabsCloseActions.forEach(tabOnClose => {
                    if (isFunction(tabOnClose)) {
                        tabOnClose();
                    }
                });
            }
            onHideSettings();
            // clean up internal settings state

        }
    }),
    lifecycle({
        componentWillReceiveProps(newProps) {
            // an empty description does not trigger the single layer getCapabilites,
            // it does only for missing description
            const {
                settings = {},
                onRetrieveLayerData = () => { }
            } = this.props;

            if (!settings.expanded && newProps.settings && newProps.settings.expanded && isNil(newProps.element.description) && newProps.element.type === "wms") {
                onRetrieveLayerData(newProps.element);
            }
        },
        componentWillUpdate(newProps) {
            const {
                initialActiveTab = 'general',
                settings = {},

                onSetTab = () => { }
            } = this.props;

            if (!settings.expanded && newProps.settings && newProps.settings.expanded) {
                onSetTab(initialActiveTab);
            }
        }
    })
);

export const updateSettingsLifecycle = compose(
    settingsLifecycle
);

export default {
    settingsLifecycle,
    /**
     * Enhancer for compose together settings lifecycle and state
     * @memberof enhancers.updateSettingsLifecycle
     * @class
     */
    updateSettingsLifecycle
};
