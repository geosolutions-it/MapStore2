/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('../../libs/ajax');
const { uniqBy, castArray } = require('lodash');
const { getNameParts } = require('../../utils/StyleEditorUtils');

/**
* Api for GeoServer layers via rest
* @name api.geoserver
*/
const Api = {
    getLayer: function(geoserverBaseUrl, layerName, options) {
        let url = geoserverBaseUrl + "layers/" + layerName + ".json";
        return axios.get(url, options).then((response) => {return response.data && response.data.layer; });
    },
    /**
    * Remove styles from available styles of geoserver layer object
    * @memberof api.geoserver
    * @param {object} params {baseUrl, layerName, styles = [], options = {}}
    * @param {string} params.baseUrl base url of GeoServer eg: /geoserver/
    * @param {array} params.styles array of style to remove to geoserver layer object
    * @param {string} params.layerName name of layer
    * @return {object} geoserver layer object with updated styles
    */
    removeStyles: ({baseUrl, layerName, styles = [], options = {}}) => {
        const { name, workspace } = getNameParts(layerName);
        const url = `${baseUrl}rest/${workspace && `workspaces/${workspace}/` || ''}layers/${name}.json`;
        return axios.get(url, options)
            .then(({data}) => {
                const layer = data.layer || {};
                const currentAvailableStyles = layer.styles && layer.styles.style && castArray(layer.styles.style) || [];
                const stylesNames = styles.map(({name: styleName}) => styleName);
                const filteredStyles = currentAvailableStyles.filter(({name: styleName}) => stylesNames.indexOf(styleName) === -1);
                const layerObj = {
                    'layer': {
                        ...layer,
                        'styles': {
                            '@class': 'linked-hash-set',
                            'style': filteredStyles
                        }
                    }
                };
                return layerObj;
            })
            .then(layerObj => axios.put(url, layerObj).then(() => layerObj));
    },
    /**
    * Update available styles of geoserver layer object
    * @memberof api.geoserver
    * @param {object} params {baseUrl, layerName, styles = [], options = {}}
    * @param {string} params.baseUrl base url of GeoServer eg: /geoserver/
    * @param {array} params.styles array of style to add to geoserver layer object
    * @param {string} params.layerName name of layer
    * @return {object} geoserver layer object with updated styles
    */
    updateAvailableStyles: ({baseUrl, layerName, styles = [], options = {}}) => {
        const { name, workspace } = getNameParts(layerName);
        const url = `${baseUrl}rest/${workspace && `workspaces/${workspace}/` || ''}layers/${name}.json`;
        return axios.get(url, options)
            .then(({data}) => {
                const layer = data.layer || {};
                const currentAvailableStyles = layer.styles && layer.styles.style && castArray(layer.styles.style) || [];
                const layerObj = {
                    'layer': {
                        ...layer,
                        'styles': {
                            '@class': 'linked-hash-set',
                            'style': [
                                ...currentAvailableStyles,
                                ...styles
                            ]
                        }
                    }
                };
                return layerObj;
            })
            .then(layerObj => axios.put(url, layerObj).then(() => layerObj));
    },
    /**
    * Update default styles of geoserver layer object
    * @memberof api.geoserver
    * @param {object} params {baseUrl, layerName, styleName, options = {}}
    * @param {string} params.baseUrl base url of GeoServer eg: /geoserver/
    * @param {array} params.styleName name of the new default style
    * @param {string} params.layerName name of layer
    * @return {object} geoserver layer object with updated styles
    */
    updateDefaultStyle: ({baseUrl, layerName, styleName, options = {}}) => {
        const { name, workspace } = getNameParts(layerName);
        const url = `${baseUrl}rest/${workspace && `workspaces/${workspace}/` || ''}layers/${name}.json`;
        return axios.get(url, options)
            .then(({ data }) => {
                const layer = data.layer || {};
                const currentAvailableStyles = layer.styles && layer.styles.style && castArray(layer.styles.style) || [];
                const defaultStyle = layer.defaultStyle || {};

                // add old default to available styles to ensure to display it in the style list
                const style = uniqBy([
                    defaultStyle,
                    ...currentAvailableStyles
                ], 'name');

                const layerObj = {
                    'layer': {
                        ...layer,
                        defaultStyle: {
                            name: styleName
                        },
                        'styles': {
                            '@class': 'linked-hash-set',
                            style
                        }
                    }
                };
                return layerObj;
            })
            .then(layerObj => axios.put(url, layerObj).then(() => layerObj));
    }
};
module.exports = Api;
