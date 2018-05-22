/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Utility functions for String manipulations.
 * @memberof utils
 */
const StringUtils = {
    /**
     * Tests if a string contains html tags
     * @param {string} str string to parse with regex
     * @return {bool} the result of the test
    */
    containsHTML: (str) => {
        // regex used http://www.pagecolumn.com/tool/all_about_html_tags.htm
        const htmlRegex = new RegExp("<(.|\\n)*?>", 'g');
        return htmlRegex.test(str);
    }

};

module.exports = StringUtils;
