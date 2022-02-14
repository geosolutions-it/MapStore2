/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get, isArray, has } from 'lodash';

import {INFO_FORMATS} from './FeatureInfoUtils';

export const getFormatForResponse = (res, props) => {
    const {format, queryParams = {}} = res;
    // handle WMS/WMTS.., and also WFS
    return queryParams.info_format
        || queryParams.outputFormat
        || format && INFO_FORMATS[format]
        || props.format;
};

export const responseValidForEdit = (res) => !!get(res, 'layer.search.url');

/**
 * Returns true or false based on a local config
 * @param {object} localConfig the localConfig object stored in state
 * @param {string} platform either 'mobile' or 'desktop'
 * @param {string} pluginName name of plugin
 * @param {string} cfg name of config to target
 * @returns {boolean}
 */
export const displayByLocalConfig = (
    localConfig,
    platform,
    pluginName,
    cfg) => {
    const devicePlatform = localConfig?.plugins && localConfig.plugins[platform];
    const plugin = isArray(devicePlatform) && devicePlatform.find(item => item.hasOwnProperty('name') && item.name === pluginName);
    if (has(plugin, `cfg.${cfg}`)) {
        return plugin.cfg[cfg];
    }
    return true;
};
