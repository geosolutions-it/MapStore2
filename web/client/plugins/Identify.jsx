/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {Glyphicon} = require('react-bootstrap');

const {connect} = require('react-redux');
const {createSelector} = require('reselect');

const {mapSelector} = require('../selectors/map');
const {layersSelector} = require('../selectors/layers');

const {getFeatureInfo, getVectorInfo, showMapinfoMarker, hideMapinfoMarker, showMapinfoRevGeocode, hideMapinfoRevGeocode, noQueryableLayers, clearWarning, toggleMapInfoState} = require('../actions/mapInfo');
const {changeMousePointer} = require('../actions/map');
const {changeMapInfoFormat, updateCenterToMarker, closeIdentify, purgeMapInfoResults} = require('../actions/mapInfo');
const {currentLocaleSelector} = require('../selectors/locale');

const {compose, defaultProps} = require('recompose');
const MapInfoUtils = require('../utils/MapInfoUtils');
const loadingState = require('../components/misc/enhancers/loadingState');
const {switchControlledDefaultViewer, defaultViewerHandlers, defaultViewerDefaultProps} = require('../components/data/identify/enhancers/defaultViewer');
const {identifyLifecycle, switchControlledIdentify} = require('../components/data/identify/enhancers/identify');
const defaultIdentifyButtons = require('./identify/defaultIdentifyButtons');
const {mapLayoutValuesSelector} = require('../selectors/maplayout');
const Message = require('./locale/Message');

const assign = require('object-assign');

require('./identify/identify.css');

const selector = createSelector([
    (state) => state.mapInfo && state.mapInfo.enabled || state.controls && state.controls.info && state.controls.info.enabled || false,
    (state) => state.mapInfo && state.mapInfo.responses || [],
    (state) => state.mapInfo && state.mapInfo.requests || [],
    (state) => state.mapInfo && state.mapInfo.infoFormat,
    mapSelector,
    layersSelector,
    (state) => state.mapInfo && state.mapInfo.clickPoint,
    (state) => state.mapInfo && state.mapInfo.clickLayer,
    (state) => state.mapInfo && state.mapInfo.showModalReverse,
    (state) => state.mapInfo && state.mapInfo.reverseGeocodeData,
    (state) => state.mapInfo && state.mapInfo.warning,
    currentLocaleSelector,
    state => mapLayoutValuesSelector(state, {height: true})
], (enabled, responses, requests, format, map, layers, point, layer, showModalReverse, reverseGeocodeData, warning, currentLocale, dockStyle) => ({
    enabled, responses, requests, format, map, layers, point, layer, showModalReverse, reverseGeocodeData, warning, currentLocale, dockStyle
}));
// result panel


const DefaultViewer = compose(
    switchControlledDefaultViewer,
    defaultViewerDefaultProps,
    defaultViewerHandlers,
    loadingState(({responses}) => responses.length === 0)
)(require('../components/data/identify/DefaultViewer'));

const identifyDefaultProps = defaultProps({
    enabled: false,
    draggable: true,
    collapsible: false,
    format: MapInfoUtils.getDefaultInfoFormatValue(),
    requests: [],
    responses: [],
    buffer: 2,
    viewerOptions: {},
    viewer: DefaultViewer,
    purgeResults: () => {},
    buildRequest: MapInfoUtils.buildIdentifyRequest,
    localRequest: () => {},
    sendRequest: () => {},
    showMarker: () => {},
    hideMarker: () => {},
    noQueryableLayers: () => {},
    clearWarning: () => {},
    changeMousePointer: () => {},
    showRevGeocode: () => {},
    hideRevGeocode: () => {},
    containerProps: {
        continuous: false
    },
    showModalReverse: false,
    reverseGeocodeData: {},
    enableRevGeocode: true,
    wrapRevGeocode: false,
    queryableLayersFilter: MapInfoUtils.defaultQueryableFilter,
    style: {},
    point: {},
    layer: null,
    map: {},
    layers: [],
    maxItems: 10,
    excludeParams: ["SLD_BODY"],
    includeOptions: [
        "buffer",
        "cql_filter",
        "filter",
        "propertyName"
    ],
    panelClassName: "modal-dialog info-panel modal-content",
    headerClassName: "modal-header",
    bodyClassName: "modal-body info-wrap",
    dock: true,
    headerGlyph: "",
    closeGlyph: "1-close",
    className: "square-button",
    allowMultiselection: false,
    currentLocale: 'en-US',
    fullscreen: false,
    showTabs: true,
    showCoords: true,
    showLayerTitle: true,
    position: 'right',
    size: 660,
    getButtons: defaultIdentifyButtons,
    showFullscreen: false,
    validator: MapInfoUtils.getValidator,
    zIndex: 1050
});

