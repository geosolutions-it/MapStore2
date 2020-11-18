/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import wpsChart from './wpsChart';
import wfsChart from './wfsChart';

import {branch} from 'recompose';

/**
 * Wrapper to select the correct enhancer
 * for the WFS/WPS chart based on the current selection.
 */
export default branch(
    ({ options = {} }) => !options.aggregateFunction || options.aggregateFunction === "None",
    wfsChart,
    wpsChart
);
