/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setControlProperty } from '../actions/controls';
import { changeLayerProperties, removeNode, updateNode, addLayer } from '../actions/layers';

import {
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
import usePluginItems from '../hooks/usePluginItems';

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
    state => state.browser && state.browser.mobile ? 'mobile' : 'desktop',
    confirmDeleteBackgroundModalSelector,
    allowBackgroundsDeletionSelector, isCesium],
(projection, modalParams, backgroundList, deletedId, backgrounds, map, mapIsEditable, layers, controls, style, mode, confirmDeleteBackgroundModalObj, allowDeletion, isCesiumViewer) => ({
    modalParams,
    backgroundList,
    deletedId,
    backgrounds,
    size: map && map.size || {width: 0, height: 0},
    layers,
    start: controls.start || 0,
    enabled: controls.enabled,
    style,
    confirmDeleteBackgroundModal: confirmDeleteBackgroundModalObj,
    allowDeletion,
    projection,
    disableTileGrids: !!isCesiumViewer,
    enableTerrainList: !!isCesiumViewer,
    canEdit: !!(mode !== 'mobile' && mapIsEditable !== false)
}));
/**
 * BackgroundSelectorComponent is a React component that renders the BackgroundSelector
 * with configured items for the background toolbar.
 *
 * @component
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.items - The list of items to be rendered in the background selector.
 *
 * Each item in the `items` array has the following structure:
 * @param {Object} item - An individual item in the background selector.
 * @param {string} item.name - The name of the item.
 * @param {boolean} [item.doNotHide] - Flag indicating whether the item should be hidden.
 * @param {number} item.priority - The priority of the item for display order.
 * @param {string} item.target - The target area where the item will be displayed (e.g., 'background-toolbar').
 * @param {Object} [item.cfg] - Configuration options for the item.
 * @param {boolean} [item.cfg.wrap] - Flag indicating whether to wrap the item.
 * @param {Array} item.items - An array of nested items
 * @param {Object} props.modalParams - Parameters for modal dialogs
 * @param {Array} props.backgroundList - List of available background layers
 * @param {string} props.deletedId - ID of the deleted background layer
 * @param {Array} props.backgrounds - All background layers
 * @param {Object} props.size - Map size dimensions with width and height
 * @param {Array} props.layers - all map layers with background group
 * @param {number} props.start - Starting index for pagination
 * @param {boolean} props.enabled - Whether the background selector is enabled
 * @param {Object} props.style - Layout style values
 * @param {Object} props.confirmDeleteBackgroundModal - Modal confirmation object
 * @param {boolean} props.allowDeletion - Whether background deletion is allowed
 * @param {string} props.projection - Current map projection
 * @param {boolean} props.disableTileGrids - Whether tile grids are disabled
 * @param {boolean} props.enableTerrainList - Whether terrain list is enabled
 * @param {boolean} props.canEdit - Whether editing is allowed
 *
 * @returns {JSX.Element} The rendered BackgroundSelector component with configured toolbar items.
 */
const BackgroundSelectorComponent = ({ items, ...props }, context) => {
    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({ items: items, loadedPlugins });
    const backgroundToolbarItems = configuredItems.filter(({ target }) => target === 'background-toolbar');
    return (<BackgroundSelector {...props} backgroundToolbarItems={backgroundToolbarItems}/>);
};

BackgroundSelectorComponent.contextTypes = {
    loadedPlugins: PropTypes.object
};

/**
  * BackgroundSelector Plugin.
  * This plugin allows users to select and manage background layers including terrain layers in the map.
  *
  * @class BackgroundSelector
  * @memberof plugins
  * @static
  */

const BackgroundSelectorPlugin = connect(backgroundSelector, {
    onPropertiesChange: changeLayerProperties,
    onStartChange: setControlProperty.bind(null, 'backgroundSelector', 'start'),
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
}))(BackgroundSelectorComponent);

export default createPlugin("BackgroundSelector", {
    component: BackgroundSelectorPlugin,
    reducers: {
        controls: controlsReducer,
        backgroundSelector: backgroundReducer
    },
    epics: backgroundEpic
});
