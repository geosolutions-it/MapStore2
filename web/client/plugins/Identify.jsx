/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './identify/identify.css';

import { isUndefined } from 'lodash';
import assign from 'object-assign';
import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose, defaultProps } from 'recompose';
import { createSelector, createStructuredSelector } from 'reselect';

import { changeMousePointer, zoomToExtent } from '../actions/map';
import {
    changeFormat,
    changeMapInfoFormat,
    changePage,
    clearWarning,
    setShowInMapPopup,
    closeIdentify,
    editLayerFeatures,
    hideMapinfoMarker,
    hideMapinfoRevGeocode,
    purgeMapInfoResults,
    setMapTrigger,
    showMapinfoRevGeocode,
    toggleHighlightFeature,
    toggleMapInfoState,
    toggleShowCoordinateEditor,
    updateCenterToMarker,
    updateFeatureInfoClickPoint,
    checkIdentifyIsMounted,
    onInitPlugin
} from '../actions/mapInfo';
import DefaultViewerComp from '../components/data/identify/DefaultViewer';
import { defaultViewerDefaultProps, defaultViewerHandlers } from '../components/data/identify/enhancers/defaultViewer';
import { identifyLifecycle } from '../components/data/identify/enhancers/identify';
import zoomToFeatureHandler from '../components/data/identify/enhancers/zoomToFeatureHandler';
import IdentifyContainer from '../components/data/identify/IdentifyContainer';
import loadingState from '../components/misc/enhancers/loadingState';
import FeatureInfoFormatSelectorComp from '../components/misc/FeatureInfoFormatSelector';
import FeatureInfoTriggerSelectorComp from '../components/misc/FeatureInfoTriggerSelector';
import epics from '../epics/identify';
import mapInfo from '../reducers/mapInfo';
import mapPopups from '../reducers/mapPopups';
import { isEditingAllowedSelector } from '../selectors/featuregrid';
import { layersSelector } from '../selectors/layers';
import { currentLocaleSelector } from '../selectors/locale';
import { isMouseMoveIdentifyActiveSelector, mapSelector } from '../selectors/map';
import {
    clickPointSelector,
    currentFeatureCrsSelector,
    currentFeatureSelector,
    generalInfoFormatSelector,
    indexSelector,
    isHighlightEnabledSelector,
    isLoadedResponseSelector,
    requestsSelector,
    responsesSelector,
    showEmptyMessageGFISelector,
    validResponsesSelector,
    hoverEnabledSelector,
    mapInfoEnabledSelector
} from '../selectors/mapInfo';
import { mapLayoutValuesSelector } from '../selectors/maplayout';
import { isCesium, mapTypeSelector } from '../selectors/maptype';
import ConfigUtils from '../utils/ConfigUtils';
import { getDefaultInfoFormatValue, getValidator } from '../utils/MapInfoUtils';
import getFeatureButtons from './identify/featureButtons';
import getToolButtons from './identify/toolButtons';
import Message from './locale/Message';

const selector = createStructuredSelector({
    enabled: (state) => mapInfoEnabledSelector(state) || state.controls && state.controls.info && state.controls.info.enabled || false,
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
    dockStyle: (state) => mapLayoutValuesSelector(state, { height: true, right: true }, true),
    formatCoord: (state) => state.mapInfo && state.mapInfo.formatCoord || ConfigUtils.getConfigProp('defaultCoordinateFormat'),
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
        createSelector(indexSelector, isLoadedResponseSelector, (state) => state.browser && state.browser.mobile,  (index, loaded, isMobile) => ({ index, loaded, isMobile })),
        {
            setIndex: changePage
        }
    )
);
const DefaultViewer = compose(
    identifyIndex,
    defaultViewerDefaultProps,
    defaultViewerHandlers,
    loadingState(({ loaded }) => isUndefined(loaded))
)(DefaultViewerComp);


const identifyDefaultProps = defaultProps({
    formatCoord: "decimal",
    enabled: false,
    draggable: true,
    collapsible: false,
    format: getDefaultInfoFormatValue(),
    requests: [],
    responses: [],
    viewerOptions: {},
    viewer: DefaultViewer,
    purgeResults: () => { },
    hideMarker: () => { },
    clearWarning: () => { },
    changeMousePointer: () => { },
    showRevGeocode: () => { },
    checkIdentifyIsMounted: () => {},
    hideRevGeocode: () => { },
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
    size: 550,
    getToolButtons,
    getFeatureButtons,
    showFullscreen: false,
    validResponses: [],
    validator: getValidator, // TODO: move all validation from the components to the selectors
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
 * @prop cfg.showEdit {boolean} if true, and when the FeatureEditor plugin is present, shows and edit button to edit the current feature(s) clicked in the grid.
 * @prop cfg.enableInfoForSelectedLayers {boolean} if true, if some layer is selected in the TOC, the feature info is performed only on the selected ones. if false, the info is queried for all the layers, independently from selection. (default is true).
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
        onInitPlugin,
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
        onEdit: editLayerFeatures,
        checkIdentifyIsMounted
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
    connect(() => ({}), {
        setShowInMapPopup
    }),
    identifyLifecycle
)(IdentifyContainer);

// configuration UI
const FeatureInfoFormatSelector = connect((state) => ({
    infoFormat: generalInfoFormatSelector(state)
}), {
    onInfoFormatChange: changeMapInfoFormat
})(FeatureInfoFormatSelectorComp);

const FeatureInfoTriggerSelector = connect((state) => ({
    trigger: isMouseMoveIdentifyActiveSelector(state) ? 'hover' : 'click',
    hoverEnabled: hoverEnabledSelector(state)
}), {
    onSetMapTrigger: setMapTrigger,
    onPurgeMapInfoResults: purgeMapInfoResults,
    onHideMapinfoMarker: hideMapinfoMarker
})(FeatureInfoTriggerSelectorComp);

export default {
    IdentifyPlugin: assign(IdentifyPlugin, {
        Toolbar: {
            name: 'info',
            position: 6,
            tooltip: "info.tooltip",
            icon: <Glyphicon glyph="map-marker" />,
            help: <Message msgId="helptexts.infoButton" />,
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
                } />, <FeatureInfoTriggerSelector
                key="featureinfotrigger" />],
            position: 3
        }
    }),
    reducers: { mapInfo, mapPopups },
    epics
};
