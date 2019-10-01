/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get, findIndex, find, merge } from 'lodash';
import { SourceTypes, MediaTypes } from '../utils/GeoStoryUtils';

import {
    ADDING_MEDIA,
    CHOOSE_MEDIA,
    EDITING_MEDIA,
    HIDE,
    LOAD_MEDIA_SUCCESS,
    SELECT_ITEM,
    UPDATE_ITEM,
    SET_MEDIA_SERVICE,
    SET_MEDIA_TYPE,
    SHOW
} from '../actions/mediaEditor';
import { compose, set } from '../utils/ImmutableUtils';
import {
    sourceIdSelector,
    currentMediaTypeSelector,
    resultDataSelector
} from './../selectors/mediaEditor';

const GEOSTORY_SOURCE_ID = "geostory";
export const DEFAULT_STATE = {
    open: false,
    // contains local data (path for data is mediaType, sourceId, e.g. data: {image : { geostory: { resultData: {...}, params: {...}}})
    data: {},
    settings: {
        mediaType: MediaTypes.IMAGE, // current selected media type
        sourceId: GEOSTORY_SOURCE_ID, // current selected service
        // available media types
        mediaTypes: {
            image: {
                defaultSource: GEOSTORY_SOURCE_ID, // source selected when this media is selected
                sources: [GEOSTORY_SOURCE_ID, "geostoreImage"] // services for the selected media type
            },
            video: {
                defaultSource: GEOSTORY_SOURCE_ID,
                sources: [GEOSTORY_SOURCE_ID]
            },
            map: {
                defaultSource: GEOSTORY_SOURCE_ID,
                sources: [GEOSTORY_SOURCE_ID, "geostoreMap", "geostoreImage"]
            }
        },
        // all media sources available, with their type and other parameters
        sources: {
            geostory: {
                name: "Current story", // shown in in the UI,  TODO: localize?
                type: SourceTypes.GEOSTORY // determines the type related to the API
            },
            geostoreMap: {
                name: "Geostore Dev",
                type: SourceTypes.GEOSTORE,
                baseURL: "/rest/geostore/",
                category: "MAP"
            },
            geostoreImage: {
                name: "Geostore Images",
                type: SourceTypes.GEOSTORE,
                baseURL: "/mapstore/rest/geostore/",
                category: "IMAGE"
            }
        }
    }
};

export default (state = DEFAULT_STATE, action) => {
    switch (action.type) {
        case ADDING_MEDIA: {
            return compose(
                set('saveState.addingMedia', action.adding),
                set('selected', "")
                )(state);
        }
        case EDITING_MEDIA: {
            return compose(
                set('saveState.addingMedia', action.editing),
                set('saveState.editing', action.editing)
            )(state);
        }
        case HIDE:
            // hide resets the media editor as well as selected
        case CHOOSE_MEDIA:
            // resets all media editor settings
            return compose(
                set('open', false),
                set('owner', undefined),
                set('saveState.addingMedia', false),
                set('saveState.editing', false),
                set('settings', state.stashedSettings || state.settings), // restore defaults, TODO SOURCE ID IS NOT RESTORED
                set('stashedSettings', undefined)
            )(state);
        // set adding media state (to toggle add/select in media selectors)
        case LOAD_MEDIA_SUCCESS: {
            const {resultData, params, mediaType, sourceId} = action;
            return set(`data["${mediaType}"]["${sourceId}"]`, { params, resultData }, state);
        }
        case UPDATE_ITEM: {
            const {item} = action;
            const sourceId = sourceIdSelector({mediaEditor: state});
            const mediaType = currentMediaTypeSelector({mediaEditor: state});
            const resources = resultDataSelector({mediaEditor: state}).resources;
            const indexItem = findIndex(resources, {id: item.id});
            const resource = find(resources, {id: item.id});
            const newResource = merge({}, merge({}, resource), merge({}, item));
            return set(`data["${mediaType}"]["${sourceId}"].resultData.resources[${indexItem}]`, newResource, state);
        }
        case SELECT_ITEM: {
            return set('selected', action.id, state);
        }
        case SET_MEDIA_TYPE: {
            const defaultSource = get(state, `settings.mediaTypes[${action.mediaType}].defaultSource`, "geostory");
            return compose(
                set('settings.sourceId', defaultSource), // reset sourceId to default when media type changes
                set('settings.mediaType', action.mediaType)
                )(state);
        }
        case SET_MEDIA_SERVICE: {
            return set('settings.sourceId', action.id, state);
        }
        case SHOW:
            // setup media editor settings
            return compose(
                set('open', true),
                set('owner', action.owner),
                // set('settings', action.settings || state.settings), // TODO: allow fine customization
                // set('stashedSettings', state.settings) // This should allow to use default config or customize for a different usage
            )(state);
        default:
            return state;
    }
};
