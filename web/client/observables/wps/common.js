/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import url from 'url';
import { endsWith } from 'lodash';

/**
 * Common WPS routines and XML combinators
 * @name observables.wps.common
 */

/**
 * Process input combinator
 * @memberof observables.wps.common
 * @param {string} identifier input identifier
 * @param {string} dataXML data XML contents
 * @returns {string}
 */
export const processParameter = (identifier, dataXML) =>
    `<wps:Input>` +
    `<ows:Identifier>${identifier}</ows:Identifier>` +
    dataXML +
    `</wps:Input>`;

/**
 * Wrap XML in wps:Data
 * @memberof observables.wps.common
 * @param {data} data xml to wrap
 */
export const processData = (data) => `<wps:Data>${data}</wps:Data>`;
/**
 * Generate wps:Reference
 * @memberof observables.wps.common
 * @param {string} mimeType  mimeType attribute
 * @param {string} href href attribute
 * @param {string} method method attribute
 * @param {string} requestBody wps:Body contents
 * @returns {string}
 */
export const processReference = (mimeType, href, method, requestBody) =>
    `<wps:Reference mimeType="${mimeType}" xlink:href="${href}" method="${method}"${method === 'POST' ? '' : '/'}>` +
    (method === 'POST' ? `<wps:Body>${requestBody}</wps:Body></wps:Reference>` : '');
/**
 * Wrap XML in wps:LiteralData
 * @memberof observables.wps.common
 * @param {string} literal LiteralData contents
 * @returns {string}
 */
export const literalData = (literal) => `<wps:LiteralData>${literal}</wps:LiteralData>`;
/**
 * Wrap XML in wps:ComplexData
 * @memberof observables.wps.common
 * @param {string} data xml to wrap
 * @param {string} [mimeType] mimeType attribute
 * @param {string} [encoding] encoding attribute
 * @returns {string}
 */
export const complexData = (data, mimeType, encoding) => `<wps:ComplexData${mimeType ? ` mimeType="${mimeType}"` : ''}${encoding ? ` encoding="${encoding}"` : ''}>${data}</wps:ComplexData>`;
/**
 * Wrap data in CDATA
 * @memberof observables.wps.common
 * @param {string} data data to wrap
 * @returns {string}
 */
export const cdata = (data) => `<![CDATA[${data}]]>`;

/**
 * Wrap XML in wps:ResponseForm
 * @memberof observables.wps.common
 * @param {string} responseFormContents xml to wrap
 * @returns {string}
 */
export const responseForm = (responseFormContents) => `<wps:ResponseForm>${responseFormContents}</wps:ResponseForm>`;
/**
 * Make wps:RawDataOutput
 * @memberof observables.wps.common
 * @param {string} identifier output identifier
 * @param {string} [mimeType] mimeType attribute
 * @returns {string}
 */
export const rawDataOutput = (identifier, mimeType) =>
    `<wps:RawDataOutput${mimeType ? ` mimeType="${mimeType}"` : ''}>` +
    `<ows:Identifier>${identifier}</ows:Identifier>` +
    `</wps:RawDataOutput>`;
/**
 * Make wps:ResponseDocument with specified document data XML
 * @memberof observables.wps.common
 * @param {boolean} storeExecuteResponse storeExecuteResponse attribute
 * @param {boolean} status status attribute
 * @param {string} documentDataXML documentData xml
 * @returns {string}
 */
export const responseDocument = (storeExecuteResponse, status, documentDataXML) =>
    `<wps:ResponseDocument${storeExecuteResponse ? ` storeExecuteResponse="true"` : ''}${status ? ` status="true"` : ''}>` +
    documentDataXML +
    `</wps:ResponseDocument>`;
/**
 * Make wps:Output tag
 * @memberof observables.wps.common
 * @param {string} mimeType mimeType attribute
 * @param {boolean} asReference asReference attribute
 * @param {string} identifier output identifier
 * @param {string} title output title field
 * @param {string} abstract output abstract field
 * @returns {string}
 */
export const processOutput = (mimeType, asReference, identifier, title, abstract) =>
    `<wps:Output${mimeType ? ` mimeType="${mimeType}"` : ''}${asReference ? ` asReference="true"` : ''}>` +
    `<ows:Identifier>${identifier}</ows:Identifier>` +
    (title ? `<ows:Title>${title}</ows:Title>` : '') +
    (abstract ? `<ows:Abstract>${abstract}</ows:Abstract>` : '') +
    `</wps:Output>`;

/**
 * Construct writeParameters input with provided XML of individual parameters
 * @memberof observables.wps.common
 * @param {string} paramsXML xml containing dwn:Parameter tags
 * @returns {string}
 */
export const writingParametersData = (paramsXML) => processParameter('writeParameters', processData(complexData(`<dwn:Parameters>${paramsXML}</dwn:Parameters>`)));
/**
 * Make dwn:Parameter tag
 * @memberof observables.wps.common
 * @param {string} key key attribute
 * @param {string} value dwn:Parameter contents
 * @returns {string}
 */
export const downloadParameter = (key, value) => `<dwn:Parameter key="${key}">${value}</dwn:Parameter>`;

/**
 * Construct url request for WPS from generic server url
 * @memberof observables.wps.common
 * @param {string} urlToParse url to use
 * @param {object} options object of query options to add to the final url
 * @returns {string}
 */
export const getWPSURL = (urlToParse, options) => {
    if (urlToParse) {
        const parsed = url.parse(urlToParse, true);
        let newPathname = parsed.pathname;
        if (endsWith(parsed.pathname, "wfs") || endsWith(parsed.pathname, "wms")) {
            newPathname = parsed.pathname.replace(/(wms|ows|wfs|wps)$/, "wps");
        }
        return url.format({
            ...parsed,
            search: null,
            pathname: newPathname,
            query: {
                service: "WPS",
                ...options,
                ...parsed.query
            }
        });

    }
    return urlToParse;
};
