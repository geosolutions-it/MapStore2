/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Check if a service url is of type ImageServer
 * @param {string} serviceUrl service url
 * @return {boolean}
 */
export const isImageServerUrl = (serviceUrl = '') => serviceUrl.includes('ImageServer');
/**
 * Check if a service url is of type MapServer
 * @param {string} serviceUrl service url
 * @return {boolean}
 */
export const isMapServerUrl = (serviceUrl = '') => serviceUrl.includes('MapServer');
