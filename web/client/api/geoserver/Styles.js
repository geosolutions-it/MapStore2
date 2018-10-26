/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('../../libs/ajax');
const assign = require('object-assign');

const contentTypes = {
    css: 'application/vnd.geoserver.geocss+css',
    sld: 'application/vnd.ogc.sld+xml',
    // sldse: 'application/vnd.ogc.se+xml',
    zip: 'application/zip'
};

const formatRequestData = ({options = {}, format, baseUrl, styleName, name, workspace}) => {
    const paramName = name ? {name: encodeURIComponent(name)} : {};
    const opts = {
        ...options,
        params: {
            ...options.params,
            ...paramName
        },
        headers: {
            ...(options.headers || {}),
            'Content-Type': contentTypes[format]
        }
    };
    const url = `${baseUrl}rest/styles${workspace && workspace + '/' || ''}${styleName ? '/' + encodeURIComponent(styleName) : ''}`;
    return {
        options: opts,
        url
    };
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
    * Get style object
    * @memberof api.geoserver
    * @param {object} params {options, format, baseUrl, styleName, workspace}
    * @param {string} params.baseUrl base url of GeoServer eg: /geoserver/
    * @param {string} params.format style format eg: css or sld
    * @param {string} params.styleName style name
    * @return {object} GeoServer style object
    */
    getStyle: ({options, format, baseUrl, styleName, workspace}) => {
        const data = formatRequestData({options, format, baseUrl, styleName, workspace});
        return axios.get(data.url, data.options);
    },
    /**
    * Create a new style
    * @memberof api.geoserver
    * @param {object} params {baseUrl, style, options, format, styleName, workspace}
    * @param {string} params.baseUrl base url of GeoServer eg: /geoserver/
    * @param {string} params.format style format eg: css or sld
    * @param {string} params.styleName style name
    * @param {string} params.code style code
    * @return {object} response
    */
    createStyle: ({baseUrl, code, options, format = 'sld', styleName, workspace}) => {
        const data = formatRequestData({options, format, baseUrl, name: styleName, workspace});
        return axios.post(data.url, code, data.options);
    },
    /**
    * Update a style
    * @memberof api.geoserver
    * @param {object} params {baseUrl, style, options, format, styleName, workspace}
    * @param {string} params.baseUrl base url of GeoServer eg: /geoserver/
    * @param {string} params.format style format eg: css or sld
    * @param {string} params.styleName style name
    * @param {string} params.code style code
    * @return {object} response
    */
    updateStyle: ({baseUrl, code, options, format = 'sld', styleName, workspace}) => {
        const data = formatRequestData({options, format, baseUrl, styleName, workspace});
        return axios.put(data.url, code, data.options);
    },
    /**
    * Delete a style
    * @memberof api.geoserver
    * @param {object} params {baseUrl, options, format, styleName, workspace}
    * @param {string} params.baseUrl base url of GeoServer eg: /geoserver/
    * @param {string} params.styleName style name
    * @return {object} response
    */
    deleteStyle: ({baseUrl, options, format = 'sld', styleName, workspace}) => {
        const data = formatRequestData({options, format, baseUrl, styleName, workspace});
        return axios.delete(data.url, data.options);
    },
    /**
    * Retrive style info an merge them to the provided list of styles
    * @memberof api.geoserver
    * @param {object} params {baseUrl, styles, workspace}
    * @param {string} params.baseUrl base url of GeoServer eg: /geoserver/
    * @param {string} params.styles list of styles eg: [ { name: 'style.css', title: 'Style', _abstract: '' } ]
    * @return {array} array of style provided with additional info as format, filename and languageVersion
    */
    getStylesInfo: ({baseUrl: geoserverBaseUrl, styles = [], workspace}) => {
        const baseUrl = `${geoserverBaseUrl}rest/styles/${workspace && workspace + '/' || ''}`;
        let responses = [];
        let count = styles.length;
        return new Promise(function(resolve) {
            if (!styles || styles.length === 0) return resolve([]);
            styles.forEach(({name}, idx) =>
                axios.get(`${baseUrl}${encodeURIComponent(name)}.json`)
                    .then(({data}) => {
                        responses[idx] = assign({}, styles[idx], data && data.style || {});
                        count--;
                        if (count === 0) resolve(responses.filter(val => val));
                    })
                    .catch(() => {
                        responses[idx] = assign({}, styles[idx]);
                        count--;
                        if (count === 0) resolve(responses.filter(val => val));
                    })
            );
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
        const baseUrl = `${geoserverBaseUrl}rest/styles/`;
        const url = `${baseUrl}${encodeURIComponent(styleName)}.json`;
        return axios.get(url, options)
            .then(response => {
                return response.data && response.data.style && response.data.style.filename ?
                    axios.get(`${baseUrl}${encodeURIComponent(response.data.style.filename)}`).then(({data: code}) => ({...response.data.style, code}))
                    : null;
            });
    }
};

module.exports = Api;
