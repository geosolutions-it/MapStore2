/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const TEXT_PLAIN_MIME_TYPE = 'text/plain';
export const TEXT_HTML_MIME_TYPE = 'text/html';
export const JSONP_MIME_TYPE = 'text/javascript';
export const JSON_MIME_TYPE = 'application/json';
export const GEOJSON_MIME_TYPE = 'application/geo+json';
export const GML2_MIME_TYPE = 'application/vnd.ogc.gml';
export const GML3_MIME_TYPE = 'application/vnd.ogc.gml/3.1.1';

export const INFO_FORMATS = {
    "TEXT": TEXT_PLAIN_MIME_TYPE,
    "HTML": TEXT_HTML_MIME_TYPE,
    "JSONP": JSONP_MIME_TYPE,
    "JSON": JSON_MIME_TYPE,
    "GEOJSON": GEOJSON_MIME_TYPE,
    "GML2": GML2_MIME_TYPE,
    "GML3": GML3_MIME_TYPE
};

export const INFO_FORMATS_BY_MIME_TYPE = {
    [TEXT_PLAIN_MIME_TYPE]: "TEXT",
    [TEXT_HTML_MIME_TYPE]: "HTML",
    [JSONP_MIME_TYPE]: "JSONP",
    [JSON_MIME_TYPE]: "JSON",
    [GEOJSON_MIME_TYPE]: "GEOJSON",
    [GML2_MIME_TYPE]: "GML2",
    [GML3_MIME_TYPE]: "GML3"
};

const regexpXML = /^[\s\S]*<gml:featureMembers[^>]*>([\s\S]*)<\/gml:featureMembers>[\s\S]*$/i;

const regexpBody = /^[\s\S]*<body[^>]*>([\s\S]*)<\/body>[\s\S]*$/i;
const regexpStyle = /(<style[\s\=\w\/\"]*>[^<]*<\/style>)/i;

export function parseHTMLResponse(res) {
    if ( typeof res.response === "string") {
        let match = res.response.match(regexpBody);
        if ( res.layerMetadata && res.layerMetadata.regex ) {
            return match && match[1] && match[1].match(res.layerMetadata.regex);
        }
        return match && match[1] && match[1].trim().length > 0;
    }
    return false;
}

export function parseXMLResponse(res) {
    if ( typeof res.response === "string" && res.response.indexOf("<?xml") !== -1 ) {
        let match = res.response.match(regexpXML);
        return match && match[1] && match[1].trim().length > 0;
    }
    return false;
}

export const Validator = {
    HTML: {
        /**
         *Parse the HTML to get only the valid html responses
         */
        getValidResponses(responses) {
            return responses.filter(parseHTMLResponse);
        },
        /**
         * Parse the HTML to get only the NOT valid html responses
         */
        getNoValidResponses(responses) {
            return responses.filter((res) => {return !parseHTMLResponse(res); });
        }
    },
    TEXT: {
        /**
         *Parse the TEXT to get only the valid text responses
         */
        getValidResponses(responses) {
            return responses.filter((res) => res.response !== "" && (typeof res.response === "string" && res.response.indexOf("no features were found") !== 0) && (typeof res.response === "string" && res.response.indexOf("<?xml") !== 0));
        },
        /**
         * Parse the TEXT to get only the NOT valid text responses
         */
        getNoValidResponses(responses) {
            return responses.filter((res) => res.response === "" || typeof res.response === "string" && res.response.indexOf("no features were found") === 0 || res.response && (typeof res.response === "string" && res.response.indexOf("<?xml") === 0));
        }
    },
    JSON: {
        /**
         *Parse the JSON to get only the valid json responses
         */
        getValidResponses(responses) {
            return responses.filter((res) => res.response && res.response.features && res.response.features.length);
        },
        /**
         * Parse the JSON to get only the NOT valid json responses
         */
        getNoValidResponses(responses) {
            return responses.filter((res) => res.response && res.response.features && res.response.features.length === 0);
        }
    },
    GEOJSON: {
        /**
         *Parse the GEOJSON to get only the valid json responses
         */
        getValidResponses(responses) {
            return responses.filter((res) => res.response && res.response.features && res.response.features.length);
        },
        /**
         * Parse the GEOJSON to get only the NOT valid json responses
         */
        getNoValidResponses(responses) {
            return responses.filter((res) => res.response && res.response.features && res.response.features.length === 0);
        }
    },
    GML3: {
        /**
         *Parse the HTML to get only the valid html responses
         */
        getValidResponses(responses) {
            return responses.filter(parseXMLResponse);
        },
        /**
         * Parse the HTML to get only the NOT valid html responses
         */
        getNoValidResponses(responses) {
            return responses.filter((res) => {return !parseXMLResponse(res); });
        }
    }
};
export const Parser = {
    HTML: {
        getBody(html) {
            return html.replace(regexpBody, '$1').trim();
        },
        getStyle(html) {
            // gets css rules from the response and removes which are related to body tag.
            let styleMatch = regexpStyle.exec(html);
            let style = styleMatch && styleMatch.length === 2 ? regexpStyle.exec(html)[1] : "";
            style = style.replace(/body[,]+/g, '');
            return style;
        },
        getBodyWithStyle(html) {
            return Parser.HTML.getStyle(html) + Parser.HTML.getBody(html);
        }
    }
};
