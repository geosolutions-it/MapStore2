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


import { values, isArray, isString } from "lodash";
import uuid from 'uuid';
import { getMessageById } from './LocaleUtils';

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

export const Controls = {
    SHOW_SAVE: 'save.show',
    LOADING: 'loading'
};

export const lists = {
    StoryTypes: values(StoryTypes),
    SectionTypes: values(SectionTypes),
    MediaTypes: values(MediaTypes),
    Modes: values(Modes)
};


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
 * @param {string} id id of the dom element
 * @param {object|boolean} scrollOptions options used to the scroll action
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
 */
export const scrollToContent = (id, scrollOptions) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView(scrollOptions);
    }
};

/**
 * generates a localized object for string that matches a particular path in locales messages
 * @param {*} obj the object to scan for localize strings
 * @param {*} messages the messages localized
 */
export const localizeElement = (obj, messages) => {
    const keys = Object.keys(obj);
    return keys.reduce((p, c) => {
        if (isString(obj[c]) && obj[c].indexOf("geostory.builder") !== -1) {
            return {
                ...p,
                [c]: getMessageById(messages, obj[c])
            };
        }
        if (isArray(obj[c])) {
            // const el = localizeElement(obj[c][0], messages);
            const elements = obj[c].map(el => ({...el, ...localizeElement(el, messages)}));
            return {
                ...p,
                [c]: [
                    // ...obj[c][0],
                    ...elements
                ]};
        }
        return p;
    }, {});
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
                title: 'geostory.builder.defaults.titleTitle',
                cover: false,
                contents: [
                    {
                        id: uuid(),
                        type: ContentTypes.TEXT,
                        html: 'geostory.builder.defaults.htmlTitle',
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
                title: 'geostory.builder.defaults.titleParagraph',
                contents: [
                    {
                        id: uuid(),
                        type: ContentTypes.COLUMN,
                        size: 'full',
                        align: 'center',
                        contents: [{
                            id: uuid(),
                            type: ContentTypes.TEXT,
                            html: "geostory.builder.defaults.htmlSample"
                        }]
                    }
                ]
            };
        case SectionTypes.IMMERSIVE:
            return {
                id: uuid(),
                type: SectionTypes.IMMERSIVE,
                title: "geostory.builder.defaults.titleImmersive",
                contents: [getDefaultSectionTemplate(ContentTypes.COLUMN)]
            };
        case SectionTemplates.MEDIA: {
            return {
                id: uuid(),
                type: SectionTypes.PARAGRAPH,
                title: 'geostory.builder.defaults.titleMedia',
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
                    html: "geostory.builder.defaults.htmlSample"
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
                html: "geostory.builder.defaults.htmlSample"
            };
        }
        default:
            return {
                id: uuid(),
                type,
                title: "geostory.builder.defaults.titleUnknown"
            };
    }
};
