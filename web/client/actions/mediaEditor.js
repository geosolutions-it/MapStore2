/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SHOW = "MEDIA_EDITOR:SHOW";
export const show = (owner) => ({type: SHOW, owner});

export const HIDE = "MEIDA_EDITOR:HIDE";
export const hide = () => ({ type: HIDE });

export const SELECTED = "MEIDA_EDITOR:SELECTED";
export const selected = (resource) => ({ type: SELECTED, resource });

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
