/*
* Copyright 2025, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import {
    isString,
    trim,
    isNumber
} from 'lodash';

export const DEFAULT_PANEL_WIDTH = 420;

export const DEFAULT_MAP_LAYOUT = {left: {sm: 300, md: 500, lg: 600}, right: { md: DEFAULT_PANEL_WIDTH }, bottom: {sm: 0}};

/**
 * Return parsed number from layout value
 * if percentage returns percentage of second argument that should be a number
 * eg. 20% of map height parseLayoutValue(20%, map.size.height)
 * but if value is stored as number it will return the number
 * eg. parseLayoutValue(50, map.size.height) returns 50
 * @param value {number|string} number or percentage value string
 * @param size {number} only in case of percentage
 * @return {number}
 */
export const parseLayoutValue = (value, size = 0) => {
    if (isString(value) && value.indexOf('%') !== -1) {
        return parseFloat(trim(value)) * size / 100;
    }
    return isNumber(value) ? value : 0;
};
