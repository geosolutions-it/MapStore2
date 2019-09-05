/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Utils for geostory
 */


import { values, isArray } from "lodash";
import uuid from 'uuid';


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
/**
 * Allowed contents
 */
export const ContentTypes = {
    TEXT: 'text',
    MEDIA: 'media',
    COLUMN: 'column' // can have contents of type 'text' or 'media'
};

// Templates for contents that can be created using getDefaultSectionTemplate
export const SectionTemplates = {
    MEDIA: 'template-media'
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

export const SAMPLE_HTML = "<p>insert text here...</p>";

/**
 * Return a class name from props of a content
 * @prop {string} theme one of 'bright', 'dark', 'dark-transparent' or 'bright-transparent'
 * @prop {string} align one of 'center', 'left' or 'right'
 * @prop {string} size one of 'full', 'large', 'medium' or 'small'
 */
export const getClassNameFromProps = ({ theme = 'bright', align = 'center', size = 'full' }) => {
    const themeClassName = ` ms-${theme}`;
    const alignClassName = ` ms-align-${align}`;
    const sizeClassName = ` ms-size-${size}`;
    return `${themeClassName}${alignClassName}${sizeClassName}`;
};

/**
 * tells if an element is a paragraph and it contains a media
 * @param {object} element
 * @return {boolean}
 */
export const isMediaSection = (element) => element.type === SectionTypes.PARAGRAPH &&
    element &&
    isArray(element.contents) &&
    element.contents.length &&
    isArray(element.contents[0].contents) &&
    element.contents[0].contents.length &&
    element.contents[0].contents[0].type === ContentTypes.MEDIA;

/**
 * utility function that scrolls the view to the element
 * if it finds an element and autoscroll is enabled
 * @param {string} id id of the dom element
 * @param {object} autoscrollOptions options used to the scroll action
 */
export const autoScrollToNewElement = ({id, autoScrollOptions = {behavior: "auto", block: "nearest", inline: "start"}} = {}) => {
    const element = document.getElementById(id);
    if (element) {
        // trying behaviour smooth it does not scroll
        element.scrollIntoView(autoScrollOptions);
    }
};

/**
 * Creates a default template for the given type
 * @param {string} type can be section type, a content type or a template (custom. i.e. paragraph with initial image for add media)
 * @return {object} the template object of the content/section
 */
export const getDefaultSectionTemplate = (type) => {
    switch (type) {
        case SectionTypes.TITLE:
            return {
                id: uuid(),
                type: SectionTypes.TITLE,
                title: 'Title Section', // TODO I18N
                cover: false,
                contents: [
                    {
                        id: uuid(),
                        type: ContentTypes.TEXT,
                        html: `<h1 style="text-align:center;">Insert Title</h1><p style="text-align:center;"><em>sub title</em></p>`, // TODO I18N
                        size: 'large',
                        align: 'center',
                        theme: 'bright',
                        background: {
                            fit: 'cover',
                            theme: 'bright',
                            size: 'full',
                            align: 'center'
                        }
                    }
                ]
            };
        case SectionTypes.PARAGRAPH:
            return {
                id: uuid(),
                type: SectionTypes.PARAGRAPH,
                title: 'Paragraph Section', // TODO I18N
                contents: [
                    {
                        id: uuid(),
                        type: ContentTypes.COLUMN,
                        size: 'full',
                        align: 'center',
                        contents: [{
                            id: uuid(),
                            type: ContentTypes.TEXT,
                            html: SAMPLE_HTML
                        }]
                    }
                ]
            };
        case SectionTypes.IMMERSIVE:
            return {
                id: uuid(),
                type: SectionTypes.IMMERSIVE,
                title: "Immersive Section", // TODO I18N
                contents: [getDefaultSectionTemplate(ContentTypes.COLUMN)]
            };
        case SectionTemplates.MEDIA: {
            return {
                id: uuid(),
                type: SectionTypes.PARAGRAPH,
                title: 'Media Section', // TODO I18N
                contents: [
                    {
                        id: uuid(),
                        type: ContentTypes.COLUMN,
                        contents: [{
                            id: uuid(),
                            type: ContentTypes.MEDIA,
                            size: 'medium',
                            align: 'center'
                        }]
                    }
                ]
            };
        }
        case ContentTypes.COLUMN: {
            return {
                id: uuid(),
                type: ContentTypes.COLUMN,
                align: 'left',
                size: 'small',
                theme: 'bright',
                contents: [{
                    id: uuid(),
                    type: ContentTypes.TEXT,
                    html: SAMPLE_HTML
                }],
                background: {
                    fit: 'cover',
                    size: 'full',
                    align: 'center',
                    theme: 'bright'
                }
            };
        }
        case ContentTypes.TEXT: {
            return {
                id: uuid(),
                type: ContentTypes.TEXT,
                html: SAMPLE_HTML
            };
        }
        default:
            return {
                id: uuid(),
                type,
                title: "UNKNOWN" // TODO I18N
            };
    }
};
