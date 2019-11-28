/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {withProps, compose, withHandlers, withStateHandlers, branch, withPropsOnChange, mapPropsStream, createEventHandler} from 'recompose';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import { find, isEqual} from 'lodash';
import uuid from "uuid";


import {show} from '../../../../actions/mapEditor';

import {createMapObject} from '../../../../utils/GeoStoryUtils';
import {resourcesSelector, getCurrentFocusedContentEl, isFocusOnContentSelector} from '../../../../selectors/geostory';


import Message from '../../../I18N/Message';
import withNodeSelection from '../../../widgets/builder/wizard/map/enhancers/handleNodeSelection';

import withConfirm from '../../../misc/withConfirm';
import ToolbarButton from '../../../misc/toolbar/ToolbarButton';
const ConfirmButton = withConfirm(ToolbarButton);

/**
 * create a map property merging a resource map and a content map obj
 * resourceId a and map should be present in props
 */
export default compose(
    connect(
        createSelector(
            resourcesSelector,
            isFocusOnContentSelector,
            (resources, isContentFocused) => ({
                resources,
                isContentFocused
            }))),
    withProps(
        ({ resources, resourceId, map = {}}) => {
            const cleanedMap = {...map, layers: (map.layers || []).map(l => l ? l : undefined)};
            const resource = find(resources, { id: resourceId }) || {};
            return { map: createMapObject(resource.data, cleanedMap)};
        }
    ));
/**
 * Adds resourceId and content map props needed to connect the mapEditor to the map.
 * Adds disableReset prop when map hasn't been modified
 */
export const withFocusedContentMap = compose(
    connect(createSelector(getCurrentFocusedContentEl, (focusedEl = {}) => ({focusedEl }))), // Map connection and update withFocusedMap
    withProps(
        ({ focusedEl: {resourceId, map} = {}}) => {
            return { map: map || {},  resourceId, disableReset: !map };
        }
    ));
/**
 * It Adjusts the path to update content map config obj
 */
export const handleMapUpdate = withHandlers({
    onChangeMap: ({update, focusedContent = {}}) =>
        (path, value) => {
            update(`${focusedContent.path}.map.${path}`, value, "merge");
        },
    onChange: ({update, focusedContent = {}}) =>
        (path, value) => {
            update(focusedContent.path + `.${path}`, value, "merge");
        }});
/**
 * Connect and toggle advanced Editor
 */
export const handleAdvancedMapEditor = compose(
    connect(null, {toggleAdvancedEditing: show}),
    withHandlers({
        toggleAdvancedEditing: ({toggleAdvancedEditing = () => {}, map = {}}) => () => {
            const {id, ...data} = map;
            toggleAdvancedEditing('inlineEditor', {data, id});
        }
    })
);
/**
 * Handle edit map toggle, map rest and open AdvancedMapEditor.
 * Map reset restores the original resource map configuration by removing all content map configs
 */
export const handleToolbar = withHandlers({
    toggleEditing: ({editMap, update, focusedContent}) => () =>
        update(focusedContent.path + ".editMap", !editMap),
    onReset: ({update, focusedContent: {path = ""} = {}}) => () => {
        update(path + `.map`, undefined);
    },
    discardAndClose: ({update, focusedContent = {}}) => (contentMap) => {
        update(focusedContent.path + `.map`, contentMap);
        update(focusedContent.path + ".editMap", false);
    }
});
/**
 * It adds toolbar button and handling of layer selection
 */
const ResetButton = (props) => (<ConfirmButton
    glyph="repeat"
    bsStyle= "primary"
    className="square-button-md no-border"
    tooltipId="geostory.contentToolbar.resetMap"
    confirmTitle={<Message msgId="geostory.contentToolbar.resetMapConfirm" />}
    confirmContent={<Message msgId="geostory.contentToolbar.resetConfirmContent" />}
    {...props}
/>);

