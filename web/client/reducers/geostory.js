/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { set } from '../utils/ImmutableUtils';

import {
    CHANGE_MODE,
    SET_CURRENT_STORY
} from '../actions/geostory';

let INITIAL_STATE = {
    mode: 'view',
    currentStory: {

    }
};
/*
// TEST STUFF: uncomment to use test data. TODO: delete when build system is active
const createSampleSection = () => [{
    type: 'title',
    id: '000',
    title: 'Abstract',
    contents: [
        {
            id: "SomeID",
            type: 'text',
            background: {
                // ...
            },
            // For immersive there will be also a background entry
            html: `<p>This is a list of the<strong> </strong><strong><ins>highest astronomical observatories</ins></strong><strong> </strong>in the world,
                    considering only ground-based observatories and ordered by elevation above mean sea level. The main list includes only permanent observatories
                    with facilities constructed at a fixed location, followed by a supplementary list for temporary observatories such as transportable telescopes
                    or instrument packages. For large observatories with numerous telescopes at a single location, only a single entry is included listing the
                    main elevation of the observatory or of the highest operational instrument if that information is available.</p>`
        }
    ]
}, {
    type: 'paragraph',
    id: '001',
    title: 'Abstract',
    contents: [
        {
            id: "SomeID",
            type: 'text',
            background: {
                // ...
            },
            // For immersive there will be also a background entry
            html: `<p>This is a list of the<strong> </strong><strong><ins>highest astronomical observatories</ins></strong><strong> </strong>in the world,
                    considering only ground-based observatories and ordered by elevation above mean sea level. The main list includes only permanent observatories
                    with facilities constructed at a fixed location, followed by a supplementary list for temporary observatories such as transportable telescopes
                    or instrument packages. For large observatories with numerous telescopes at a single location, only a single entry is included listing the
                    main elevation of the observatory or of the highest operational instrument if that information is available.</p>`
        }
    ]
}, {
    type: 'immersive',
    id: '002',
    title: 'Immersive',
    contents: [
        {
            id: "SomeID",
            type: 'text',
            background: {
                // ...
            },
            // For immersive there will be also a background entry
            html: `<p>This is a list of the<strong> </strong><strong><ins>highest astronomical observatories</ins></strong><strong> </strong>in the world,
                    considering only ground-based observatories and ordered by elevation above mean sea level. The main list includes only permanent observatories
                    with facilities constructed at a fixed location, followed by a supplementary list for temporary observatories such as transportable telescopes
                    or instrument packages. For large observatories with numerous telescopes at a single location, only a single entry is included listing the
                    main elevation of the observatory or of the highest operational instrument if that information is available.</p>`
        }
    ]
}];

INITIAL_STATE = {
    currentStory: {
        type: 'cascade',
        // Array().keys() DON'T WORK IN IE 11 ( Array.from(Array(10).keys()) )
        // Use Object.keys([ ...new Array(10) ]) instead
        sections: createSampleSection()
    }
};
*/

/**
 * Reducer that manage state for geostory plugins. Example:
 * @memberof reducers
 * @function
 * @name geostory
 * @param state the application state
 * @param {string} state.mode the mode ('view' or 'edit')
 * @param {object} state.currentStory the current story.
 *
 * @example
 * {
 *     "mode": "edit", // 'edit' or 'view',
 *     "currentStory": {
 *     // sections
 *     "sections": [
 *       {
 *         "type": "paragraph", // each session has a type
 *         "id": "SomeID",
 *         "title": "Abstract",
 *         // depending on the type, session can have one or more contents
 *         "contents": [
 *           {
 *             "id": "SomeID",
 *             "type": "text", // each content must have a type
 *             "background": {}, // and each content can have a background
 *             "html": "<p>this is some html content</p>"
 *           }
 *         ]
 *       },
 *       {
 *         "type": "immersive",
 *         "id": "SomeID2",
 *         "title": "Abstract",
 *         "contents": [
 *           {
 *             "id": "col1",
 *             "type": "column",
 *             "background": {},
 *             "contents": [{"type": "text"}, {"type": "media" }]
 *             ]
 *           },
 *           {
 *             "id": "col2",
 *             "type": "column",
 *             "background": {},
 *             "contents": [{"type": "text"}, {"type": "media" }]
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * }
 *
 */
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case CHANGE_MODE: {
            return set('mode', action.mode, state);
        }
        case SET_CURRENT_STORY: {
            return set('currentStory', action.story, state);
        }
        default:
            return state;
    }
};
