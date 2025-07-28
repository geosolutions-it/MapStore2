/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

/**
 * if this function finds a segment of url it will replace all occurrences otherwise it will ignore old urls
 * @param {object} objectToInspect js object to inspect for replacing strings
 * @param {object} urlsToReplace the list of urls to replaces with key value pairs as object
 * @returns
 */
export const migrateAllUrls = (objectToInspect, urlsToReplace) => {
    let stringVar = JSON.stringify(objectToInspect);
    Object.keys(urlsToReplace).forEach((url) => {
        stringVar = stringVar.replaceAll(url, urlsToReplace[url]);
    });
    return JSON.parse(stringVar);
};
