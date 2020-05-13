/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Utility functions for layers localization
 * @memberof utils
 * @static
 * @name LayerLocalizationUtils
 */

/**
 * The generateEnvString function converts ENV array into the string.
 * @param  {array} env the array that represents the sequence of name/values pairs defined by localConfig
 * @return {string} the string presentation of env param
 * @memberof utils.LayerLocalizationUtils
 */
const generateEnvString = (env = []) => {
    if (env.length) {
        return env.map(({ name, value }) => `${name}:${value}`).join(';');
    }
    return '';
};

export {
    generateEnvString
};
