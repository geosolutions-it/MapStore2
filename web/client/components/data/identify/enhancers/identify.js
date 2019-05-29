/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {lifecycle, withHandlers, branch, withState, compose} = require('recompose');
const {set} = require('../../../../utils/ImmutableUtils');
const {isEqual, isNil} = require('lodash');

/**
 * Enhancer to enable set index only if Component has not header in viewerOptions props
 * @memberof enhancers.switchControlledIdentify
 * @class
 */
const switchControlledIdentify = branch(
    ({viewerOptions}) => !viewerOptions || (viewerOptions && !viewerOptions.header),
    withState(
        'index', 'setIndex', 0
    )
);

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
    onClose: ({hideMarker = () => {}, purgeResults = () => {}, closeIdentify = () => {}}) => () => {
        hideMarker();
        purgeResults();
        closeIdentify();
    },
    onChangeClickPoint: ({
        onChangeClickPoint = () => {},
        point
    }) => (coord, val) => {
        let changedCoord = coord === "lat" ? "lat" : "lng";
        let newPoint = set(`latlng.${changedCoord}`, !isNil(val) ? parseFloat(val) : 0, point);
        onChangeClickPoint(newPoint);
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
        componentWillReceiveProps(newProps) {
            const {
                hideMarker = () => {},
                purgeResults = () => {},
                changeMousePointer = () => {},
                setIndex,
                enabled,
                responses
            } = this.props;
            if (newProps.enabled && !enabled) {
                changeMousePointer('pointer');
            } else if (!newProps.enabled && enabled) {
                changeMousePointer('auto');
                hideMarker();
                purgeResults();
            }
            // reset current page on new requests set
            if (setIndex && !isEqual(newProps.responses, responses)) {
                setIndex(0);
            }
        }
    })
);

module.exports = {
    identifyLifecycle,
    switchControlledIdentify
};
