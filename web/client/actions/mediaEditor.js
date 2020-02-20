/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {isObject} from 'lodash';
export const ADDING_MEDIA = "MEDIA_EDITOR:ADDING_MEDIA";
export const CHOOSE_MEDIA = "MEDIA_EDITOR:CHOOSE_MEDIA";
export const EDITING_MEDIA = "MEDIA_EDITOR:EDITING_MEDIA";
export const EDIT_MEDIA = "GEOSTORY:EDIT_MEDIA";
export const LOAD_MEDIA = "MEDIA_EDITOR:LOAD_MEDIA";
export const LOAD_MEDIA_SUCCESS = "MEDIA_EDITOR:LOAD_MEDIA_SUCCESS";
export const HIDE = "MEDIA_EDITOR:HIDE";
export const SAVE_MEDIA = "MEDIA_EDITOR:SAVE_MEDIA";
export const SAVE_MEDIA_SUCCESS = "MEDIA_EDITOR:SAVE_MEDIA_SUCCESS";
export const SET_MEDIA_TYPE = "MEDIA_EDITOR:SET_MEDIA_TYPE";
export const SET_MEDIA_SERVICE = "MEDIA_EDITOR:SET_MEDIA_SERVICE";
export const SELECT_ITEM = "MEDIA_EDITOR:SELECT_ITEM";
export const SHOW = "MEDIA_EDITOR:SHOW";
export const UPDATE_ITEM = "MEDIA_EDITOR:UPDATE_ITEM";
export const IMPORT_IN_LOCAL = "MEDIA_EDITOR:IMPORT_IN_LOCAL";
export const REMOVE_MEDIA = "MEDIA_EDITOR:REMOVE_MEDIA";

import {SourceTypes} from '../utils/MediaEditorUtils';
// RESOURCE FORMAT :
/*
{
    type: 'image'|'video'|'map'|'iframe'|'document', // (pdf)
    source: 'id', // id of the source, just to identify it in a local context
    data: {
        //specific data for the source type
    }
}
*/

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
 * @param {object} options
 * @param {object} options.type
 * @param {object} options.source
 * @param {object} options.data
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
 * @param {string} id of the resource
 */
export const selectItem = (id) => ({ type: SELECT_ITEM, id});
/**
 * update item in media editor list
 * @param {object} param.item
 */
export const updateItem = (item, mode = 'merge') => ({ type: UPDATE_ITEM, item, mode});
/**
 * adding media
 * @param {boolean} adding
 */
export const setAddingMedia = (adding) => ({ type: ADDING_MEDIA, adding });
/**
 * set the media service
 * @param {object|string} service id or object containing id of the service
 */
export const setMediaService = (service) => ({ type: SET_MEDIA_SERVICE, id: isObject(service) ? service.value : service });
/**
 * change the media type in the media editor
 * @param {string} mediaType type of the media, can be one of "image", "video" or "map"
 */
export const setMediaType = (mediaType) => ({ type: SET_MEDIA_TYPE, mediaType });
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

/**
 * edit media reference for resource media
 * @prop {object} options
 * @prop {string} options.path path to the element
 * @prop {string} options.owner of the media editor
 */
export const editMedia = ({path, owner = "geostory"}) => ({
    type: EDIT_MEDIA,
    path,
    owner
});

/**
 * @prop {object} options
 * @prop {object} options.type the mediaType
 * @prop {string} options.owner of the media editor
 */
export const importInLocal = ({resource, sourceType = SourceTypes.GEOSTORY, owner = "geostory"}) => ({
    type: IMPORT_IN_LOCAL,
    resource,
    sourceType,
    owner
});

export const removeMedia = (mediaType, owner = "geostory") => ({type: REMOVE_MEDIA, mediaType, owner});
