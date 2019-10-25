/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { ADD_BACKGROUND, SET_BACKGROUND_MODAL_PARAMS, UPDATE_BACKGROUND_THUMBNAIL, BACKGROUNDS_CLEAR, ALLOW_BACKGROUNDS_DELETION,
    REMOVE_BACKGROUND, CREATE_BACKGROUNDS_LIST, CLEAR_MODAL_PARAMETERS, CONFIRM_DELETE_BACKGROUND_MODAL} = require('../actions/backgroundselector');
const {RESET_CATALOG} = require('../actions/catalog');
const assign = require('object-assign');

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
    case SET_BACKGROUND_MODAL_PARAMS: {
        return assign({}, state, {
            modalParams: action.modalParams
        });
    }
    case BACKGROUNDS_CLEAR: {
        return assign({}, state, {
            backgrounds: [],
            removedBackgroundsThumbIds: [],
            modalParams: {},
            lastRemovedId: undefined
        });
    }
    case UPDATE_BACKGROUND_THUMBNAIL: {
        if (action.id) {
            const backgrounds = state.backgrounds || [];
            const doesNotHaveBackground = backgrounds.findIndex(background => background.id === action.id) === -1;
            const newBackgrounds = doesNotHaveBackground ? backgrounds.concat({id: action.id}) : backgrounds;
            const updatedBackgrounds = newBackgrounds.map(background => {
                if (background.id === action.id) {
                    return assign({}, background, {
                        id: action.id,
                        thumbnail: action.thumbnailData
                    });
                }
                return assign({}, background);
            });

            return assign({}, state, {
                backgrounds: updatedBackgrounds
            });
        }
        return state;
    }
    case CLEAR_MODAL_PARAMETERS : {
        return assign({}, state, {
            modalParams: undefined
        });
    }
    case REMOVE_BACKGROUND: {
        const backgrounds = state.backgrounds || [];
        const removedBackgroundsThumbIds = state.removedBackgroundsThumbIds || [];
        const updatedBackgrounds = backgrounds.filter(background => background.id !== action.backgroundId);
        const newRemovedBackgroundsThumbIds =
            backgrounds
                .filter(background => background.id === action.backgroundId && !!background.thumbId)
                .map(background => background.thumbId);

        return assign({}, state, {
            backgrounds: updatedBackgrounds,
            removedBackgroundsThumbIds: removedBackgroundsThumbIds.concat(newRemovedBackgroundsThumbIds),
            lastRemovedId: action.backgroundId
        });
    }
    case CREATE_BACKGROUNDS_LIST: {
        return assign({}, state, {backgrounds: action.backgrounds});
    }
    case CONFIRM_DELETE_BACKGROUND_MODAL: {
        return assign({}, state, {
            confirmDeleteBackgroundModal: {
                show: action.show,
                layerTitle: action.layerTitle,
                layerId: action.layerId
            }
        });
    }
    case ALLOW_BACKGROUNDS_DELETION: {
        return assign({}, state, {allowDeletion: action.allow || false});
    }
    default:
        return state;
    }
}

module.exports = backgroundselector;
