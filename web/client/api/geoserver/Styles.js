/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '../../libs/ajax';
import assign from 'object-assign';
import { getVersion } from './About';
import head from 'lodash/head';
import castArray from 'lodash/castArray';
import { getNameParts, stringifyNameParts } from '../../utils/StyleEditorUtils';

const STYLE_MODULES = [
    { regex: /gt-css/, format: 'css' }
];

const contentTypes = {
    css: 'application/vnd.geoserver.geocss+css',
    sld: 'application/vnd.ogc.sld+xml',
    sldse: 'application/vnd.ogc.se+xml',
    zip: 'application/zip'
};

/**
 * get correct content type based on format and version of style
 * @param {string} format
 * @param {object} languageVersion eg: { version: "1.0.0" }
 */
const getContentType = (format, languageVersion) => {
    if (format === 'sld') {
        return languageVersion && languageVersion.version && languageVersion.version === '1.1.0'
            ? contentTypes.sldse
            : contentTypes.sld;
    }
    // set content type to sld if is missed
    // to avoid 415 error with unknown content types
    return contentTypes[format] || contentTypes.sld;
};

// TODO: separate options and URL generation, here this duplication uses `isNameParam` to get the same options for styles.json or styles/<styleName>.json, that is tricky
const formatRequestData = ({options = {}, format, baseUrl, name, workspace, languageVersion}, isNameParam) => {
    const paramName = isNameParam ? { name: encodeURIComponent(name) } : {};
    const opts = {
        ...options,
        params: {
            ...options.params,
            ...paramName
        },
        headers: {
            ...(options.headers || {}),
            'Content-Type': getContentType(format, languageVersion)
        }
    };
    const url = `${baseUrl}rest/${workspace && `workspaces/${workspace}/` || ''}styles${!isNameParam ? `/${encodeURIComponent(name)}` : '.json'}`;
    return {
        options: opts,
        url
    };
};

export const getStyleBaseUrl = ({geoserverBaseUrl, workspace, name, format = "json"}) => `${geoserverBaseUrl}rest/${workspace && `workspaces/${workspace}/` || ''}styles/${ `${encodeURIComponent(name)}.${format}`}`;

/**
 * Parses the name of the file and extracts extension to guess style format.
 * TODO: we should use a better approch
 * @param {string} filename style.sld or style.css
 */
const getStyleFormatFromFilename = (filename) => {
    return filename.split('.').pop();
};

const parseStyleMetadata = (metadata = {}) => {
    const entries = castArray(metadata?.entry || []);
    return entries.reduce((acc, entry) => ({
        ...acc,
        [entry['@key']]: entry.$
    }), {});
};

const updateStyleMetadata = ({ baseUrl: geoserverBaseUrl, styleName, metadata }) => {
    const styleUrl = getStyleBaseUrl({...getNameParts(styleName), geoserverBaseUrl});
    // get the all the correct style to ensure previous properties does not override with default ones
    // in particular the format
    return axios.get(styleUrl)
        .then(({ data = {} } = {}) => {
            return axios.put(styleUrl, {
                style: {
                    ...data.style,
                    metadata: {
                        ...parseStyleMetadata(data.style?.metadata),
                        ...metadata
                    }
                }
            });
        });
};

