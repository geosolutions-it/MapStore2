/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isNaN, isNil } from 'lodash';
import { compose, lifecycle, withHandlers } from 'recompose';

import { set } from '../../../../utils/ImmutableUtils';

/**
 * Enhancer to enable set index only if Component has header
 * - needsRefresh: check if current selected point if different of next point, if so return true
 * - onClose: delete results, close identify panel and hide the marker on map
 * - onChange: changed the coords OF GFI coord editor from the UI
 * @memberof enhancers.identifyHandlers
 * @class
 */
export const identifyHandlers = withHandlers({
    needsRefresh: () => (props, newProps) => {
        if (newProps.enabled && newProps.point && newProps.point.pixel) {
            if (!props.point || !props.point.pixel ||
                props.point.pixel.x !== newProps.point.pixel.x ||
                props.point.latlng !== newProps.point.latlng ||
                props.point.pixel.y !== newProps.point.pixel.y ) {
                return true;
            }
            if (!props.point || !props.point.pixel || newProps.point.pixel && props.format !== newProps.format) {
                return true;
            }
        }
        return false;
    },
    onClose: ({purgeResults = () => {}, closeIdentify = () => {}}) => () => {
        purgeResults();
        closeIdentify();
    },
    onSubmitClickPoint: ({
        onSubmitClickPoint = () => {},
        point
    }) => (val) => {
        const lat = !isNil(val.lat) && !isNaN(val.lat) ? parseFloat(val.lat) : 0;
        const lng = !isNil(val.lon) && !isNaN(val.lon) ? parseFloat(val.lon) : 0;
        let newPoint = set('latlng.lng', lng, set('latlng.lat', lat, point));
        onSubmitClickPoint(newPoint);
    },
    onChangeFormat: ({
        onChangeFormat = () => {}
    }) => (format) => {
        onChangeFormat(format);
    }
});

/**
 * Basic identify lifecycle used in Identify plugin with IdentifyContainer component
 * - componentDidMount: show cursor on map as pointer if enabled props is true
 * - componentWillReceiveProps:
 *      - changes pointer enable true/false - TODO: move it in an epic
 *      - set index to 0 to when responses are changed to avoid empty view if index is greater than current responses length
 * @memberof components.data.identify.enhancers.identify
 * @name identifyLifecycle
 */
export const identifyLifecycle = compose(
    identifyHandlers,
    lifecycle({
        componentDidMount() {
            const {
                enabled,
                showInMapPopup,
                maxItems,
                showAllResponses,
                changeMousePointer = () => {},
                disableCenterToMarker,
                enableInfoForSelectedLayers = true,
                onEnableCenterToMarker = () => {},
                setShowInMapPopup = () => {},
                checkIdentifyIsMounted = () => {},
                onInitPlugin = () => {},
                pluginCfg = {},
                enableHideEmptyPopupOption = () => {},
                hidePopupIfNoResults = false
            } = this.props;

            // Initialize plugin configuration
            onInitPlugin({
                enableInfoForSelectedLayers,
                configuration: {
                },
                maxItems,
                showAllResponses,
                highlight: pluginCfg?.highlightEnabledFromTheStart || false
            });
            if (hidePopupIfNoResults) {
                enableHideEmptyPopupOption(true);
            }
            if (enabled || showInMapPopup) {
                changeMousePointer('pointer');
                checkIdentifyIsMounted(true);
            } else {
                checkIdentifyIsMounted(false);
            }

            if (!disableCenterToMarker) {
                onEnableCenterToMarker();
            }
            setShowInMapPopup(showInMapPopup);
        },
        componentWillUnmount() {
            const {
                hideMarker = () => { },
                purgeResults = () => { },
                changeMousePointer = () => { },
                checkIdentifyIsMounted = () => {}
            } = this.props;
            changeMousePointer('auto');
            checkIdentifyIsMounted(false);
            hideMarker();
            purgeResults();
        },
        componentWillReceiveProps(newProps) {
            const {
                hideMarker = () => {},
                purgeResults = () => {},
                changeMousePointer = () => {},
                enabled
            } = this.props;
            if (newProps.enabled && !enabled) {
                changeMousePointer('pointer');
            } else if (!newProps.enabled && enabled) {
                changeMousePointer('auto');
                hideMarker();
                purgeResults();
            }
            if (this.props.showInMapPopup !== newProps.showInMapPopup) {
                newProps.setShowInMapPopup?.(newProps.showInMapPopup);
            }
        }
    })
);

export default {
    identifyLifecycle
};
