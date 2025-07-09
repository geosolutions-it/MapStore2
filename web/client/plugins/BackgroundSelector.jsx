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
  * BackgroundSelector Plugin. This plugin allows users to select and manage background layers including terrain layers in the map.
  * @name BackgroundSelector
  * @class
  * @memberof plugins
  * @static
  * @prop {object[]} items this property contains the items injected from the other plugins,
  * using the `containers` option in the plugin that want to inject the components.
  * You can select the position where to insert the components adding the `target` property.
  * The allowed target is:
  * - `background-toolbar` target add a button background toolbar
  * ```javascript
  * const MyButtonComponent = connect(null, {
  *     onClick: myAction,
  *     disabled
  * })(({
  *    onClick, // custom action callback
  *    itemComponent // default component that provides a consistent UI
  *    }) => {
  *    const Component = itemComponent;
  *    return (<Component
  *        disabled={disabled}
  *        onClick={() => {
  *            onClick(true);
  *        }}
  *        glyph="glyph"
  *        tooltipId="path"
  *    />);
  * });
  * createPlugin(
  *  'MyPlugin',
  *  {
  *      containers: {
  *          MetadataExplorer: {
  *              name: "TOOLNAME", // a name for the current tool.
  *              target: "background-toolbar", // the target where to insert the component
  *              Component: MyButtonComponent
  *          },
  * // ...
  * ```
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
