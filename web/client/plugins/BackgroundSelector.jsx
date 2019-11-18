/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {connect} = require('react-redux');
const {toggleControl, setControlProperty} = require('../actions/controls');
const {changeLayerProperties, updateNode} = require('../actions/layers');
const {addBackground, addBackgroundProperties, confirmDeleteBackgroundModal,
    updateThumbnail, removeBackground, clearModalParameters, backgroundEdited, setCurrentBackgroundLayer} = require('../actions/backgroundselector');

const {createSelector} = require('reselect');
const {backgroundControlsSelector,
    currentBackgroundSelector, tempBackgroundSelector} = require('../selectors/layers');
const {mapSelector, mapInfoSelector} = require('../selectors/map');
const {modalParamsSelector, isDeletedIdSelector, backgroundListSelector,
    backgroundLayersSelector, confirmDeleteBackgroundModalSelector, allowBackgroundsDeletionSelector} = require('../selectors/backgroundselector');
const {mapLayoutValuesSelector} = require('../selectors/maplayout');
const {allBackgroundLayerSelector} = require('../selectors/layers');

const {projectionSelector} = require('../selectors/map');
const {removeNode} = require('../actions/layers');
const thumbs = require('./background/DefaultThumbs');

const backgroundSelector = createSelector([
    projectionSelector,
    modalParamsSelector,
    backgroundListSelector,
    isDeletedIdSelector,
    allBackgroundLayerSelector,
    mapSelector,
    mapInfoSelector,
    backgroundLayersSelector,
    backgroundControlsSelector,
    currentBackgroundSelector,
    tempBackgroundSelector,
    state => mapLayoutValuesSelector(state, {left: true, bottom: true}),
    state => state.controls && state.controls.metadataexplorer && state.controls.metadataexplorer.enabled,
    confirmDeleteBackgroundModalSelector,
    allowBackgroundsDeletionSelector],
(projection, modalParams, backgroundList, deletedId, backgrounds, map, mapInfo, layers, controls, currentLayer, tempLayer, style, enabledCatalog, confirmDeleteBackgroundModalObj, allowDeletion) => ({
    modalParams,
    backgroundList,
    deletedId,
    backgrounds,
    size: map && map.size || {width: 0, height: 0},
    mapIsEditable: mapInfo && mapInfo.canEdit,
    layers,
    tempLayer,
    currentLayer,
    start: controls.start || 0,
    enabled: controls.enabled,
    style,
    enabledCatalog,
    confirmDeleteBackgroundModal: confirmDeleteBackgroundModalObj,
    allowDeletion,
    projection
}));

/**
  * BackgroundSelector Plugin.
  * @class BackgroundSelector
  * @memberof plugins
  * @static
  *
  * @prop {number} cfg.left plugin position from left of the map
  * @prop {number} cfg.bottom plugin position from bottom of the map
  * @prop {object} cfg.dimensions dimensions of buttons
  * @class
  * @example
  * {
  *   "name": "BackgroundSelector",
  *   "cfg": {
  *     "dimensions": {
  *       "side": 65,
  *       "sidePreview": 65,
  *       "frame": 3,
  *       "margin": 5,
  *       "label": false,
  *       "vertical": true
  *     }
  *   }
  * }
  */

const BackgroundSelectorPlugin = connect(backgroundSelector, {
    onPropertiesChange: changeLayerProperties,
    onToggle: toggleControl.bind(null, 'backgroundSelector', null),
    onLayerChange: setControlProperty.bind(null, 'backgroundSelector'),
    onStartChange: setControlProperty.bind(null, 'backgroundSelector', 'start'),
    onAdd: addBackground,
    onRemove: removeNode,
    onBackgroundEdit: backgroundEdited,
    updateNode,
    onUpdateThumbnail: updateThumbnail,
    removeBackground,
    clearModal: clearModalParameters,
    addBackgroundProperties,
    onRemoveBackground: confirmDeleteBackgroundModal,
    setCurrentBackgroundLayer
}, (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    thumbs: {
        ...thumbs,
        ...ownProps.thumbs
    }
})
)(require('../components/background/BackgroundSelector'));

module.exports = {
    BackgroundSelectorPlugin,
    reducers: {
        controls: require('../reducers/controls'),
        backgroundSelector: require('../reducers/backgroundselector')
    },
    epics: require('../epics/backgroundselector')
};
