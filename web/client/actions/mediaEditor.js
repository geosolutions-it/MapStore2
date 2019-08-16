/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SHOW = "MEDIA_EDITOR:SHOW";
export const show = (owner) => ({type: SHOW, owner});

export const HIDE = "MEDIA_EDITOR:HIDE";
export const hide = () => ({ type: HIDE });

export const CHOOSE_MEDIA = "MEDIA_EDITOR:CHOOSE_MEDIA";
export const chooseMedia = (resource) => ({ type: CHOOSE_MEDIA, resource });

export const ADDING_MEDIA = "MEDIA_EDITOR:ADDING_MEDIA";
export const setAddingMedia = (adding) => ({ type: ADDING_MEDIA, adding });

export const SAVE_MEDIA = "MEDIA_EDITOR:SAVE_MEDIA";
export const saveMedia = ({type, source, data}) => ({ type: SAVE_MEDIA, mediaType: type, source, data });

export const SAVE_MEDIA_SUCCESS = "MEDIA_EDITOR:SAVE_MEDIA_SUCCESS";
export const saveMediaSuccess = ({ mediaType, source, data, id }) => ({ type: SAVE_MEDIA_SUCCESS, mediaType, source, data, id });


export const LOAD_MEDIA = "MEDIA_EDITOR:LOAD_MEDIA";
/**
 * Triggers data load event
 * @oarams
 */
export const loadMedia = (params, mediaType, sourceId) => ({ type: LOAD_MEDIA, params, mediaType, sourceId });


export const LOAD_MEDIA_SUCCESS = "MEDIA_EDITOR:LOAD_MEDIA_SUCCESS";

/**
 * Emitted when a media load returns data.
 * @param {string} mediaType type of the media(s). Used for mapping data loaded
 * @param {string} sourceId id of the source for the media
 * @param {object} params original search params
 * @param {object} resultData result data
 */
export const loadMediaSuccess = (mediaType, sourceId, params, resultData) => ({ type: LOAD_MEDIA_SUCCESS, mediaType, sourceId, params, resultData });


export const SELECT_ITEM = "MEDIA_EDITOR:SELECT_ITEM";
/**
 * Select item in the current media type/source list
 * @param {sting} id the ID of the item selected
 */
export const selectItem = (id) => ({ type: SELECT_ITEM, id});
// RESOURCE FORMAT DRAFT :
/*
{
    type: 'image'|'video'|'map'|'iframe'|'document' // (pdf)
    source: 'id' // id of the source, just to identify it in a local context
    data: {
        //specific data for the source type
    }
}
*/
