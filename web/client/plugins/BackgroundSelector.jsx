/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {connect} = require('react-redux');
const {compose, withProps} = require('recompose');
const {find} = require('lodash');


const {toggleControl, setControlProperty} = require('../actions/controls');
const {changeLayerProperties, removeNode, updateNode, addLayer} = require('../actions/layers');
const {addBackground, addBackgroundProperties, confirmDeleteBackgroundModal, backgroundAdded,
    updateThumbnail, removeBackground, clearModalParameters, backgroundEdited, setCurrentBackgroundLayer} = require('../actions/backgroundselector');

const {createSelector} = require('reselect');
const {allBackgroundLayerSelector, backgroundControlsSelector,
    currentBackgroundSelector, tempBackgroundSelector} = require('../selectors/layers');
const {mapSelector, mapIsEditableSelector, projectionSelector} = require('../selectors/map');
const {modalParamsSelector, isDeletedIdSelector, backgroundListSelector,
    backgroundLayersSelector, confirmDeleteBackgroundModalSelector, allowBackgroundsDeletionSelector} = require('../selectors/backgroundselector');
const {mapLayoutValuesSelector} = require('../selectors/maplayout');

const thumbs = require('./background/DefaultThumbs');

const backgroundSelector = createSelector([
    projectionSelector,
    modalParamsSelector,
    backgroundListSelector,
    isDeletedIdSelector,
    allBackgroundLayerSelector,
    mapSelector,
    mapIsEditableSelector,
    backgroundLayersSelector,
    backgroundControlsSelector,
    currentBackgroundSelector,
    tempBackgroundSelector,
    state => mapLayoutValuesSelector(state, {left: true, bottom: true}),
    state => state.controls && state.controls.metadataexplorer && state.controls.metadataexplorer.enabled,
    state => state.browser && state.browser.mobile ? 'mobile' : 'desktop',
    confirmDeleteBackgroundModalSelector,
    allowBackgroundsDeletionSelector],
(projection, modalParams, backgroundList, deletedId, backgrounds, map, mapIsEditable, layers, controls, currentLayer, tempLayer, style, enabledCatalog, mode, confirmDeleteBackgroundModalObj, allowDeletion) => ({
    mode,
    modalParams,
    backgroundList,
    deletedId,
    backgrounds,
    size: map && map.size || {width: 0, height: 0},
    mapIsEditable,
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

const BackgroundSelectorPlugin =
compose(
    connect(backgroundSelector, {
        onPropertiesChange: changeLayerProperties,
        onToggle: toggleControl.bind(null, 'backgroundSelector', null),
        onLayerChange: setControlProperty.bind(null, 'backgroundSelector'),
        onStartChange: setControlProperty.bind(null, 'backgroundSelector', 'start'),
        onAdd: addBackground,
        addLayer: addLayer,
        backgroundAdded,
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
    })),
    // check if catalog is present to render the + button. TODO: move the add button in the catalog
    withProps(({ items = [] }) => ({
        hasCatalog: !!find(items, { name: 'MetadataExplorer' })
    }))
)(require('../components/background/BackgroundSelector'));

module.exports = {
    BackgroundSelectorPlugin,
    reducers: {
        controls: require('../reducers/controls'),
        backgroundSelector: require('../reducers/backgroundselector')
    },
    epics: require('../epics/backgroundselector')
};
