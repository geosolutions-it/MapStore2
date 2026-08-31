/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const DISPLAY_TYPES = [
    'image', 'video', 'audio', 'panorama', 'pdf', 'url', 'iframe', 'media'
];

const EXTENSION_TYPES = {
    image: ['avif', 'bmp', 'gif', 'jpeg', 'jpg', 'png', 'svg', 'tif', 'tiff', 'webp'],
    video: ['avi', 'm4v', 'mkv', 'mov', 'mp4', 'ogv', 'webm'],
    audio: ['aac', 'flac', 'm4a', 'mp3', 'oga', 'ogg', 'opus', 'wav'],
    pdf: ['pdf'],
    iframe: ['htm', 'html']
};

const EXTENSION_TO_TYPE = Object.keys(EXTENSION_TYPES).reduce((result, type) => ({
    ...result,
    ...EXTENSION_TYPES[type].reduce((extensions, extension) => ({
        ...extensions,
        [extension]: type
    }), {})
}), {});

const MEDIA_TYPE_PREFIXES = ['image', 'video', 'audio'];

const MEDIA_TYPES = {
    'application/pdf': 'pdf',
    'text/html': 'iframe'
};

export const getDisplayTypeFromMediaType = (mediaType) => {
    if (typeof mediaType !== 'string') {
        return null;
    }
    const normalizedMediaType = mediaType.toLowerCase().trim();
    if (!normalizedMediaType.includes('/')) {
        return DISPLAY_TYPES.includes(normalizedMediaType)
            ? normalizedMediaType
            : EXTENSION_TO_TYPE[normalizedMediaType] || null;
    }
    const [prefix] = normalizedMediaType.split('/');
    return MEDIA_TYPE_PREFIXES.includes(prefix) ? prefix : MEDIA_TYPES[normalizedMediaType] || null;
};

export const getDisplayTypeFromExtension = (value) => {
    if (typeof value !== 'string') {
        return null;
    }
    const extension = value.split(/[?#]/)[0].match(/\.([^.\\/]+)$/)?.[1]?.toLowerCase();
    return extension ? EXTENSION_TO_TYPE[extension] || null : null;
};

export const resolveAttributeDisplayType = ({ value, attribute = {}, mediaTypeValue } = {}) => {
    if (!attribute.displayType) {
        return 'string';
    }
    const configuredType = attribute.displayType === 'media'
        ? getDisplayTypeFromMediaType(mediaTypeValue)
        : getDisplayTypeFromMediaType(attribute.displayType);
    return configuredType || getDisplayTypeFromExtension(value) || (attribute.displayType === 'media' ? 'url' : 'string');
};

export const DEFAULT_DOCUMENTS_FEATURE_INFO = {
    views: [{
        id: 'documents',
        type: 'PROPERTIES',
        attributes: [
            { name: 'title', visible: true },
            { name: 'href', visible: true, displayType: 'media', mediaTypeAttribute: 'extension' }
        ]
    }]
};
