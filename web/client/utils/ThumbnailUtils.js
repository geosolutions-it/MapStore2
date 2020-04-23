/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * Utility functions for thumbnails
 * @memberof utils
 * @static
 * @name ThumbnailUtils
 */

/**
 * it returns a scaled image in base64 based on the provided options given a image source
 * @param  {string} src source image
 * @param  {object} options options for the generated thumbnail
 * @param  {number} options.width width of generated thumbnail
 * @param  {number} options.height height of generated thumbnail
 * @param  {boolean} options.contain position of image in the thumbnail
 * @param  {string} options.type mime type of generated thumbnail
 * @param  {object} options.quality quality of generated thumbnail (from 0.0 to 1.0)
 * @return {promise}
 * @memberof utils.ThumbnailUtils
 */
export const createBase64Thumbnail = (src, options) => {
    return new Promise((resolve, reject) => {
        const {
            width = 64,
            height = 64,
            contain,
            type = 'image/jpeg',
            quality = 0.5
        } = options || {};
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const { naturalWidth, naturalHeight } = img;
            const imgResolution = naturalWidth / naturalHeight;
            const thumbnailWidth = width;
            const thumbnailHeight = height;
            const thumbnailResolution = width / height;
            const canvas = document.createElement('canvas');
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            const ctx = canvas.getContext('2d');
            const thumbnailImageSize = !contain && imgResolution < thumbnailResolution
                || contain && imgResolution > thumbnailResolution
                ? [ thumbnailWidth, thumbnailWidth / imgResolution]
                : [ thumbnailHeight * imgResolution, thumbnailHeight];
            ctx.save();
            ctx.translate(thumbnailWidth / 2, thumbnailHeight / 2);
            ctx.drawImage(img, -thumbnailImageSize[0] / 2, -thumbnailImageSize[1] / 2, thumbnailImageSize[0], thumbnailImageSize[1]);
            ctx.restore();
            const dataURL = canvas.toDataURL(type, quality);
            resolve(dataURL);
        };
        img.onerror = (error) => {
            reject(error);
        };
        img.src = src;
    });
};

/**
 * it returns the first frame as base64 image given a video source
 * @param  {string} src source video
 * @param  {object} options options for the generated thumbnail
 * @param  {string} options.type mime type of generated thumbnail
 * @param  {object} options.quality quality of generated thumbnail (from 0.0 to 1.0)
 * @return {promise}
 * @memberof utils.ThumbnailUtils
 */
export const getVideoFrame = (src, options) => {
    return new Promise((resolve, reject) => {
        const {
            type = 'image/jpeg',
            quality = 0.5
        } = options || {};
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        const source = document.createElement('source');
        const canvas = document.createElement('canvas');
        video.addEventListener('loadedmetadata', () => {
            const {
                videoWidth,
                videoHeight
            } = video;
            const width = videoWidth;
            const height = videoHeight;
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
        }, true);
        video.addEventListener('loadeddata', () => {
            video.currentTime = 1;
        }, true);
        video.addEventListener('seeked', () => {
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            try {
                const dataURL = canvas.toDataURL(type, quality);
                resolve(dataURL);
            } catch (e) {
                reject(e);
            }
        }, true);
        video.addEventListener('error', (error) => {
            reject(error);
        }, true);
        video.appendChild(source);
        video.setAttribute('src', src);
    });
};

/**
 * it returns a thumbnail given a video source
 * @param  {string} src source video
 * @param  {object} options options for the generated thumbnail
 * @param  {number} options.width width of generated thumbnail
 * @param  {number} options.height height of generated thumbnail
 * @param  {boolean} options.contain position of image in the thumbnail
 * @param  {string} options.type mime type of generated thumbnail
 * @param  {object} options.quality quality of generated thumbnail (from 0.0 to 1.0)
 * @return {promise}
 * @memberof utils.ThumbnailUtils
 */
export const getVideoThumbnail = (src = '', options) => {
    const MATCH_YOUTUBE_URL = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})|youtube\.com\/playlist\?list=/;
    const youtubeId = src.match(MATCH_YOUTUBE_URL)?.[1];

    if (youtubeId) {
        return new Promise((response) =>
            response(`http://img.youtube.com/vi/${youtubeId}/sddefault.jpg`));
    }

    if (!src.match(/\.(mp4|og[gv]|webm|mov|m4v)($|\?)/i)) {
        return new Promise((response, reject) => reject('Cannot create a thumbnail from the provided source'));
    }
    return getVideoFrame(src)
        .then((dataURL) =>
            createBase64Thumbnail(dataURL, options));
};

export default {
    createBase64Thumbnail,
    getVideoFrame,
    getVideoThumbnail
};
