/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { isNil, isEqual } = require('lodash');
const { withState, withHandlers, compose, lifecycle } = require('recompose');

/**
 * Enhancer for settings state needed in TOCItemsSettings plugin
 * - originalSettings and initialSettings are the settings of node needed in onUpdateParams
 * - onShowAlertModal, alert modal appears on close in case of changes in TOCItemsSettings
 * - onShowEditor, edit modal appears on format info in TOCItemsSettings
 * @memberof enhancers.settingsState
 * @class
 */
const settingsState = compose(
    withState('originalSettings', 'onUpdateOriginalSettings', {}),
    withState('initialSettings', 'onUpdateInitialSettings', {}),
    withState('alertModal', 'onShowAlertModal', false),
    withState('showEditor', 'onShowEditor', false)
);

/**
 * Basic toc settings lificycle used in TOCItemsSettings plugin with TOCItemsSettings component
 * Handlers:
 * - onUpdateParams: update settings by key and value of the current node
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
        onUpdateParams: ({
            settings = {},
            initialSettings = {},
            originalSettings: orig,
            onUpdateOriginalSettings = () => {},
            onUpdateSettings = () => {},
            onUpdateNode = () => {}
        }) => (newParams, update = true) => {
            let originalSettings = { ...(orig || {}) };
            // TODO one level only storage of original settings for the moment
            Object.keys(newParams).forEach((key) => {
                originalSettings[key] = initialSettings && initialSettings[key];
            });
            // update changed keys to verify only modified values (internal state)
            onUpdateOriginalSettings(originalSettings);

            onUpdateSettings(newParams);
            if (update) {
                onUpdateNode(
                    settings.node,
                    settings.nodeType,
                    { ...settings.options, ...newParams }
                );
            }
        },
        onClose: ({ onUpdateInitialSettings = () => {}, onUpdateOriginalSettings = () => {}, onUpdateNode, originalSettings, settings, onHideSettings, onShowAlertModal }) => forceClose => {
            const originalOptions = Object.keys(settings.options).reduce((options, key) => ({ ...options, [key]: key === 'opacity' && !originalSettings[key] && 1.0 || originalSettings[key] }), {});
            if (!isEqual(originalOptions, settings.options) && !forceClose) {
                onShowAlertModal(true);
            } else {
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
        onSave: ({ onUpdateInitialSettings = () => {}, onUpdateOriginalSettings = () => {}, onHideSettings = () => { }, onShowAlertModal = () => { } }) => () => {
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
            onUpdateOriginalSettings({ ...element });
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
                settings = {},
                onUpdateOriginalSettings = () => { },
                onUpdateInitialSettings = () => { },
                onSetTab = () => { }
            } = this.props;

            if (!settings.expanded && newProps.settings && newProps.settings.expanded) {
                // update initial and original settings
                onUpdateOriginalSettings({ ...newProps.element });
                onUpdateInitialSettings({ ...newProps.element });
                onSetTab('general');
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
