/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { keys, values, omit, get, head, isString, flatten, uniqWith, find, identity } from 'lodash';

/**
 * Extracts params and character content of a all tags with a specified from a specific namespace
 * @param {string} xmlNameSpace xml namespace uri
 * @param {object} xmlObj xml node represented by an object
 * @param {string} tagName local tag name to extract
 */
export const extractTags = (xmlNameSpace, xmlObj = {}, tagName) => {
    const tagsObj = get(xmlObj, 'childObject', xmlObj);
    return keys(tagsObj).filter(tag => tag !== '$' && tag !== '_' && tag !== '$ns').reduce((result, key) => [
        ...result,
        ...flatten(tagsObj[key].map(tag => {
            const ns = get(tag, '$ns', {});
            return ns.uri !== xmlNameSpace || ns.local !== tagName ?
                [] : [{
                    params: get(tag, '$', {}),
                    charContent: get(tag, '_'),
                    childObject: omit(tag, '$', '_', '$ns')
                }];
        }))
    ], []);
};

/**
 * A version of extractTags that returns just one element instead of an array
 * @param {string} xmlNameSpace xml namespace uri
 * @param {object} xmlObj xml node represented by an object
 * @param {string} tagName local tag name to extract
 */
export const extractTag = (xmlNameSpace, xmlObj, tagName) => head(extractTags(xmlNameSpace, xmlObj, tagName));

/**
 * Extract the value of an attribute from a tag
 * @param {string} xmlNameSpace namespace uri of an attribute
 * @param {object} tagObj xml node represented by an object
 * @param {string} attrName attribute name
 */
export const extractAttributeValue = (xmlNameSpace, tagObj, attrName) => values(get(tagObj, 'params', {})).reduce(
    (result, attribute) => result || attribute.local === attrName && attribute.uri === xmlNameSpace && attribute.value, undefined);

/**
 * Make an object out of attribute values: {[attrName]: attrValue}
 * @param {object} tagObj xml node represented by an object
 * @param {...(string|object)} attrNames an array of attribute names to extract. If an attribute name is a string then it is also used as
 * a prop name in the resulting object and it is assumed that the attribute does not belong to any namespace, otherwise attribute names
 * can be represented with an object {local, uri, paramName}, where local is an attribute name, uri is a namespace and paramName is a prop
 * name in the resulting object
 */
export const pickAttributeValues = (tagObj, ...attrNames) => values(get(tagObj, 'params', {})).reduce((finalObj, param) => {
    const attrName = attrNames.reduce((result, curAttrName) => {
        const {local, uri, paramName} = isString(curAttrName) ? {local: curAttrName, paramName: curAttrName, uri: ''} : curAttrName;
        return result || local === param.local && uri === param.uri && paramName;
    }, null);
    return attrName ? {...finalObj, [attrName]: param.value} : finalObj;
}, {});

export const escapeValue = (skipQuot, skipApos, skipGT, skipLT, value = '') => flatten([
    [[/\&/g, '&amp;']],
    skipQuot ? [] : [[/\"/g, '&quot;']],
    skipApos ? [] : [[/\'/g, '&apos;']],
    skipGT ? [] : [[/\>/g, '&gt;']],
    skipLT ? [] : [[/\</g, '&lt;']]
]).reduce(
    (result, [rexp, replacement]) => result.replace(rexp, replacement),
    value
);

export const escapeText = escapeValue.bind(null, true, true, true, false);
export const escapeAttributeValue = escapeValue.bind(null, false, false, true, false);

export const writeXmlns = ({ns, prefix}) => `xmlns${prefix ? `:${prefix}` : ''}=\"${ns}\"`;

export const writeAttribute = ({xmlns, name, value}) =>
    `${xmlns && xmlns.prefix ? `${xmlns.prefix}:` : ''}${name}=\"${escapeAttributeValue(value.toString())}\"`;

/**
 * Make an XML string from a tree description in a form of a tag descriptor object.
 * Tag descriptor object looks like this:
 * ```
 * {
 *   name: 'tag name',
 *   xmlns: {
 *     ns: 'xml namespace uri',
 *     prefix: 'namespace prefix'
 *   },
 *   textContent: 'text content',
 *   attributes: {
 *     xmlns: 'xmlns object',
 *     name: 'local attribute name',
 *     value: 'attribute string value'
 *   },
 *   children: [
 *     // child tag descriptor objects
 *   ]
 * }
 * ```
 * @param {object} tree xml tree to write in a form of a tag descriptor object:
 * @param {object[]} [xmlnsList=[]] when exists and non-empty, write xmlns from this list in the root element
 * @param {number} [tabSize=2] tab size in spaces
 * @param {string} [newline='\n'] string to insert as a newline
 * @param {number} [nestingLevel=0] how deep is the tag in a hierarchy, zero is the root
 */
export const writeXML = (
    {
        name,
        xmlns,
        textContent = '',
        attributes = [],
        children = []
    },
    xmlnsList = [],
    tabSize = 2,
    newline = '\n',
    nestingLevel = 0
) => {
    const insertNewline = str => `${newline}${' '.repeat(nestingLevel * tabSize)}${str}`;

    const fullTagName = `${xmlns && xmlns.prefix ? `${xmlns.prefix}:` : ''}${name}`;
    const xmlnsArray = xmlnsList.length > 0 ?
        xmlnsList :
        uniqWith([xmlns, ...attributes.map(attr => attr.xmlns)].filter(curXmlns => !!curXmlns), (xmlns1, xmlns2) => xmlns1.ns === xmlns2.ns);
    const writeXmlnsArray = (xmlnsList.length > 0 && nestingLevel === 0 || xmlnsList.length === 0) && xmlnsArray.length > 0;

    return (nestingLevel === 0 ? `<?xml version="1.0" encoding="UTF-8"?>${newline}` : '') +
        ' '.repeat(nestingLevel * tabSize) +
        `<${fullTagName}` +
        `${writeXmlnsArray ? ` ${xmlnsArray.map(writeXmlns).join(' ')}` : ''}${attributes.length > 0 ? ' ' : ''}` +
        attributes.map(attr => writeAttribute({
            ...attr,
            xmlns: attr.xmlns && {
                ...attr.xmlns,
                prefix: get(find(xmlnsArray, {ns: attr.xmlns.ns}), 'prefix')
            }
        })).join(' ') +
        (textContent.length > 0 || children.length > 0 ?
            `>${escapeText(textContent)}` +
            `${children.map(child => `${newline}${writeXML(child, xmlnsList, tabSize, newline, nestingLevel + 1)}`).join('')}` +
            (children.length > 0 ? insertNewline : identity)(`</${fullTagName}>`) :
            '/>'
        );
};

export const removeEmptyNodes = tree => {
    const children = tree.children || [];
    const attributes = tree.attributes || [];
    return {
        ...tree,
        attributes: attributes.filter(attr => !!attr),
        children: children.filter(child => !!child).map(removeEmptyNodes)
    };
};

export const objectToAttributes = (obj = {}, xmlns) => keys(obj).filter(key => obj[key] !== undefined).map(key => ({
    name: key,
    value: obj[key],
    xmlns
}));

export const assignNamespace = (nodes, xmlns) => nodes.filter(node => !!node).map(node => ({...node, xmlns}));
