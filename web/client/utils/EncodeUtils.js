/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const regexWhitelist = /[ !#-&\(-\[\]-~]/;
const regexSingleEscape = /["'\\\b\f\n\r\t]/;

const EncodeUtils = {
    /**
     * This piece of code is a short version of https://github.com/mathiasbynens/jsesc functionalities.
     * Encodes a string so that UTF-8 chars are replaced by hex codes escapes.
     * @memberof utils.EncodeUtils
     * @function
     * @param {String} string the string to encode
     * @return {String} the encoded string
     */
    utfEncode: function(string) {
        let index = -1;
        const length = string.length;
        let result = '';
        while (++index < length) {
            const character = string.charAt(index);

            if (regexWhitelist.test(character) || character === '"' || character === '`' || character === '\'') {
                // It’s a printable ASCII character
                // so don’t escape it.
                result += character;
                continue;
            }

            if (regexSingleEscape.test(character)) {
                // no need for a `hasOwnProperty` check here
                result += character;
                continue;
            }

            const charCode = character.charCodeAt(0);

            let hexadecimal = charCode.toString(16).toUpperCase();
            const escaped = '\\' + 'u' +
                ('0000' + hexadecimal).slice(-4);
            result += escaped;
        }
        return result;
    }
};


module.exports = EncodeUtils;