/**
 * Identify plugin. This plugin allows to perform getfeature info.
 * It can be configured to have a mobile or a desktop flavor.
 * It's enabled by default. The bubbling of an on_click_map action to GFI is stopped
 * if Annotations or FeatureGrid plugins are editing, draw or measurement supports are
 * active, the query panel is active or the identify plugin is disabled.
 * To restore old behaviour, in mapInfo state, set disabledAlwaysOn to true and
 * manage the plugin using toggleControl action with 'info' as control name.
 * It's possible also possible disable the plugin by changeMapInfoState or toggleMapInfoState actions
 *
 * @class Identify
 * @memberof plugins
 * @static
 *
 * @prop showIn {string[]} List of the plugins where to show the plugin
 * @prop cfg.dock {bool} true shows dock panel, false shows modal
 * @prop cfg.draggable {boolean} draggable info window, when modal
 * @prop cfg.viewerOptions {object}
 * @prop cfg.viewerOptions.container {expression} the container of the viewer, expression from the context
 * @prop cfg.viewerOptions.header {expression} the geader of the viewer, expression from the context{expression}
 * @prop cfg.disableCenterToMarker {bool} disable zoom to marker action
 * @prop cfg.zIndex {number} component z index order
 *
 * @example
 * {
 *   "name": "Identify",
 *   "showIn": ["Settings"],
 *   "cfg": {
 *       "draggable": false,
 *       "dock": true,
 *       "viewerOptions": {
 *          "container": "{context.ReactSwipe}",
 *          "header": "{context.SwipeHeader}"
 *       }
 *    }
 * }
 */

const IdentifyPlugin = compose(
    connect(selector, {
        sendRequest: getFeatureInfo,
        localRequest: getVectorInfo,
        purgeResults: purgeMapInfoResults,
        closeIdentify,
        changeMousePointer,
        showMarker: showMapinfoMarker,
        noQueryableLayers,
        clearWarning,
        hideMarker: hideMapinfoMarker,
        showRevGeocode: showMapinfoRevGeocode,
        hideRevGeocode: hideMapinfoRevGeocode,
        onEnableCenterToMarker: updateCenterToMarker.bind(null, 'enabled')
    }),
    identifyDefaultProps,
    switchControlledIdentify,
    defaultViewerHandlers,
    identifyLifecycle
)(require('../components/data/identify/IdentifyContainer'));

// configuration UI
const FeatureInfoFormatSelector = connect((state) => ({
    infoFormat: state.mapInfo && state.mapInfo.infoFormat
}), {
    onInfoFormatChange: changeMapInfoFormat
})(require("../components/misc/FeatureInfoFormatSelector"));

module.exports = {
    IdentifyPlugin: assign(IdentifyPlugin, {
        Toolbar: {
            name: 'info',
            position: 6,
            tooltip: "info.tooltip",
            icon: <Glyphicon glyph="map-marker"/>,
            help: <Message msgId="helptexts.infoButton"/>,
            action: toggleMapInfoState,
            selector: (state) => ({
                bsStyle: state.mapInfo && state.mapInfo.enabled ? "success" : "primary",
                active: !!(state.mapInfo && state.mapInfo.enabled)
            })
        },
        Settings: {
            tool: <FeatureInfoFormatSelector
                key="featureinfoformat"
                label={<Message msgId="infoFormatLbl" />
            }/>,
            position: 3
        }
    }),
    reducers: {mapInfo: require('../reducers/mapInfo')},
    epics: require('../epics/identify')
};