export const withToolbar = compose(
    withProps(({pendingChanges, toggleEditing, disableReset, onReset, toggleAdvancedEditing = () => {}}) => ({
        buttons: [{
            glyph: "floppy-disk",
            disabled: !pendingChanges,
            tooltipId: "geostory.contentToolbar.saveChanges",
            onClick: toggleEditing
        }, {
            renderButton: <ResetButton disabled={disableReset} onClick={onReset}/>
        },
        {
            glyph: "pencil",
            tooltipId: "geostory.contentToolbar.advancedMapEditor",
            onClick: toggleAdvancedEditing
        }]
    })),
    withNodeSelection,      // Node selection
    withStateHandlers(() => ({'editNode': undefined}), { // Node enable editing
        setEditNode: () => node => ({'editNode': node}),
        closeNodeEditor: () => () => ({'editNode': undefined})
    }),
    branch( // Setting node buttons
        ({editNode}) => !!editNode,
        withProps(({ selectedNodes = [], closeNodeEditor = () => {}}) => ({
            buttons: [{
                visible: selectedNodes.length === 1,
                tooltipId: "close",
                glyph: "1-close",
                onClick: closeNodeEditor
            }]
        })),
        withProps(({ selectedNodes = [], setEditNode = () => { }, buttons = [] }) => ({
            buttons: [{
                visible: selectedNodes.length === 1,
                glyph: "wrench",
                tooltipId: "toc.toolLayerSettingsTooltip",
                onClick: () => {setEditNode(selectedNodes[0]);}
            }, ...buttons]
        }))));


/**
* Add save changes logic.
*/
export const withSaveChanges = compose(
    withPropsOnChange(["focusedContent"], ({map, focusedEl: {map: contentMap} = {} } ) => ({contentMap, lastSavedMap: map})),
    withPropsOnChange(["map"], ({map, lastSavedMap}) => {
        return {pendingChanges: !isEqual(lastSavedMap, map)};
    })
);
/**
* Add close confirm if there are some pending changes
*/
export const withConfirmClose = compose(
    withProps(({toggleEditing})  => ({
        CloseBtn: (props) => (
            <ToolbarButton  onClick={toggleEditing} {...props} />)
    })),
    branch(
        ({pendingChanges}) => pendingChanges,
        withProps(({discardAndClose, contentMap}) => ({
            CloseBtn: (props) => (
                <ConfirmButton
                    onClick={ () =>discardAndClose(contentMap)}
                    confirmTitle={<Message msgId="geostory.contentToolbar.confirmCloseMapEditing" />}
                    confirmContent={<Message msgId="geostory.contentToolbar.pendingChangesDiscardConfirm" />}
                    {...props}/>)
        }))
    )
);

/**
 * Add local map state management to map component
 */
export const withLocalMapState  = mapPropsStream(props$ => {
    const { stream: onMapViewChanges$, handler: onMapViewLocalChanges} = createEventHandler();
    return props$
        .pluck('map')
        .distinctUntilChanged((a, b ) => isEqual(a, b))
        .switchMap((map) => {
            return onMapViewChanges$.map((localMapState) => {
                return { map: {...map, ...localMapState}};
            }).startWith({map});
        })
        .combineLatest(props$, ({map} = {}, props = {}) => {
            return {
                ...props,
                onMapViewLocalChanges,
                map
            };
        });
});
// current implementation will update the map only if the movement
// between 12 decimals in the reference system to avoid rounded value
// changes due to float mathematic operations.
const isNearlyEqual = function(a, b) {
    if (a === undefined || b === undefined) {
        return false;
    }
    return a.toFixed(12) - b.toFixed(12) === 0;
};
/**
 * Handle editing, when mapEditing is true, map changes updates the geostory state, otherwise local map state is updated
 */
export const withMapEditingAndLocalMapState = withHandlers( {
    onMapViewChanges: ({update, editMap = false, onMapViewLocalChanges, map: {center: oCenter = {}, zoom: oZoom} = {}} = {}) => ({center = {}, zoom, mapStateSource}) => {
        const equalCenter =  isNearlyEqual(oCenter.x, center.x) && isNearlyEqual(oCenter.y, center.y);
        if (editMap && !(equalCenter && oZoom === zoom)) {
            update("map", {center, zoom, mapStateSource: uuid()}, 'merge');
        } else {
            onMapViewLocalChanges({center, zoom, mapStateSource});
        }
    }
});
