/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {lifecycle, withHandlers, compose} = require('recompose');
const {set} = require('../../../../utils/ImmutableUtils');
const {isNil, isNaN} = require('lodash');

/**
 * Enhancer to enable set index only if Component has header
 * - needsRefresh: check if current selected point if different of next point, if so return true
 * - onClose: delete results, close identify panel and hide the marker on map
 * - onChange: changed the coords OF GFI coord editor from the UI
 * @memberof enhancers.identifyHandlers
 * @class
 */
const identifyHandlers = withHandlers({
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
const identifyLifecycle = compose(
    identifyHandlers,
    lifecycle({
        componentDidMount() {
            const {
                enabled,
                changeMousePointer = () => {},
                disableCenterToMarker,
                onEnableCenterToMarker = () => {}
            } = this.props;

            if (enabled) {
                changeMousePointer('pointer');
            }

            if (!disableCenterToMarker) {
                onEnableCenterToMarker();
            }
        },
        componentWillUnmount() {
            const {
                hideMarker = () => { },
                purgeResults = () => { },
                changeMousePointer = () => { }
            } = this.props;
            changeMousePointer('auto');
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
        }
    })
);

module.exports = {
    identifyLifecycle
};
