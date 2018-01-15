/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {isString} = require('lodash');

module.exports = {
    /**
     * generates a template string to use for static replacements.
     * It's useful for using a similar syntax for static configured strings to
     * use as templates.
     */
    generateTemplateString: (function() {
        var cache = {};

        function generateTemplate(template, escapeFn) {

            var fn = cache[template];
            // if escapeFn is defined, no cache is used
            if (!fn || escapeFn) {
                fn = (map) => {

                    let sanitized = template
                    .replace(/\$\{([\s]*[^;\s\{]+[\s]*)\}/g, (_, match) => {
                        const escapeFunction = escapeFn || (a => a);
                        return escapeFunction(match.trim().split(".").reduce((a, b) => {
                            return a && a[b];
                        }, map));
                    });

                    return isString(sanitized) && sanitized || '';
                };
                if (!escapeFn) {
                    cache[template] = fn;
                }


            }
            return fn;
        }
        return generateTemplate;
    })(),

    parseTemplate: function(temp, callback) {
        require.ensure(['babel-standalone'], function() {
            const Babel = require('babel-standalone');
            let template = typeof temp === 'function' ? temp() : temp;
            try {
                const comp = Babel.transform(template, { presets: ['es2015', 'react', 'stage-0'] }).code;
                callback(comp);
            } catch (e) {
                callback(null, e);
            }
        });
    }
};
