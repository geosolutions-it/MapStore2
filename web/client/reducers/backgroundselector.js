/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    ADD_BACKGROUND,
    SET_BACKGROUND_MODAL_PARAMS,
    UPDATE_BACKGROUND_THUMBNAIL,
    BACKGROUNDS_CLEAR,
    ALLOW_BACKGROUNDS_DELETION,
    REMOVE_BACKGROUND,
    CREATE_BACKGROUNDS_LIST,
    CLEAR_MODAL_PARAMETERS,
    CONFIRM_DELETE_BACKGROUND_MODAL,
    STASH_SELECTED_SERVICE
} from '../actions/backgroundselector';

import { RESET_CATALOG } from '../actions/catalog';

function backgroundselector(state = null, action) {
    switch (action.type) {
    case ADD_BACKGROUND: {
        return Object.assign({}, state, {
            source: action.source
        });
    }
    case RESET_CATALOG: {
        return Object.assign({}, state, {
            source: 'metadataExplorer'
        });
    }
    case SET_BACKGROUND_MODAL_PARAMS: {
        return Object.assign({}, state, {
            modalParams: action.modalParams
        });
    }
    case BACKGROUNDS_CLEAR: {
        return Object.assign({}, state, {
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
                    return Object.assign({}, background, {
                        id: action.id,
                        thumbnail: action.thumbnailData
                    });
                }
                return Object.assign({}, background);
            });

            return Object.assign({}, state, {
                backgrounds: updatedBackgrounds
            });
        }
        return state;
    }
    case CLEAR_MODAL_PARAMETERS : {
        return Object.assign({}, state, {
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

        return Object.assign({}, state, {
            backgrounds: updatedBackgrounds,
            removedBackgroundsThumbIds: removedBackgroundsThumbIds.concat(newRemovedBackgroundsThumbIds),
            lastRemovedId: action.backgroundId
        });
    }
    case CREATE_BACKGROUNDS_LIST: {
        return Object.assign({}, state, {backgrounds: action.backgrounds});
    }
    case CONFIRM_DELETE_BACKGROUND_MODAL: {
        return Object.assign({}, state, {
            confirmDeleteBackgroundModal: {
                show: action.show,
                layerTitle: action.layerTitle,
                layerId: action.layerId
            }
        });
    }
    case ALLOW_BACKGROUNDS_DELETION: {
        return Object.assign({}, state, {allowDeletion: action.allow || false});
    }
    case STASH_SELECTED_SERVICE : {
        return Object.assign({}, state, {
            stashedService: action.service
        });
    }


    default:
        return state;
    }
}

export default backgroundselector;
