/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const LINKED_RESOURCE_REGEX = /rest\/geostore\/data\/(\d+)/;


/**
 * Extracts the ID of a resource from the attribute value.
 * Linked resources are by default absolute paths as attributes. They have this shape: `/rest/geostore/data/1`
 * Old linked resources, because of old limitations of geostore, had to te encoded, so they looked more similar to `rest%2Fgeostore%2Fdata%2F11558`
 * For thumbnails, the urls will be something like `rest/geostore/data/11558/raw?decode=datauri&v=ea756fc0-f4df-11e9-8355-ebd99ddbebe0`
 * or`rest%2Fgeostore%2Fdata%2F11558%2Fraw%3Fdecode%3Ddatauri%26v%3Dea756fc0-f4df-11e9-8355-ebd99ddbebe0` (encoded).
 * v is used to invalidate cache, raw?decode=datauri to convert to base64 into image.
 * @param {string} path attribute value
 */
export const getResourceIdFromURL = path => {
    /* double decoding is needed for backward compatibility with old linked resources
    * the second one doesn't have effect to URLS like /rest/geostore/data/1
    * but correctly decodes old thumbnails
    * This is correct here because this function only retrieves the ID from the URL, to identify linked resources.
    */
    const decodedUrl = decodeURIComponent(decodeURIComponent(path));
    const res = LINKED_RESOURCE_REGEX.exec(decodedUrl);
    return res && !!res[0] && res[1];
};

