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

// TEST STUFF: uncomment to use test data. TODO: delete when build system is active
const SAMPLE_TEXT = "<p>This is a list of the<strong> </strong><strong><ins>highest astronomical observatories</ins></strong><strong> </strong>in the world, considering only ground-based observatories and ordered by elevation above mean sea level. The main list includes only permanent observatories with facilities constructed at a fixed location, followed by a supplementary list for temporary observatories such as transportable telescopes or instrument packages. For large observatories with numerous telescopes at a single location, only a single entry is included listing the main elevation of the observatory or of the highest operational instrument if that information is available.</p>";
const createSampleSection = () => [{
    type: 'title',
    id: '000',
    title: 'Abstract',
    contents: [
        {
            id: "SomeID",
            type: 'text',
            background: {
                type: "image",
                src: 'https://images.unsplash.com/photo-1480843669328-3f7e37d196ae?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80'
            },
            html: `<h1>Title</h1>`
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
            html: SAMPLE_TEXT
        },
        {
            id: "SomeID2",
            type: 'image',
            src: 'https://images.unsplash.com/photo-1558999539-7a19738f085d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80',
            enableFullscreen: true
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
                type: "image",
                fit: 'cover',
                src: 'https://images.unsplash.com/photo-1562874724-b33411b38141?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=701&q=80'

            },
            html: SAMPLE_TEXT
        }, {
            id: "SomeID2",
            type: 'text',
            background: {
                type: "image",
                src: 'http://lh5.googleusercontent.com/-6mQ_Rgsis24/Ux3nf2hIQ9I/AAAAAAAABac/1WttfAi5TzA/s1920/sfondo-wallpaper-spazio-universo-0003.jpg'
            },
            html: SAMPLE_TEXT
        }, {
            id: "SomeID3",
            type: 'text',
            background: {
                type: "image",
                src: 'https://images.unsplash.com/photo-1462331321792-cc44368b8894?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1422&q=80'
            },
            html: SAMPLE_TEXT
        }, {
            id: "SomeID4",
            type: 'text',
            background: {
                type: "image",
                fit: 'contain',
                src: 'https://images.unsplash.com/photo-1563818500545-86cdb0a38abd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=564&q=80'
            },
            html: SAMPLE_TEXT
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
