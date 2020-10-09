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
const { createSelector, createStructuredSelector} = require('reselect');
const assign = require('object-assign');
const {isUndefined} = require('lodash');

const {mapSelector, isMouseMoveIdentifyActiveSelector} = require('../selectors/map');
const {layersSelector} = require('../selectors/layers');
const { mapTypeSelector, isCesium } = require('../selectors/maptype');
const { generalInfoFormatSelector, clickPointSelector, indexSelector, responsesSelector, requestsSelector, validResponsesSelector, showEmptyMessageGFISelector, isHighlightEnabledSelector, currentFeatureSelector, currentFeatureCrsSelector, isLoadedResponseSelector } = require('../selectors/mapInfo');
const { isEditingAllowedSelector } = require('../selectors/featuregrid');
const {currentLocaleSelector} = require('../selectors/locale');
const {mapLayoutValuesSelector} = require('../selectors/maplayout');

const { hideMapinfoMarker, showMapinfoRevGeocode, hideMapinfoRevGeocode, clearWarning, toggleMapInfoState, changeMapInfoFormat, updateCenterToMarker, closeIdentify, purgeMapInfoResults, updateFeatureInfoClickPoint, changeFormat, toggleShowCoordinateEditor, changePage, toggleHighlightFeature, editLayerFeatures, setMapTrigger} = require('../actions/mapInfo');
const { changeMousePointer, zoomToExtent } = require('../actions/map');

const {getConfigProp} = require("../utils/ConfigUtils");
const { compose, defaultProps } = require('recompose');
const MapInfoUtils = require('../utils/MapInfoUtils');
const loadingState = require('../components/misc/enhancers/loadingState');
const {defaultViewerHandlers, defaultViewerDefaultProps} = require('../components/data/identify/enhancers/defaultViewer');
const {identifyLifecycle} = require('../components/data/identify/enhancers/identify');
const zoomToFeatureHandler = require('../components/data/identify/enhancers/zoomToFeatureHandler');
const getToolButtons = require('./identify/toolButtons');
const getFeatureButtons = require('./identify/featureButtons');
const Message = require('./locale/Message');

require('./identify/identify.css');

const selector = createStructuredSelector({
    enabled: (state) => state.mapInfo && state.mapInfo.enabled || state.controls && state.controls.info && state.controls.info.enabled || false,
    responses: responsesSelector,
    validResponses: validResponsesSelector,
    requests: requestsSelector,
    format: generalInfoFormatSelector,
    map: mapSelector,
    layers: layersSelector,
    point: clickPointSelector,
    showModalReverse: (state) => state.mapInfo && state.mapInfo.showModalReverse,
    reverseGeocodeData: (state) => state.mapInfo && state.mapInfo.reverseGeocodeData,
    warning: (state) => state.mapInfo && state.mapInfo.warning,
    currentLocale: currentLocaleSelector,
    dockStyle: state => mapLayoutValuesSelector(state, {height: true}),
    formatCoord: (state) => state.mapInfo && state.mapInfo.formatCoord || getConfigProp("defaultCoordinateFormat"),
    showCoordinateEditor: (state) => state.mapInfo && state.mapInfo.showCoordinateEditor,
    showEmptyMessageGFI: state => showEmptyMessageGFISelector(state),
    isEditingAllowed: isEditingAllowedSelector,
    isCesium,
    floatingIdentifyEnabled: (state) => isMouseMoveIdentifyActiveSelector(state)
});
// result panel

/*
 * Enhancer to enable set index only if Component has not header in viewerOptions props
 */
const identifyIndex = compose(
    connect(
        createSelector(indexSelector, isLoadedResponseSelector, (state) =>state.browser && state.browser.mobile, (index, loaded, isMobile) => ({ index, loaded, isMobile })),
        {
            setIndex: changePage
        }
    )
)
;
const DefaultViewer = compose(
    identifyIndex,
    defaultViewerDefaultProps,
    defaultViewerHandlers,
    loadingState(({loaded}) => isUndefined(loaded))
)(require('../components/data/identify/DefaultViewer'));


const identifyDefaultProps = defaultProps({
    formatCoord: "decimal",
    enabled: false,
    draggable: true,
    collapsible: false,
    format: MapInfoUtils.getDefaultInfoFormatValue(),
    requests: [],
    responses: [],
    viewerOptions: {},
    viewer: DefaultViewer,
    purgeResults: () => {},
    hideMarker: () => {},
    clearWarning: () => {},
    changeMousePointer: () => {},
    showRevGeocode: () => {},
    hideRevGeocode: () => {},
    containerProps: {
        continuous: false
    },
    enabledCoordEditorButton: true,
    showCoordinateEditor: false,
    showModalReverse: false,
    reverseGeocodeData: {},
    enableRevGeocode: true,
    wrapRevGeocode: false,
    style: {},
    point: {},
    layer: null,
    map: {},
    layers: [],
    panelClassName: "modal-dialog info-panel modal-content",
    headerClassName: "modal-header",
    bodyClassName: "modal-body info-wrap",
    dock: true,
    headerGlyph: "",
    closeGlyph: "1-close",
    className: "square-button",
    currentLocale: 'en-US',
    fullscreen: false,
    showTabs: true,
    showCoords: true,
    showLayerTitle: true,
    showMoreInfo: true,
    showEdit: false,
    position: 'right',
    size: 660,
    getToolButtons,
    getFeatureButtons,
    showFullscreen: false,
    validResponses: [],
    validator: MapInfoUtils.getValidator, // TODO: move all validation from the components to the selectors
    zIndex: 1050
});

