/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {isString, has, trim} = require('lodash');

const TemplateUtils = {
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
    },
    /**
     * check if a string attribute is inside of a given object
     * @param feature {object}
     * @param attribute {string} name of attribue with dot notations
     * @param start {array} substring start
     * @param end {array} substring end
     * @return {bool} true if feature contains the attribute
     */
    validateStringAttribute: (feature, attribute, start = 0, end = 0) => {
        const path = isString(attribute) && trim(attribute.substring(start, attribute.length - end)) || '';
        return has(feature, path);
    },
    /**
     * returns a valid template
     * @param template {string} text with attribute to validate
     * @param feature {object} object to match attributes
     * @param regex {regex}
     * @param start {array} substring start
     * @param end {array} substring end
     * @return {string} templete without invalid attribute and html tag inside attribute, e.g. ${ <p>properties.id</p> } -> ${ properties.id }
     */
    getCleanTemplate: (template, feature, regex, start = 0, end = 0) => {
        const matchVariables = isString(template) && template.match(regex);
        const replacedTag = matchVariables && matchVariables.map(temp => ({ previous: temp, next: TemplateUtils.validateStringAttribute(feature, temp.replace(/(<([^>]+)>)/ig, ''), start, end) && temp.replace(/(<([^>]+)>)/ig, '') || ''})) || null;
        return replacedTag && replacedTag.reduce((temp, variable) => temp.replace(variable.previous, variable.next), template) || template || '';
    }
};

module.exports = TemplateUtils;
