/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const ADDING_MEDIA = "MEDIA_EDITOR:ADDING_MEDIA";
export const CHOOSE_MEDIA = "MEDIA_EDITOR:CHOOSE_MEDIA";
export const EDITING_MEDIA = "MEDIA_EDITOR:EDITING_MEDIA";
export const LOAD_MEDIA = "MEDIA_EDITOR:LOAD_MEDIA";
export const LOAD_MEDIA_SUCCESS = "MEDIA_EDITOR:LOAD_MEDIA_SUCCESS";
export const HIDE = "MEDIA_EDITOR:HIDE";
export const SAVE_MEDIA = "MEDIA_EDITOR:SAVE_MEDIA";
export const SAVE_MEDIA_SUCCESS = "MEDIA_EDITOR:SAVE_MEDIA_SUCCESS";
export const SELECT_ITEM = "MEDIA_EDITOR:SELECT_ITEM";
export const SHOW = "MEDIA_EDITOR:SHOW";

/**
 * choose media for media editor
 * @param {object} resource
 */
export const chooseMedia = (resource) => ({ type: CHOOSE_MEDIA, resource });
/**
 * hide media editor
 */
export const hide = () => ({ type: HIDE });
/**
 * load the media editor
 * @param {object} params
 * @param {string} mediaType
 * @param {number} sourceId
 */
export const loadMedia = (params, mediaType, sourceId) => ({ type: LOAD_MEDIA, params, mediaType, sourceId });
/**
 * Emitted when a media load returns data.
 * @param {string} mediaType type of the media(s). Used for mapping data loaded
 * @param {string} sourceId id of the source for the media
 * @param {object} params original search params
 * @param {object} resultData result data
 */
export const loadMediaSuccess = ({mediaType, sourceId, params, resultData}) => ({ type: LOAD_MEDIA_SUCCESS, mediaType, sourceId, params, resultData });
/**
 * Select item in the current media type/source list
 * @param {string} id the ID of the item selected
 */
export const saveMedia = ({type, source, data}) => ({ type: SAVE_MEDIA, mediaType: type, source, data });
/**
 * save media success feedback
 * @param {object} options
 * @param {object} options.mediaType
 * @param {object} options.source
 * @param {object} options.data
 * @param {object} options.id
 */
export const saveMediaSuccess = ({ mediaType, source, data, id }) => ({ type: SAVE_MEDIA_SUCCESS, mediaType, source, data, id });
/**
 * select item
 * @param {*} id
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
/**
 * adding media
 * @param {boolean} adding
 */
export const setAddingMedia = (adding) => ({ type: ADDING_MEDIA, adding });
/**
 * editing media
 * @param {boolean} editing
 */
export const setEditingMedia = (editing) => ({ type: EDITING_MEDIA, editing });
/**
 * show media editor
 * @param {*} owner
 */
export const show = (owner) => ({type: SHOW, owner});
