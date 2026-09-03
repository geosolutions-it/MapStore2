/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {isString, has, isNil, trim} from 'lodash';
import escape from 'lodash/escape';

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
                        // only a missing value falls back to '', 0 and false are kept
                        const value = match.trim().split(".").reduce((a, b) => isNil(a) ? undefined : a[b], map);
                        return escapeFunction(isNil(value) ? '' : value);
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


/**
 * parses a template with attributes defined in ${ ... } and applied to the metadata object
 * @param metadataTemplate {string} text with attribute to validate
 * @param getDefaultMissingProperty {function} if defined it returns a default value for undefined attributes
 * @param metadata {object} metadata object to match attributes
 * @return {string} template without invalid attribute and html tag inside attribute, e.g. ${ <p>properties.id</p> } -> ${ properties.id } and a default value for undefined attributes
 */
export const parseCustomTemplate = (metadataTemplate = "", metadata = {}, getDefaultMissingProperty = (attribute) => `${trim(attribute.substring(2, attribute.length - 1))} Not Available`) => {
    // values are escaped because the result is rendered as HTML
    return generateTemplateString(
        getCleanTemplate(metadataTemplate || '', metadata, /\$\{.*?\}/g, 2, 1, getDefaultMissingProperty),
        (value) => escape(String(value ?? ''))
    )(metadata);
};

const TemplateUtils = {
    /**
     * generates a template string to use for static replacements.
     * It's useful for using a similar syntax for static configured strings to
     * use as templates.
     */
    generateTemplateString,
    validateStringAttribute,
    getCleanTemplate,
    parseCustomTemplate
};

export default TemplateUtils;

