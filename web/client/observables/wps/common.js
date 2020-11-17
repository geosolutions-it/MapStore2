/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import url from 'url';
import { endsWith } from 'lodash';

export const processParameter = (identifier, dataXML) =>
    `<wps:Input>` +
    `<wps:Identifier>${identifier}</wps:Identifier>` +
    dataXML +
    `</wps:Input>`;

export const processData = (data) => `<wps:Data>${data}</wps:Data>`;
export const processReference = (mimeType, href, method, requestBody) =>
    `<wps:Reference mimeType="${mimeType}" xlink:href="${href}" method="${method}"${method === 'POST' ? '' : '/'}>` +
    (method === 'POST' ? `<wps:Body>${requestBody}</wps:Body></wps:Reference>` : '');
export const literalData = (literal) => `<wps:LiteralData>${literal}</wps:LiteralData>`;
export const complexData = (data, mimeType, encoding) => `<wps:ComplexData${mimeType ? ` mimeType="${mimeType}"` : ''}${encoding ? ` encoding="${encoding}"` : ''}>${data}</wps:ComplexData>`;
export const cdata = (data) => `<![CDATA[${data}]]>`;

export const responseForm = (responseFormContents) => `<wps:ResponseForm>${responseFormContents}</wps:ResponseForm>`;
export const rawDataOutput = (identifier, mimeType) =>
    `<wps:RawDataOutput${mimeType ? ` mimeType="${mimeType}"` : ''}>` +
    `<ows:Identifier>${identifier}</ows:Identifier>` +
    `</wps:RawDataOutput>`;
export const responseDocument = (storeExecuteResponse, status, documentDataXML) =>
    `<wps:ResponseDocument${storeExecuteResponse ? ` storeExecuteResponse="true"` : ''}${status ? ` status="true"` : ''}>` +
    documentDataXML +
    `</wps:ResponseDocument>`;
export const processOutput = (mimeType, asReference, identifier, title, abstract) =>
    `<wps:Output${mimeType ? ` mimeType="${mimeType}"` : ''}${asReference ? ` asReference="true"` : ''}>` +
    `<ows:Identifier>${identifier}</ows:Identifier>` +
    (title ? `<ows:Title>${title}</ows:Title>` : '') +
    (abstract ? `<ows:Abstract>${abstract}</ows:Abstract>` : '') +
    `</wps:Output>`;

export const writingParametersData = (paramsXML) => processParameter('writeParameters', processData(complexData(`<dwn:Parameters>${paramsXML}</dwn:Parameters>`)));
export const downloadParameter = (key, value) => `<dwn:Parameter key="${key}">${value}</dwn:Parameter>`;


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
