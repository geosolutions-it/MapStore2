/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {isNil, isEqual} = require('lodash');
const {withState, withHandlers, compose, lifecycle} = require('recompose');

const settingsState = compose(
    withState('originalSettings', 'onUpdateOriginalSettings', {}),
    withState('initialSettings', 'onUpdateInitialSettings', {}),
    withState('alertModal', 'onShowAlertModal', false),
    withState('showEditor', 'onShowEditor', false)
);

const settingsLifecycle = compose(
    withHandlers({
        onUpdateParams: props => (newParams, update = true) => {
            let originalSettings = {...props.originalSettings};
            // TODO one level only storage of original settings for the moment
            Object.keys(newParams).forEach((key) => {
                originalSettings[key] = props.initialSettings[key];
            });
            props.onUpdateOriginalSettings(originalSettings);
            props.onUpdateSettings(newParams);
            if (update) {
                props.onUpdateNode(
                    props.settings.node,
                    props.settings.nodeType,
                    {...props.settings.options, ...newParams}
                );
            }
        },
        onClose: ({onUpdateNode, originalSettings, settings, onHideSettings, onShowAlertModal}) => forceClose => {
            const originalOptions = Object.keys(settings.options).reduce((options, key) => ({...options, [key]: key === 'opacity' && !originalSettings[key] && 1.0 || originalSettings[key]}), {});
            if (!isEqual(originalOptions, settings.options) && !forceClose) {
                onShowAlertModal(true);
            } else {
                onUpdateNode(
                    settings.node,
                    settings.nodeType,
                    {...settings.options, ...originalSettings}
                );
                onHideSettings();
                onShowAlertModal(false);
            }
        },
        onSave: ({onHideSettings = () => {}, onShowAlertModal = () => {}}) => () => {
            onHideSettings();
            onShowAlertModal(false);
        }
    }),
    lifecycle({
        componentWillMount() {
            const {
                element = {},
                onUpdateOriginalSettings = () => {},
                onUpdateInitialSettings = () => {}
            } = this.props;

            onUpdateOriginalSettings({...element});
            onUpdateInitialSettings({...element});
        },
        componentWillReceiveProps(newProps) {
            // an empty description does not trigger the single layer getCapabilites,
            // it does only for missing description
            const {
                settings = {},
                onRetrieveLayerData = () => {}
            } = this.props;

            if (!settings.expanded && newProps.settings && newProps.settings.expanded && isNil(newProps.element.description) && newProps.element.type === "wms") {
                onRetrieveLayerData(newProps.element);
            }
        },
        componentWillUpdate(newProps) {
            const {
                settings = {},
                onUpdateOriginalSettings = () => {},
                onUpdateInitialSettings = () => {},
                onSetTab = () => {}
            } = this.props;

            if (!settings.expanded && newProps.settings && newProps.settings.expanded) {
                // update initial and original settings
                onUpdateOriginalSettings({...newProps.element});
                onUpdateInitialSettings({...newProps.element});
                onSetTab('general');
            }
        }
    })
);

module.exports = {
    settingsState,
    settingsLifecycle,
    updateSettingsLifecycle: compose(
        settingsState,
        settingsLifecycle
    )
};
