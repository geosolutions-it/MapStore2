
/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const UPDATE_ADDITIONAL_LAYER = 'ADDITIONALLAYER:UPDATE_ADDITIONAL_LAYER';
const UPDATE_OPTIONS_BY_OWNER = 'ADDITIONALLAYER:UPDATE_OPTIONS_BY_OWNER';
const REMOVE_ADDITIONAL_LAYER = 'ADDITIONALLAYER:REMOVE_ADDITIONAL_LAYER';
const REMOVE_ALL_ADDITIONAL_LAYERS = 'ADDITIONALLAYER:REMOVE_ALL_ADDITIONAL_LAYERS';

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
const updateAdditionalLayer = (id, owner, actionType = 'override', options) => {
    return {
        type: UPDATE_ADDITIONAL_LAYER,
        id,
        owner,
        actionType,
        options
    };
};

/**
 * Update options of addibinal layers selected by owner
 * @memberof actions.additionallayers
 * @param {string} owner string that define the plugin is using following layers
 * @param {array|object} options an array of options or an object with key equal to ids, eg: [ {style: 'generic'}, {style: ''} ] | { firstLayerId: {style: 'generic'}, secondLayerId: {style: ''} }
 * @return {object} of type `UPDATE_OPTIONS_BY_OWNER` with owner and options
 */
const updateOptionsByOwner = (owner, options) => {
    return {
        type: UPDATE_OPTIONS_BY_OWNER,
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
const removeAdditionalLayer = ({id, owner} = {}) => {
    return {
        type: REMOVE_ADDITIONAL_LAYER,
        id,
        owner
    };
};
/**
 * Remove all additional layers.
 * @memberof actions.additionallayers
 * @return {object} of type `REMOVE_ALL_ADDITIONAL_LAYERS`
 */
const removeAllAdditionalLayers = () => ({
    type: REMOVE_ALL_ADDITIONAL_LAYERS
});

/**
 * Actions for additionallayers.
 * Additional layers will be used to perform override action on the layers without apply new proprties to the original layer object.
 * It can be used to preview changes of the layers.
 * @name actions.additionallayers
 */

module.exports = {
    UPDATE_ADDITIONAL_LAYER, updateAdditionalLayer,
    REMOVE_ADDITIONAL_LAYER, removeAdditionalLayer,
    REMOVE_ALL_ADDITIONAL_LAYERS, removeAllAdditionalLayers,
    UPDATE_OPTIONS_BY_OWNER, updateOptionsByOwner
};
