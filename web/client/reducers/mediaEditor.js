/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'lodash';

import {
    ADDING_MEDIA,
    CHOOSE_MEDIA,
    EDITING_MEDIA,
    HIDE,
    LOAD_MEDIA_SUCCESS,
    SELECT_ITEM,
    SET_MEDIA_SERVICE,
    SET_MEDIA_TYPE,
    SHOW
} from '../actions/mediaEditor';
import { compose, set } from '../utils/ImmutableUtils';

export const DEFAULT_STATE = {
    open: false,
    // contains local data (path for data is mediaType, sourceId, e.g. data: {image : { geostory: { resultData: {...}, params: {...}}})
    data: {},
    settings: {
        mediaType: "image", // current selected media type
        sourceId: "geostory", // current selected service
        // available media types
        mediaTypes: {
            image: {
                defaultSource: "geostory", // source selected when this media is selected
                sources: ["geostory"] // services for the selected media type
            },
            video: {
                defaultSource: "geostory",
                sources: ["geostory"]
            },
            map: {
                defaultSource: "geostory",
                sources: ["geostory"]
            }
        },
        // all media sources available, with their type and other parameters
        sources: {
            geostory: {
                name: "Current story", // shown in in the UI,  TODO: localize?
                type: "geostory" // determines the type related to the API
            },
            geostoreMap: {
                name: "Geostore Dev",
                type: "geostore",
                url: "https://dev.mapstore.geo-solutions.it/mapstore/rest/geostore/",
                category: "MAP"
            },
            geostoreImage: {
                name: "Geostore QA",
                type: "geostore",
                url: "https://dev.mapstore.geo-solutions.it/mapstore/rest/geostore/",
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
                set('selected', ""),
                set('saveState.addingMedia', false),
                set('saveState.editing', false),
                set('settings', state.stashedSettings || state.settings), // restore defaults
                set('stashedSettings', undefined)
            )(state);
        // set adding media state (to toggle add/select in media selectors)
        case LOAD_MEDIA_SUCCESS: {
            const {resultData, params, mediaType, sourceId} = action;
            return set(`data["${mediaType}"]["${sourceId}"]`, { params, resultData }, state);
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
