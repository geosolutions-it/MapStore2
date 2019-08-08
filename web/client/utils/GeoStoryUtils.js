/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { values } from "lodash";
import uuid from 'uuid';
import Content from "../components/geostory/contents/Content";


// Allowed StoryTypes
export const StoryTypes = {
    CASCADE: 'cascade'
};
// Allowed types
export const SectionTypes = {
    TITLE: 'title',
    PARAGRAPH: 'paragraph',
    IMMERSIVE: 'immersive'
};
// Allowed contents
export const ContentTypes = {
    TEXT: 'text',
    MEDIA: 'media',
    COLUMN: 'column' // can have contents of type 'text' or 'media'
};
export const MediaTypes = {
    IMAGE: 'image',
    VIDEO: 'video'
};
export const Modes = {
    EDIT: 'edit',
    VIEW: 'view'
};
export const lists = {
    StoryTypes: values(StoryTypes),
    SectionTypes: values(SectionTypes),
    MediaTypes: values(MediaTypes),
    Modes: values(Modes)
};


const SAMPLE_HTML = "insert text here...";

export const getDefaultSectionTemplate = (type) => {
    switch (type) {
        case SectionTypes.TITLE:
            return {
                type: SectionTypes.TITLE,
                title: 'Title Section',
                cover: false,
                contents: [
                    {
                        id: uuid(),
                        type: ContentTypes.TEXT,
                        theme: 'bright',
                        html: `<h1 style="text-align:center;">Insert Title</h1><p style="text-align:center;"><em>sub title</em></p>`
                    }
                ]
            };
        case SectionTypes.PARAGRAPH:
            return {
                type: SectionTypes.PARAGRAPH,
                title: 'Paragraph Section',
                contents: [
                    {
                        id: uuid(),
                        type: ContentTypes.TEXT,
                        html: SAMPLE_HTML
                    }
                ]
            };
        case SectionTypes.IMMERSIVE:
            return {
                type: SectionTypes.IMMERSIVE,
                title: "Immersive Section",
                contents: [
                    {
                        id: uuid(),
                        type: ContentTypes.TEXT,
                        background: {
                            type: "image",
                            fit: 'cover'

                        },
                        html: SAMPLE_HTML,
                        align: 'left',
                        size: 'small'
                    }]
            };
        case ContentTypes.COLUMN: {
            return {
                type: ContentTypes.COLUMN,
                contents: [{
                    type: ContentTypes.TEXT,
                    html: SAMPLE_HTML
                }]
            };
        }
        default:
            return {
                type,
                title: "UNKNOWN"
            };
    }
};
