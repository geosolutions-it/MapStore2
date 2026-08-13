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

/**
 * Checks URLs rendered as navigable feature-info content.
 * Allows same-origin resources and cross-origin HTTPS resources.
 */
export const isSafeFeatureInfoURL = (value) => {
    if (typeof value !== 'string' || !value.trim()) {
        return false;
    }
    try {
        const baseURL = typeof window !== 'undefined' && window.location?.origin
            ? window.location.origin
            : 'http://localhost';
        const url = new URL(value.trim(), baseURL);
        return url.origin === baseURL || url.protocol === 'https:';
    } catch (error) {
        return false;
    }
};

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

export const getDisplayTypeFromMediaType = (mediaType) => {
    if (typeof mediaType !== 'string') {
        return null;
    }
    const normalizedMediaType = mediaType.toLowerCase().trim();
    const normalizedType = normalizedMediaType.includes('/')
        ? normalizedMediaType.split('/')[0] === 'image'
            ? 'image'
            : normalizedMediaType.split('/')[0] === 'video'
                ? 'video'
                : normalizedMediaType.split('/')[0] === 'audio'
                    ? 'audio'
                    : normalizedMediaType === 'application/pdf'
                        ? 'pdf'
                        : normalizedMediaType === 'text/html'
                            ? 'iframe'
                            : normalizedMediaType.split('/').pop()
        : normalizedMediaType;
    return DISPLAY_TYPES.includes(normalizedType) ? normalizedType : null;
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
    return configuredType || getDisplayTypeFromExtension(value) || 'string';
};
