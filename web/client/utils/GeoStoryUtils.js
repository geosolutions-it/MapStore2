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

import get from "lodash/get";
import findIndex from "lodash/findIndex";
import toPath from "lodash/toPath";
import isArray from "lodash/isArray";
import values from "lodash/values";
import filter from "lodash/filter";
import merge from "lodash/merge";
import isString from "lodash/isString";
import isObject from "lodash/isObject";
import includes from "lodash/includes";
import replace from 'lodash/replace';
import uuid from 'uuid';

export const EMPTY_CONTENT = "EMPTY_CONTENT";
// Allowed StoryTypes
export const StoryTypes = {
    CASCADE: 'cascade'
};
// Allowed types
export const SectionTypes = {
    TITLE: 'title',
    PARAGRAPH: 'paragraph',
    IMMERSIVE: 'immersive',
    BANNER: 'banner'
};
/**
 * Allowed contents
 */
export const ContentTypes = {
    TEXT: 'text',
    MEDIA: 'media',
    WEBPAGE: 'webPage',
    COLUMN: 'column' // can have contents of type 'text' or 'media'
};

// Templates for contents that can be created using getDefaultSectionTemplate
export const SectionTemplates = {
    MEDIA: 'template-media',
    WEBPAGE: 'template-web-page'
};

