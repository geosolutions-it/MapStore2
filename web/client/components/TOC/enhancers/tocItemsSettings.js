/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { isNil, isEqual, isArray, isFunction } = require('lodash');
const { withState, withHandlers, compose, lifecycle } = require('recompose');

/**
 * Enhancer for settings state needed in TOCItemsSettings plugin
 * - onShowAlertModal, alert modal appears on close in case of changes in TOCItemsSettings
 * - onShowEditor, edit modal appears on format info in TOCItemsSettings
 * @memberof enhancers.settingsState
 * @class
 */
const settingsState = compose(
    withState('alertModal', 'onShowAlertModal', false),
    withState('showEditor', 'onShowEditor', false)
);

/**
 * Basic toc settings lificycle used in TOCItemsSettings plugin with TOCItemsSettings component
 * Handlers:
 * - onClose: triggers onHideSettings only if the settings doesn't change, in case of changes will trigger onShowAlertModal
 * - onSave: triggers onHideSettings
 * Lifecycle:
 * - componentWillMount: set original and initial settings of current node
 * - componentWillReceiveProps: in case of missing description of node, it sends a get capabilities requiest to retrieve data of layer
 * - componentWillUpdate: check if current settings are not expanded and next are expanded to restore initial and original settings of component
 * @memberof enhancers.settingsLifecycle
 * @class
 */
const settingsLifecycle = compose(
    withHandlers({
        onClose: ({ onUpdateInitialSettings = () => {}, onUpdateOriginalSettings = () => {}, onUpdateNode = () => {}, originalSettings, settings, onHideSettings = () => {}, onShowAlertModal = () => {} }) => (forceClose, tabsCloseActions = []) => {
            const originalOptions = Object.keys(settings.options).reduce((options, key) => ({ ...options, [key]: key === 'opacity' && !originalSettings[key] && 1.0 || originalSettings[key] }), {});
            if (!isEqual(originalOptions, settings.options) && !forceClose) {
                onShowAlertModal(true);
            } else {
                if (isArray(tabsCloseActions)) {
                    tabsCloseActions.forEach(tabOnClose => {
                        if (isFunction(tabOnClose)) {
                            tabOnClose();
                        }
                    });
                }
                onUpdateNode(
                    settings.node,
                    settings.nodeType,
                    { ...settings.options, ...originalSettings }
                );
                onHideSettings();
                onShowAlertModal(false);
                // clean up internal settings state
                onUpdateOriginalSettings({});
                onUpdateInitialSettings({});
            }
        },
        onSave: ({ onUpdateInitialSettings = () => {}, onUpdateOriginalSettings = () => {}, onHideSettings = () => { }, onShowAlertModal = () => { } }) => (tabsCloseActions = []) => {
            if (isArray(tabsCloseActions)) {
                tabsCloseActions.forEach(tabOnClose => {
                    if (isFunction(tabOnClose)) {
                        tabOnClose();
                    }
                });
            }
            onHideSettings();
            onShowAlertModal(false);
            // clean up internal settings state
            onUpdateOriginalSettings({});
            onUpdateInitialSettings({});
        }
    }),
    lifecycle({
        componentWillMount() {
            const {
                element = {},
                onUpdateOriginalSettings = () => { },
                onUpdateInitialSettings = () => { }
            } = this.props;

            // store changed keys
            onUpdateOriginalSettings({ });
            // store initial settings (internal state)
            onUpdateInitialSettings({ ...element });
        },
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
                onUpdateOriginalSettings = () => { },
                onUpdateInitialSettings = () => { },
                onSetTab = () => { }
            } = this.props;

            if (!settings.expanded && newProps.settings && newProps.settings.expanded) {
                // update initial and original settings
                onUpdateOriginalSettings({ });
                onUpdateInitialSettings({ ...newProps.element });
                onSetTab(initialActiveTab);
            }
        }
    })
);

module.exports = {
    settingsState,
    settingsLifecycle,
    /**
     * Enhancer for compose together settings lifecycle and state
     * @memberof enhancers.updateSettingsLifecycle
     * @class
     */
    updateSettingsLifecycle: compose(
        settingsState,
        settingsLifecycle
    )
};