/**
* Api for GeoServer styles via rest
* @name api.geoserver
*/
const Api = {
    saveStyle: function(geoserverBaseUrl, styleName, body, options) {
        let url = geoserverBaseUrl + "styles/" + encodeURI(styleName);
        let opts = assign({}, options);
        opts.headers = assign({}, opts.headers, {"Content-Type": "application/vnd.ogc.sld+xml"});
        return axios.put(url, body, opts);
    },
    /**
    * Get style service configuration based on url
    * @memberof api.geoserver
    * @param {object} params {baseUrl, style, options, format, styleName}
    * @param {string} params.baseUrl base url of GeoServer eg: /geoserver/
    * @return {promise} it returns a valid styleService object or null
    */
    getStyleService: function({ baseUrl }) {
        return getVersion({ baseUrl })
            .then(({ version, manifest, fonts = [] }) => {
                if (!version) return null;
                const formats = (manifest || [])
                    .map(({ name }) =>
                        head(STYLE_MODULES
                            .filter(({ regex }) => name.match(regex))
                            .map(({ format }) => format))
                    ).filter(format => format);
                const geoserver = head(version.filter(({ name = ''}) => name.toLowerCase() === 'geoserver')) || {};
                return {
                    baseUrl,
                    version: geoserver.version,
                    formats: [...formats, 'sld'],
                    availableUrls: [],
                    fonts
                };
            });
    },
    /**
    * Get style object
    * @memberof api.geoserver
    * @param {object} params {options, format, baseUrl, styleName}
    * @param {string} params.baseUrl base url of GeoServer eg: /geoserver/
    * @param {string} params.format style format eg: css or sld
    * @param {string} params.styleName style name
    * @return {object} GeoServer style object
    */
    getStyle: ({options, format, baseUrl, styleName}) => {
        const {name, workspace} = getNameParts(styleName);
        const data = formatRequestData({options, format, baseUrl, name, workspace});
        return axios.get(data.url, data.options);
    },

    /**
    * Create a new style
    * @memberof api.geoserver
    * @param {object} params {baseUrl, style, options, format, styleName}
    * @param {string} params.baseUrl base url of GeoServer eg: /geoserver/
    * @param {string} params.format style format eg: css or sld
    * @param {string} params.styleName style name
    * @param {string} params.code style code
    * @return {object} response
    */
    createStyle: ({baseUrl, code, options, format = 'sld', styleName, languageVersion, metadata }) => {
        const {name, workspace} = getNameParts(styleName);
        const data = formatRequestData({options, format, baseUrl, name, workspace, languageVersion}, true);
        return axios.post(data.url, code, data.options)
            .then(() => {
                return metadata
                    ? updateStyleMetadata({ baseUrl, styleName, metadata })
                        .then(() => null)
                        // silent fail for missing update on metadata
                        .catch(() => null)
                    : null;
            });
    },
    /**
    * Update a style
    * @memberof api.geoserver
    * @param {object} params {baseUrl, style, options, format, styleName}
    * @param {string} params.baseUrl base url of GeoServer eg: /geoserver/
    * @param {string} params.format style format eg: css or sld
    * @param {string} params.styleName style name
    * @param {string} params.code style code
    * @return {object} response
    */
    updateStyle: ({baseUrl, code, options, format = 'sld', styleName, languageVersion, metadata}) => {
        const {name, workspace} = getNameParts(styleName);
        const data = formatRequestData({options, format, baseUrl, name, workspace, languageVersion});
        return axios.put(data.url, code, data.options)
            .then(() => {
                return metadata
                    ? updateStyleMetadata({ baseUrl, styleName, metadata })
                        .then(() => null)
                        // silent fail for missing update on metadata
                        .catch(() => null)
                    : null;
            });
    },
    /**
    * Delete a style
    * @memberof api.geoserver
    * @param {object} params {baseUrl, options, format, styleName}
    * @param {string} params.baseUrl base url of GeoServer eg: /geoserver/
    * @param {string} params.styleName style name
    * @return {object} response
    */
    deleteStyle: ({baseUrl, options, format = 'sld', styleName}) => {
        const {name, workspace} = getNameParts(styleName);
        const data = formatRequestData({options, format, baseUrl, name, workspace});
        return axios.delete(data.url, data.options);
    },
    /**
    * Retrive style info an merge them to the provided list of styles
    * @memberof api.geoserver
    * @param {object} params {baseUrl, styles}
    * @param {string} params.baseUrl base url of GeoServer eg: /geoserver/
    * @param {string} params.styles list of styles eg: [ { name: 'style.css', title: 'Style', _abstract: '' } ]
    * @return {array} array of style provided with additional info as format, filename and languageVersion
    */
    getStylesInfo: ({baseUrl: geoserverBaseUrl, styles = []}) => {
        let responses = [];
        let count = styles.length;
        return new Promise(function(resolve) {
            if (!styles || styles.length === 0) {
                resolve([]);
            } else {
                styles.forEach(({name}, idx) =>
                    axios.get(getStyleBaseUrl({...getNameParts(name), geoserverBaseUrl}))
                        .then(({data}) => {
                            responses[idx] = assign({}, styles[idx], data && data.style && {
                                ...data.style,
                                ...(data.style.metadata && { metadata: parseStyleMetadata(data.style.metadata) }),
                                name: stringifyNameParts(data.style)
                            } || {});
                            count--;
                            if (count === 0) resolve(responses.filter(val => val));
                        })
                        .catch(() => {
                            responses[idx] = assign({}, styles[idx]);
                            count--;
                            if (count === 0) resolve(responses.filter(val => val));
                        })
                );
            }
        });
    },
    /**
    * Get style code
    * @memberof api.geoserver
    * @param {object} params {baseUrl, styleName, workspace}
    * @param {string} params.baseUrl base url of GeoServer eg: /geoserver/
    * @param {string} params.styleName style name
    * @return {object} GeoServer style object with code params eg: {...otherStyleParams, code: '* { stroke: #ff0000; }'}
    */
    getStyleCodeByName: ({baseUrl: geoserverBaseUrl, styleName, options}) => {
        const {name, workspace} = getNameParts(styleName);
        const url = getStyleBaseUrl({name, workspace, geoserverBaseUrl});
        return axios.get(url, options)
            .then(response => {
                return response.data && response.data.style && response.data.style.name ?
                    axios.get(getStyleBaseUrl({ workspace, geoserverBaseUrl, name: response.data.style.name, format: getStyleFormatFromFilename(response.data.style.filename) })).then(({data: code}) => ({...response.data.style, code}))
                    : null;
            });
    },
    /**
     * Update style metadata
     * @param {string} baseUrl service endpoint
     * @param {string} styleName name of style
     * @param {object} metadata object with metadata properties
     */
    updateStyleMetadata
};

export default Api;