export const MediaTypes = {
    IMAGE: 'image',
    MAP: 'map',
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
 * @prop {object} theme theme object
 * @prop {string} theme.value one of 'bright', 'dark', 'dark-transparent' or 'bright-transparent'
 * @prop {string} align one of 'center', 'left' or 'right'
 * @prop {string} size one of 'full', 'large', 'medium' or 'small'
 */
export const getClassNameFromProps = ({ theme = {}, align = 'center', size = 'full' }) => {
    const themeValue = theme?.value || isString(theme) && theme;
    const themeClassName = themeValue && themeValue !== 'custom' && isString(themeValue) && ` ms-${themeValue}` || '';
    const alignClassName = ` ms-align-${align}`;
    const sizeClassName = ` ms-size-${size}`;
    return `${themeClassName}${alignClassName}${sizeClassName}`;
};

/**
 * Return a theme style props of a content and background
 * @prop {object} theme one of 'bright', 'dark', 'dark-transparent' or 'bright-transparent'
 * @prop {string} theme.value style key
 * @prop {string} theme[theme.value] a style object referred to the style key
 */
export const getThemeStyleFromProps = ({ theme = {}, storyTheme }) => {
    if (
        theme === ''
        || theme?.value === ''
    ) {
        return isObject(storyTheme) ? storyTheme : {};
    }
    const styleKey = theme?.value;
    const style = theme?.[styleKey];
    return isObject(style) && style || {};
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


export const DEFAULT_MAP_OPTIONS = {
    zoomControl: true,
    mapInfoControl: false,
    mapOptions: {
        // leaflet
        scrollWheelZoom: false,
        interactions: {
            // openlayers
            mouseWheelZoom: false,
            dragPan: true
        }
    }
};

/**
 * generate map defaults
 * @param {object} options to merge with defaults
 * @return {object} options merged with defaults
 */
export const applyDefaults = (options = {}) => merge({}, DEFAULT_MAP_OPTIONS, options);
/**
 * create map object
 * @param {object} baseMap initial map object
 * @param {object} overrides object to override with
 * @return {object} options merged with defaults
 */
export const createMapObject = (baseMap = {}, overrides = {}) => {
    return merge({}, baseMap, overrides);
};
/**
 * check if a string matches a regex
 * @param {string} title string to test
 * @param {string} filterText used to generate regex
 * @param {RegExp} [regex] used to test input string, default it uses the filterText
 * @return {boolean} true if it matches, false otherwise
 */
export const testRegex = (title, filterText, regex = RegExp(filterText, "i")) => {
    return filterText ? regex.test(title) : true;
};
/**
 * filter resources based on their title (name in case of missing title), description and a filter string
 * @param {object[]} resources resources to filter
 * @param {string} filterText string used to generate regex
 * @param {RegExp} [regex] regex used to test input string, default it uses the filterText
 * @return {object[]} filtered resources
 */
export const filterResources = (resources = [], filterText, regex = RegExp(filterText, "i") ) => {
    return filter(resources, r => testRegex(r.data && (r.data.title || r.data.name), filterText, regex) || testRegex(r.data && r.data.description, filterText, regex));
};
/**
 * Creates a default template for the given type
 * @param {string} type can be section type, a content type or a template (custom. i.e. paragraph with initial image for add media)
 * @return {object} the template object of the content/section
 */
export const getDefaultSectionTemplate = (type, localize = v => v) => {
    switch (type) {
    case SectionTypes.TITLE:
        return {
            id: uuid(),
            type: SectionTypes.TITLE,
            title: localize("geostory.builder.defaults.titleTitle"),
            cover: false,
            contents: [
                {
                    id: uuid(),
                    type: ContentTypes.TEXT,
                    html: '',
                    size: 'large',
                    align: 'center',
                    theme: '',
                    background: {
                        fit: 'cover',
                        size: 'full',
                        align: 'center'
                    }
                }
            ]
        };
    case SectionTypes.BANNER:
        return {
            id: uuid(),
            type: SectionTypes.BANNER,
            title: localize("geostory.builder.defaults.titleBanner"),
            cover: false,
            contents: [{
                id: uuid(),
                background: {
                    fit: 'cover',
                    size: 'full',
                    align: 'center'
                }
            }]
        };
    case SectionTypes.PARAGRAPH:
        return {
            id: uuid(),
            type: SectionTypes.PARAGRAPH,
            title: localize("geostory.builder.defaults.titleParagraph"),
            contents: [
                {
                    id: uuid(),
                    type: ContentTypes.COLUMN,
                    size: 'full',
                    align: 'center',
                    contents: [{
                        id: uuid(),
                        type: ContentTypes.TEXT,
                        html: ''
                    }]
                }
            ]
        };
    case SectionTypes.IMMERSIVE:
        return {
            id: uuid(),
            type: SectionTypes.IMMERSIVE,
            title: localize("geostory.builder.defaults.titleImmersive"),
            contents: [getDefaultSectionTemplate(ContentTypes.COLUMN, localize)]
        };
    case SectionTemplates.MEDIA: {
        return {
            id: uuid(),
            type: SectionTypes.PARAGRAPH,
            title: localize("geostory.builder.defaults.titleMedia"),
            contents: [
                {
                    id: uuid(),
                    type: ContentTypes.COLUMN,
                    contents: [{
                        id: uuid(),
                        type: ContentTypes.MEDIA,
                        size: 'large',
                        align: 'center'
                    }]
                }
            ]
        };
    }
    case SectionTemplates.WEBPAGE: {
        return {
            id: uuid(),
            type: SectionTypes.PARAGRAPH,
            title: localize("geostory.builder.defaults.titleWebPageSection"),
            contents: [
                {
                    id: uuid(),
                    type: ContentTypes.COLUMN,
                    contents: [{
                        id: uuid(),
                        type: ContentTypes.WEBPAGE,
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
            theme: '',
            title: localize("geostory.builder.defaults.titleImmersiveContent"),
            contents: [{
                id: uuid(),
                type: ContentTypes.TEXT,
                html: ''
            }],
            background: {
                fit: 'cover',
                size: 'full',
                align: 'center'
            }
        };
    }
    case ContentTypes.TEXT: {
        return {
            id: uuid(),
            type: ContentTypes.TEXT,
            title: localize("geostory.builder.defaults.titleText"),
            html: ''
        };
    }
    case ContentTypes.IMAGE: {
        return {
            id: uuid(),
            type,
            title: localize("geostory.builder.defaults.titleMedia"),
            size: 'full',
            align: 'center'
        };
    }
    case ContentTypes.WEBPAGE: {
        return {
            id: uuid(),
            type,
            title: localize("geostory.builder.defaults.titleWebPage"),
            size: 'medium',
            align: 'center'
        };
    }
    case ContentTypes.MEDIA: {
        return {
            id: uuid(),
            type,
            title: localize("geostory.builder.defaults.titleUnknown"),
            size: 'large',
            align: 'center'
        };
    }
    default:
        return {
            id: uuid(),
            type,
            title: localize("geostory.builder.defaults.titleUnknown"),
            size: 'full',
            align: 'center'
        };
    }
};

/**
 * transforms the path with  into a path with predicates into a path with array indexes
 * @private
 * @param {string|string[]} rawPath path to transform in real path
 * @param {object} state the state to check to inspect the tree and get the real path
 */
export const getEffectivePath = (rawPath, state) => {
    const rawPathArray = toPath(rawPath); // converts `a.b['section'].c[{"a":"b"}]` into `["a","b","section","c","{\"a\":\"b\"}"]`
    // use curly brackets elements as predicates of findIndex to get the correct index.
    return rawPathArray.reduce( (path, current) => {
        if (current && current.indexOf('{') === 0) {
            const predicate = JSON.parse(current);
            const currentArray = get(state, path);
            const index = findIndex(
                currentArray,
                predicate
            );
            if (index >= 0) {
                return [...path, index];
            }
            // if the predicate is not found, it will ignore the unknown part
            return path;
        }
        return [...path, current];
    }, []);
};


/**
 * transforms the path with  predicates into a path with id
 * @private
 * @param {string|string[]} rawPath path to transform in real path
 * @param {object} state the state to check to inspect the tree and get the real path
 */
export const getFlatPath = (rawPath, state) => {
    const rawPathArray = toPath(rawPath); // converts `a.b['section'].c[{"a":"b"}]` into `["a","b","section","c","{\"a\":\"b\"}"]`
    // use curly brackets elements as predicates of findIndex to get the correct index.
    return rawPathArray.reduce( ({path, flatPath}, current) => {
        if (current && current.indexOf('{') === 0) {
            const predicate = JSON.parse(current);
            const currentArray = get(state, path);
            const index = findIndex(
                currentArray,
                predicate
            );
            if (index >= 0) {
                const {id, type} = currentArray[index];
                return {path: [...path, index], flatPath: [...flatPath, {id, type: path[path.length - 1],  contentType: type}]};
            }
            // if the predicate is not found, it will ignore the unknown part
            return {path, flatPath};
        }
        return {path: [...path, current], flatPath};
    }, {path: [], flatPath: []});
};

/** finding section id from a give column id (immersive content)
 * @param {object[]} immSections sections to loop on
 * @param {*} columnId to use to find its section parent
 */
export const findSectionIdFromColumnId = (immSections, columnId) => {
    return immSections.reduce((p, c) => {
        if (includes(c.contents.map(cont => cont.id), columnId)) {
            return c.id;
        }
        return p;
    }, null);
};

/**
 * tells if an element is a paragraph and it contains a WebPage component
 * @param {object} element
 * @return {boolean}
 */
export const isWebPageSection = (element) =>
    element.type === SectionTypes.PARAGRAPH &&
    element.editURL !== false &&
    element &&
    isArray(element.contents) &&
    element.contents.length &&
    isArray(element.contents[0].contents) &&
    element.contents[0].contents.length &&
    element.contents[0].contents[0].type === ContentTypes.WEBPAGE &&
    element.contents[0].contents[0].editURL !== false;

/**
* computes container height based on object size
* @param {string} size - size of element
* @param {number} viewHeight - height of viewport
*/
export const getWebPageComponentHeight = (size, viewHeight) => {
    if (viewHeight) {
        switch (size) {
        case 'small':
            return viewHeight * 0.4;
        case 'medium':
            return viewHeight * 0.6;
        case 'large':
            return viewHeight * 0.8;
        default:
            return viewHeight;
        }
    }

    return 0;
};

export const parseHashUrlScrollUpdate = (url, hash = '', storyId, sectionId, columnId) => {
    const EMPTY = 'EMPTY';
    if (!hash.includes(storyId)) {
        return null;
    }
    const storyIds = hash.substring(hash.indexOf(storyId)).split('/');

    if (sectionId && storyId) {
        if (storyIds.length > 1 && storyIds[2] && Number(storyIds[0]) === storyId) {
            if (storyIds.length === 5) {
                return replace(url, `${storyIds[2]}/column/${storyIds[4]}`, `${sectionId}`);
            }
            return replace(url, `${storyIds[2]}`, `${sectionId}`);
        }
        if (hash.includes('shared')) {
            return storyIds[1] !== '' ? `${url}/section/${sectionId}` : `${url}section/${sectionId}`;
        }
        return storyIds[1] !== '' ? `${url}/section/${sectionId}` : `${url}section/${sectionId}`;
    } else if (!sectionId && columnId && isString(columnId) && columnId !== EMPTY) {
        if (storyIds.length > 1) {
            if (hash.includes('shared') && !storyIds[2]) {
                return url;
            }
            if (storyIds.length === 5) {
                return replace(url, `${storyIds[4]}`, `${columnId}`);
            }
            return `${url}/column/${columnId}`;
        }
    }
    return null;
};

/**
 * Creates a configuration from localConfig object to be used by the webfontloader library
 * @param {array} fontFamilies - font families configured from localConfig
 * @param {function} activeCallback - call back function to run when fonts are successfully loaded
 * @param {function} inactiveCallback - call back function to run when font loading fails
 */
export const createWebFontLoaderConfig = (fontFamilies, activeCallback, inactiveCallback) => {
    const config = {
        active: activeCallback,
        inactive: inactiveCallback,
        custom: {
            families: [],
            urls: []
        }
    };

    // first filter out those without a src property
    fontFamilies.filter((family) => !!family.src)
        .forEach((family, i) => {
            config.custom.families[i] = family.family;
            config.custom.urls[i] = family.src;
        });

    return config;
};

/**
 * Creates an array with just font family names from an object
 * @param {array} fontFamilies - an array of font families i.e [{"name": "fontName", "src": "fontSrc"}]
 * @return {array} - array of font family names
 */
export const extractFontNames = (fontFamilies) => {
    return fontFamilies.map(family => family.family);
};

export const DEFAULT_FONT_FAMILIES = [
    'inherit',
    'Arial',
    'Georgia',
    'Impact',
    'Tahoma',
    'Times New Roman',
    'Verdana'
];
