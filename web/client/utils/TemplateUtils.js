/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {isString, has, trim, template} from 'lodash';

/**
 * check if a string attribute is inside of a given object
 * @param feature {object}
 * @param attribute {string} name of attribue with dot notations
 * @param start {array} substring start
 * @param end {array} substring end
 * @return {bool} true if feature contains the attribute
 */
export const validateStringAttribute = (feature, attribute, start = 0, end = 0) => {
    const path = isString(attribute) && trim(attribute.substring(start, attribute.length - end)) || '';
    return has(feature, path);
};

/**
 * returns a valid template
 * @param chosenTemplate {string} text with attribute to validate
 * @param feature {object} object to match attributes
 * @param regex {regex}
 * @param start {array} substring start
 * @param end {array} substring end
 * @return {string} template without invalid attribute and html tag inside attribute, e.g. ${ <p>properties.id</p> } -> ${ properties.id }
 */
export const getCleanTemplate = (chosenTemplate, feature, regex, start = 0, end = 0, getDefaultMissingProperty = () => "") => {
    const matchVariables = isString(chosenTemplate) && chosenTemplate.match(regex);
    const replacedTag = matchVariables && matchVariables.map(temp => {
        const varReplaced = temp.replace(/(<([^>]+)>)/ig, '');
        return {
            previous: temp,
            next: validateStringAttribute(feature, varReplaced, start, end) ? varReplaced : getDefaultMissingProperty(temp)
        };
    }) || null;
    return replacedTag && replacedTag.reduce((temp, variable) => temp.replace(variable.previous, variable.next), chosenTemplate) || chosenTemplate || '';
};

/**
 * parses a template with attributes defined in ${ ... } and applied to the metadata object
 * @param metadataTemplate {string} text with attribute to validate
 * @param getDefaultMissingProperty {function} if defined it returns a default value for undefined attributes
 * @param metadata {object} metadata object to match attributes
 * @return {string} template without invalid attribute and html tag inside attribute, e.g. ${ <p>properties.id</p> } -> ${ properties.id } and a default value for undefined attributes
 */
export const parseCustomTemplate = (metadataTemplate = "", metadata = {}, getDefaultMissingProperty = (attribute) => `${trim(attribute.substring(2, attribute.length - 1))} Not Available`) => {
    return template(getCleanTemplate(metadataTemplate || '', metadata, /\$\{.*?\}/g, 2, 1, getDefaultMissingProperty))(metadata);
};

export const generateTemplateString = (function() {
    var cache = {};

    function generateTemplate(chosenTemplate, escapeFn) {

        var fn = cache[chosenTemplate];
        // if escapeFn is defined, no cache is used
        if (!fn || escapeFn) {
            fn = (map) => {

                let sanitized = chosenTemplate
                    .replace(/\$\{([\s]*[^;\s\{]+[\s]*)\}/g, (_, match) => {
                        const escapeFunction = escapeFn || (a => a);
                        return escapeFunction(match.trim().split(".").reduce((a, b) => {
                            return a && a[b];
                        }, map));
                    });

                return isString(sanitized) && sanitized || '';
            };
            if (!escapeFn) {
                cache[chosenTemplate] = fn;
            }


        }
        return fn;
    }
    return generateTemplate;
})();

export const parseTemplate = function(temp, callback) {
    require.ensure(['babel-standalone'], function() {
        const Babel = require('babel-standalone');
        let chosenTemplate = typeof temp === 'function' ? temp() : temp;
        try {
            const comp = Babel.transform(chosenTemplate, { presets: ['es2015', 'react', 'stage-0'] }).code;
            callback(comp);
        } catch (e) {
            callback(null, e);
        }
    });
};

const TemplateUtils = {
    /**
     * generates a template string to use for static replacements.
     * It's useful for using a similar syntax for static configured strings to
     * use as templates.
     */
    generateTemplateString,
    parseTemplate,
    validateStringAttribute,
    getCleanTemplate,
    parseCustomTemplate
};

export default TemplateUtils;

