/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {get} = require('lodash');
const ConfigUtils = require('../utils/ConfigUtils');

const getRecords = (url, startPosition, maxRecords, text) => {
    const backgroundList = get(ConfigUtils.getDefaults(), 'initialState.defaultState.catalog.default.staticServices.default_map_backgrounds.backgrounds');
    const textBg = backgroundList.filter(bg => !text || bg.title.indexOf(text) > -1);
    const records = textBg.filter((bg, idx) => idx >= startPosition - 1 && idx < maxRecords + startPosition - 1);
    return new Promise((resolve) => {
        return resolve({
            numberOfRecordsMatched: textBg.length,
            numberOfRecordsReturned: records.length,
            records,
            service: {
                Name: 'Background Provider'
            }
        });
    });
};

const reset = () => {};
module.exports = {
    getRecords,
    reset,
    textSearch: (url, startPosition, maxRecords, text) => getRecords(url, startPosition, maxRecords, text)
};
