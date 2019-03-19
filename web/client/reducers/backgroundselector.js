/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { ADD_BACKGROUND, ADD_BACKGROUND_PROPERTIES, UPDATE_BACKGROUND_THUMBNAIL, UPDATE_BACKGROUND_LAYER_PARAMETER,
    BACKGROUNDS_CLEAR, REMOVE_BACKGROUND_THUMBNAIL, CREATE_BACKGROUNDS_LIST, EDIT_BACKGROUND_PROPERTIES, CLEAR_MODAL_PARAMETERS} = require('../actions/backgroundselector');
const {RESET_CATALOG} = require('../actions/catalog');
const assign = require('object-assign');
const {filter} = require('lodash');

function backgroundselector(state = null, action) {
    switch (action.type) {
    case ADD_BACKGROUND: {
        return assign({}, state, {
            source: action.source
        });
    }
    case RESET_CATALOG: {
        return assign({}, state, {
            source: 'metadataExplorer'
        });
    }
    case ADD_BACKGROUND_PROPERTIES: {
        // replace the background properties if it already exist
        let backgrounds = filter(state.backgrounds || [], ((o) => action.modalParams && o.id !== action.modalParams.id)) || [];

        const newBackgrounds = backgrounds.concat(action.modalParams);
        return assign({}, state, {
            backgrounds: action.modalParams ? newBackgrounds : backgrounds,
            modalParams: action.modalParams,
            unsavedChanges: action.unsavedChanges
        });
    }
    case EDIT_BACKGROUND_PROPERTIES: {

        return assign({}, state, {
            editing: action.editing
        });
    }
    case BACKGROUNDS_CLEAR: {
        return assign({}, state, {
            backgrounds: [],
            modalParams: {},
            unsavedChanges: false,
            source: undefined,
            lastRemovedId: undefined
        });
    }
    case UPDATE_BACKGROUND_THUMBNAIL: {
        const backgrounds = state.backgrounds || [];
        const updatedBackgrounds = backgrounds.map( background => {
            if (background.id === action.id) {
                return assign({}, background, {
                    CurrentNewThumbnail: action.thumbnail || state.modalParams && state.modalParams.CurrentNewThumbnail,
                    CurrentThumbnailData: action.thumbnailData || state.modalParams && state.modalParams.CurrentThumbnailData
                });

            }
            return assign({}, background);
        });

        return assign({}, state, {
            backgrounds: updatedBackgrounds,
            modalParams: assign({}, state.modalParams, {
                CurrentNewThumbnail: action.thumbnail || state.modalParams && state.modalParams.CurrentNewThumbnail,
                CurrentThumbnailData: action.thumbnailData || state.modalParams && state.modalParams.CurrentThumbnailData }),
                unsavedChanges: action.unsavedChanges !== undefined ? action.unsavedChanges : true,
                lastRemovedId: undefined
            });
    }
    case CLEAR_MODAL_PARAMETERS : {
        return assign({}, state, {
            modalParams: undefined
        });
    }
    case REMOVE_BACKGROUND_THUMBNAIL: {
        const backgrounds = state.backgrounds || [];
        const updatedBackgrounds = backgrounds.filter(background => background.id !== action.backgroundId);

        return assign({}, state, {
            backgrounds: updatedBackgrounds,
            modalParams: action.backgroundId !== undefined ? assign({}, state.modalParams, {
                CurrentNewThumbnail: undefined,
                CurrentThumbnailData: undefined}) : state.modalParams,
                lastRemovedId: action.backgroundId
            });

    }
    case CREATE_BACKGROUNDS_LIST: {
        const backgrounds = action.backgrounds;
        let idList = [];
        backgrounds.filter((background) => background.thumbId !== undefined).map(l => idList.push(l.thumbId));
        return assign({}, state,
            { backgroundSourcesId: idList});
    }
    case UPDATE_BACKGROUND_LAYER_PARAMETER: {
        return assign({}, state,
            {additionalParameters: action.params});
    }
    default:
        return state;
    }
}

module.exports = backgroundselector;
