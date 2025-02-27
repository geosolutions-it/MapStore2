/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isEmpty from "lodash/isEmpty";

/**
 * Utility functions for String manipulations.
 * @memberof utils
 */

/**
 * Tests if a string contains html tags
 * @param {string} str string to parse with regex
 * @return {bool} the result of the test
*/
export const containsHTML = (str) => {
    // regex used http://www.pagecolumn.com/tool/all_about_html_tags.htm
    const htmlRegex = new RegExp("<(.|\\n)*?>", 'g');
    return htmlRegex.test(str);
};
/**
 * Tests if a string is a valid email. Default regexp source: https://www.regular-expressions.info/email.html
 * @param {string} str string to validate
 * @param {RegExp} regexp regexp to validate with
 * @return {bool} the result of the test
 */
export const isValidEmail = (str, regexp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/) => {
    return regexp.test(str);
};

/**
 * Remove duplicate lines in a sentence
 * @param {string} value
 * @returns {string} string with unique lines
 */
export const removeDuplicateLines = (value) => {
    const lines = value.split('\n');
    const uniqueLines = [];

    lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (isEmpty(uniqueLines) || !uniqueLines.some(l => l.includes(trimmedLine))) {
            uniqueLines.push(trimmedLine);
        }
    });

    return uniqueLines.join(' ');
};