/**
 * This plugin allows get informations about clicked point. It can be configured to have a mobile or a desktop flavor.
 *
 * You can configure some of the features of this plugin by setting up the initial mapInfo state, then you need to update the "initialState.defaultState", or by the plugin configuration
 * ```
 * "mapInfo": {
 *   "enabled": true, // enabled by default
 *   "disabledAlwaysOn": false, // if true, disable always on setup
 *   "configuration": {
 *     "showEmptyMessageGFI": false // allow or deny the visiibility of message when you have no results from identify request
 *     "infoFormat": "text/plain" // default infoformat value, other values are "text/html" for text only or "application/json" for properties
 *   }
 * }
 * ```
 *
 * @class Identify
 * @memberof plugins
 * @static
 *
 * @prop showIn {string[]} List of the plugins where to show the plugin
 * @prop cfg.dock {bool} true shows dock panel, false shows modal
 * @prop cfg.draggable {boolean} draggable info window, when modal
 * @prop cfg.showHighlightFeatureButton {boolean} show the highlight feature button if the interrogation returned valid features (openlayers only)
 * @prop cfg.viewerOptions.container {expression} the container of the viewer, expression from the context
 * @prop cfg.viewerOptions.header {expression} the header of the viewer, expression from the context{expression}
 * @prop cfg.disableCenterToMarker {bool} disable zoom to marker action
 * @prop cfg.zIndex {number} component z index order
 * @prop cfg.showInMapPopup {boolean} if true show the identify as popup
 * @prop cfg.showMoreInfo {boolean} if true shows the more info icon which allow user to show/hide Geocode viewer as popup (true by default)
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
 *
 */

const IdentifyPlugin = compose(
    connect(selector, {
        purgeResults: purgeMapInfoResults,
        closeIdentify,
        onSubmitClickPoint: updateFeatureInfoClickPoint,
        onToggleShowCoordinateEditor: toggleShowCoordinateEditor,
        onChangeFormat: changeFormat,
        changeMousePointer,
        clearWarning,
        hideMarker: hideMapinfoMarker,
        showRevGeocode: showMapinfoRevGeocode,
        hideRevGeocode: hideMapinfoRevGeocode,
        onEnableCenterToMarker: updateCenterToMarker.bind(null, 'enabled'),
        onEdit: editLayerFeatures
    }, (stateProps, dispatchProps, ownProps) => ({
        ...ownProps,
        ...stateProps,
        ...dispatchProps,
        enabled: stateProps.enabled && (stateProps.isCesium || !ownProps.showInMapPopup) && !stateProps.floatingIdentifyEnabled
    })),
    // highlight support
    compose(
        connect(
            createStructuredSelector({
                highlight: isHighlightEnabledSelector,
                currentFeature: currentFeatureSelector,
                currentFeatureCrs: currentFeatureCrsSelector
            }), {
                toggleHighlightFeature,
                zoomToExtent
            }
        ),
        zoomToFeatureHandler
    ),
    // disable with not supported mapTypes. TODO: remove when reproject (leaflet) and features draw available (cesium)
    connect(createSelector(mapTypeSelector, mapType => ({mapType})), {}, ({mapType}, _, { showHighlightFeatureButton, ...props }) => ({...props, showHighlightFeatureButton: mapType === 'openlayers' && showHighlightFeatureButton}) ),
    identifyDefaultProps,
    identifyIndex,
    defaultViewerHandlers,
    identifyLifecycle
)(require('../components/data/identify/IdentifyContainer'));

// configuration UI
const FeatureInfoFormatSelector = connect((state) => ({
    infoFormat: generalInfoFormatSelector(state)
}), {
    onInfoFormatChange: changeMapInfoFormat
})(require("../components/misc/FeatureInfoFormatSelector").default);

const FeatureInfoTriggerSelector = connect((state) => ({
    trigger: isMouseMoveIdentifyActiveSelector(state) ? 'hover' : 'click'
}), {
    onSetMapTrigger: setMapTrigger
})(require("../components/misc/FeatureInfoTriggerSelector"));

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
            tool: [<FeatureInfoFormatSelector
                key="featureinfoformat"
                label={<Message msgId="infoFormatLbl" />
                }/>, <FeatureInfoTriggerSelector
                key="featureinfotrigger" />],
            position: 3
        }
    }),
    reducers: {mapInfo: require('../reducers/mapInfo')},
    epics: require('../epics/identify').default
};
