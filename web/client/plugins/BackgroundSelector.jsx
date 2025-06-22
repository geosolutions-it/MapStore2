/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';

import { compose, withProps } from 'recompose';
import { find } from 'lodash';
import { setControlProperty } from '../actions/controls';
import { changeLayerProperties, removeNode, updateNode, addLayer } from '../actions/layers';

import {
    addBackground,
    addBackgroundProperties,
    confirmDeleteBackgroundModal,
    backgroundAdded,
    updateThumbnail,
    removeBackground,
    clearModalParameters,
    backgroundEdited
} from '../actions/backgroundselector';

import { createSelector } from 'reselect';

import {
    allBackgroundLayerSelector,
    backgroundControlsSelector
} from '../selectors/layers';

import { mapSelector, mapIsEditableSelector, projectionSelector } from '../selectors/map';

import {
    modalParamsSelector,
    isDeletedIdSelector,
    backgroundListSelector,
    backgroundLayersSelector,
    confirmDeleteBackgroundModalSelector,
    allowBackgroundsDeletionSelector
} from '../selectors/backgroundselector';

import { mapLayoutValuesSelector } from '../selectors/maplayout';
import thumbs from './background/DefaultThumbs';
import { createPlugin } from '../utils/PluginsUtils';

import controlsReducer from "../reducers/controls";
import backgroundReducer from "../reducers/backgroundselector";
import backgroundEpic from "../epics/backgroundselector";
import BackgroundSelector from "../components/background/BackgroundSelector";
import { isCesium } from '../selectors/maptype';

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
    state => mapLayoutValuesSelector(state, {left: true, bottom: true}),
    state => state.controls && state.controls.metadataexplorer && state.controls.metadataexplorer.enabled,
    state => state.browser && state.browser.mobile ? 'mobile' : 'desktop',
    confirmDeleteBackgroundModalSelector,
    allowBackgroundsDeletionSelector, isCesium],
(projection, modalParams, backgroundList, deletedId, backgrounds, map, mapIsEditable, layers, controls, style, enabledCatalog, mode, confirmDeleteBackgroundModalObj, allowDeletion, isCesiumViewer) => ({
    mode,
    modalParams,
    backgroundList,
    deletedId,
    backgrounds,
    size: map && map.size || {width: 0, height: 0},
    mapIsEditable,
    layers,
    start: controls.start || 0,
    enabled: controls.enabled,
    style,
    enabledCatalog,
    confirmDeleteBackgroundModal: confirmDeleteBackgroundModalObj,
    allowDeletion,
    projection,
    disableTileGrids: !!isCesiumViewer,
    isCesium: isCesiumViewer
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
        onRemoveBackground: confirmDeleteBackgroundModal
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
)(BackgroundSelector);

export default createPlugin("BackgroundSelector", {
    component: BackgroundSelectorPlugin,
    reducers: {
        controls: controlsReducer,
        backgroundSelector: backgroundReducer
    },
    epics: backgroundEpic
});
