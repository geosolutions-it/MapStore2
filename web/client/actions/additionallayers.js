/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const ADD_ADDITIONAL_LAYERS = 'ADDITIONALLAYER:ADD_ADDITIONAL_LAYERS';
export const REMOVE_ADDITIONAL_LAYER = 'ADDITIONALLAYER:REMOVE_ADDITIONAL_LAYER';
export const REMOVE_ALL_ADDITIONAL_LAYERS = 'ADDITIONALLAYER:REMOVE_ALL_ADDITIONAL_LAYERS';
export const UPDATE_ADDITIONAL_LAYER = 'ADDITIONALLAYER:UPDATE_ADDITIONAL_LAYER';
export const UPDATE_OPTIONS_BY_OWNER = 'ADDITIONALLAYER:UPDATE_OPTIONS_BY_OWNER';
export const MERGE_OPTIONS_BY_OWNER = 'ADDITIONALLAYER:MERGE_OPTIONS_BY_OWNER';
export const MERGE_OPTIONS_BY_ID = 'ADDITIONALLAYER:MERGE_OPTIONS_BY_ID';

/**
 * Actions for additionallayers.
 * Additional layers will be used to perform override action on the layers without apply new proprties to the original layer object.
 * It can be used to preview changes of the layers.
 * @name actions.additionallayers
 */

/**
 * Add/updated an additional layer to the list.
 * Additional layer will be update only if id match with an existing one.
 * @memberof actions.additionallayers
 * @param {string} id  identifier
 * @param {string} owner a string that define the plugin is using following layer
 * @param {string} actionType type of action to perform in the layer selector, currently only `override` is supported
 * @param {string} options layer properties to apply based on the actionType,
 *                         eg: in case of actionType = `override` object options will be merged with the layer object with same id
 * @return {object} of type `UPDATE_ADDITIONAL_LAYER` with id, owner, actionType, settings and options
 */
export const updateAdditionalLayer = (id, owner, actionType = 'override', options) => {
    return {
        type: UPDATE_ADDITIONAL_LAYER,
        id,
        owner,
        actionType,
        options
    };
};

/**
 * Update options of additional layers selected by owner
 * @memberof actions.additionallayers
 * @param {string} owner string that define the plugin is using following layers
 * @param {array|object} options an array of options or an object with key equal to ids, eg: [ {style: 'generic'}, {style: ''} ] | { firstLayerId: {style: 'generic'}, secondLayerId: {style: ''} }
 * @return {object} of type `UPDATE_OPTIONS_BY_OWNER` with owner and options
 */
export const updateOptionsByOwner = (owner, options) => {
    return {
        type: UPDATE_OPTIONS_BY_OWNER,
        owner,
        options
    };
};
/**
 * merge options of additional layers selected by owner
 * @memberof actions.additionallayers
 * @param {string} owner string that define the plugin is using following layers
 * @param {object} options same object to be updated to all layers that matches the owner
 * @return {object} of type `MERGE_OPTIONS_BY_OWNER` with owner and options
 */
export const mergeOptionsByOwner = (owner, options) => {
    return {
        type: MERGE_OPTIONS_BY_OWNER,
        owner,
        options
    };
};

/**
 * Remove additional layers by id or owner.
 * If owner is defined all layers in the same owner group will be deleted.
 * owner key has priority.
 * @memberof actions.additionallayers
 * @param {object} identifier and object with id or owner keys, eg: { id: 'firstLayerId', ower: 'myplugin' }
 * @return {object} of type `REMOVE_ADDITIONAL_LAYER` id and owner
 */
export const removeAdditionalLayer = ({id, owner} = {}) => {
    return {
        type: REMOVE_ADDITIONAL_LAYER,
        id,
        owner
    };
};
/**
 * Remove all additional layers.
 * @memberof actions.additionallayers
 * @param {string} owner if passed all layer of this owner will be removed
 * @return {object} of type `REMOVE_ALL_ADDITIONAL_LAYERS`
 */
export const removeAllAdditionalLayers = (owner) => ({
    type: REMOVE_ALL_ADDITIONAL_LAYERS,
    owner
});

/**
 * add additional layers.
 * @memberof actions.additionallayers
 * @param {object[]} [layers=[]] to be added
 * @return {object} of type `ADD_ADDITIONAL_LAYERS`
 */
export const addAdditionalLayers = (layers = []) => ({
    type: ADD_ADDITIONAL_LAYERS,
    layers
});

/**
 * Merge options of additional layers by id
 * @memberof actions.additionallayers
 * @param {string} id string that define the plugin is using following layers
 * @param {object} options options to merge
 * @return {object} of type `MERGE_OPTIONS_BY_ID` with id and options
 */
export const mergeOptionsById = (id, options) => ({
    type: MERGE_OPTIONS_BY_ID,
    id,
    options
});
