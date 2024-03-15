
/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import { uniq } from 'lodash';
import chroma from 'chroma-js';

const defaultClassificationColors = {
    red: ['#000', '#f00'],
    green: ['#000', '#008000', '#0f0'],
    blue: ['#000', '#00f'],
    gray: ['#333', '#eee'],
    jet: ['#00f', '#ff0', '#f00'],
    random: ['#57663d', '#408064', '#3d539a', '#af36b3', '#cdff29']
};

const supportedColorBrewer = uniq(Object.keys(chroma.brewer).map((key) => key.toLocaleLowerCase()))
    .map((key) => ({
        name: key,
        colors: key
    }));
/**
 * List of available color ramps
 */
export const standardClassificationScales = [
    ...Object.keys(defaultClassificationColors).map(name => ({
        name,
        colors: defaultClassificationColors[name]
    })),
    ...supportedColorBrewer
].map(entry => ({
    ...entry,
    label: `global.colors.${entry.name}`
}));
/**
 * Return correct color scale value
 * @param {string} name the name of the ramp
 * @returns {string|array}
 */
export const getChromaScaleByName = (name) => {
    return defaultClassificationColors[name] ?? name;
};

