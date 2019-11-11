/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import PropTypes from 'prop-types';
import {compose, withProps, withHandlers, getContext, lifecycle} from 'recompose';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {indexOf} from 'lodash';
import {Glyphicon} from 'react-bootstrap';
import Message from '../components/I18N/Message';
import {toggleControl} from '../actions/controls';
import {saveMapResource} from '../actions/maps';
import {mapInfoSelector, mapSelector, mapInfoLoadingSelector, mapSaveErrorsSelector} from '../selectors/map';
import {layersSelector, groupsSelector} from '../selectors/layers';
import {backgroundListSelector} from '../selectors/backgroundselector';
import {mapOptionsToSaveSelector} from '../selectors/mapsave';
import handleSaveModal from '../components/resources/modals/enhancers/handleSaveModal';
import { userSelector, isLoggedIn } from '../selectors/security';
const {mapTypeSelector} = require('../selectors/maptype');
import { createPlugin } from '../utils/PluginsUtils';
import MapUtils from '../utils/MapUtils';
const showMapSaveSelector = state => state.controls && state.controls.mapSave && state.controls.mapSave.enabled;
const showMapSaveAsSelector = state => state.controls && state.controls.mapSaveAs && state.controls.mapSaveAs.enabled;
const textSearchConfigSelector = state => state.searchconfig && state.searchconfig.textSearchConfig;

const saveSelector = createSelector(
    userSelector,
    mapInfoLoadingSelector,
    mapSaveErrorsSelector,
    layersSelector,
    groupsSelector,
    backgroundListSelector,
    mapOptionsToSaveSelector,
    textSearchConfigSelector,
    mapSelector,
    mapTypeSelector,
    (user, loading, errors, layers, groups, backgrounds, additionalOptions, textSearchConfig, map, mapType) =>
        ({ user, loading, errors, layers, groups, backgrounds, additionalOptions, textSearchConfig, map, mapType })
);
const SaveBaseDialog = compose(
    connect(saveSelector, {
        saveMap: saveMapResource
    }),
    withProps({
        category: "MAP"
    }),
    getContext({
        router: PropTypes.object
    }),
    lifecycle({
        componentDidUpdate(prevProps) {
            if (this.props.isMapSaveAs && this.props.map && this.props.map.mapId && prevProps.map && this.props.map.mapId !== prevProps.map.mapId) {
                this.props.router.history.push("/viewer/" + this.props.mapType + "/" + this.props.map.mapId);
            }
        }
    }),
    withHandlers({
        onSave: ({map, layers, groups, backgrounds, textSearchConfig, additionalOptions, saveMap, isMapSaveAs, user}) => resource => {
            const data = MapUtils.saveMapConfiguration(map, layers, groups,
                backgrounds, textSearchConfig, additionalOptions);
            const attributes = {"owner": user && user.name || null};

            return !isMapSaveAs ? saveMap({data, ...resource}) :
                saveMap({data, metadata: {attributes, ...resource.metadata}, category: resource.category});
        }
    }),
    handleSaveModal
)(require('../components/resources/modals/Save'));

export const MapSave = createPlugin('MapSave', {
    component: compose(
        connect(createSelector(
            showMapSaveSelector,
            mapInfoSelector,
            (show, resource) => ({show, resource})),
        {
            onClose: toggleControl.bind(null, 'mapSave', false)
        }))(SaveBaseDialog),
    containers: {
        BurgerMenu: {
            name: 'save',
            position: 30,
            text: <Message msgId="save"/>,
            icon: <Glyphicon glyph="floppy-open"/>,
            action: toggleControl.bind(null, 'mapSave', null),
            // display the BurgerMenu button only if the map can be edited
            selector: createSelector(
                isLoggedIn,
                mapInfoSelector,
                (loggedIn, {canEdit, id} = {}) => ({
                    style: loggedIn && id && canEdit ? {} : { display: "none" }// the resource is new (no resource) or if present, is editable
                })
            )
        }
    }
});

export const MapSaveAs = createPlugin('MapSaveAs', {
    component: compose(
        connect(createSelector(
            showMapSaveAsSelector,
            mapInfoSelector,
            (show, resource) => ({show, resource})),
        {
            onClose: toggleControl.bind(null, 'mapSaveAs', false)
        }),
        withProps({
            isMapSaveAs: true
        }))(SaveBaseDialog),
    containers: {
        BurgerMenu: {
            name: 'saveAs',
            position: 31,
            text: <Message msgId="saveAs"/>,
            icon: <Glyphicon glyph="floppy-open"/>,
            action: toggleControl.bind(null, 'mapSaveAs', null),
            // display the BurgerMenu button only if the map can be edited
            selector: (state) => {
                if (state && state.controls && state.controls.saveAs && state.controls.saveAs.allowedRoles) {
                    return indexOf(state.controls.saveAs.allowedRoles, state && state.security && state.security.user && state.security.user.role) !== -1 ? {} : { style: {display: "none"} };
                }
                return { style: isLoggedIn(state) ? {} : {display: "none"} };
            }
        }
    }
});

