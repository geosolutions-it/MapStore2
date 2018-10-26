/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const { head, get, isArray } = require('lodash');
const uuidv1 = require('uuid/v1');
const url = require('url');
const { baseTemplates, customTemplates } = require('./styleeditor/stylesTemplates');

const STYLE_ID_SEPARATOR = '___';
const STYLE_OWNER_NAME = 'styleeditor';

const StyleEditorCustomUtils = {};

const EDITOR_MODES = {
    css: 'geocss',
    sld: 'xml'
};

const getGeometryType = (geomProperty = {}) => {
    const localPart = geomProperty.type && geomProperty.type.localPart && geomProperty.type.localPart.toLowerCase() || '';
    if (localPart.indexOf('polygon') !== -1
        || localPart.indexOf('surface') !== -1) {
        return 'polygon';
    } else if (localPart.indexOf('linestring') !== -1) {
        return 'linestring';
    } else if (localPart.indexOf('point') !== -1) {
        return 'point';
    }
    return 'vector';
};

/**
 * Utility functions for Share tools.
 * @memberof utils
 */
const StyleEditorUtils = {
    STYLE_OWNER_NAME,
    STYLE_ID_SEPARATOR,
    /**
     * generate a temporary id for style
     * @return {string} id
     */
    generateTemporaryStyleId: () => `${uuidv1()}_ms_${Date.now().toString()}`,
    /**
     * generate a style id with title included
     * @param  {object} properties eg: {title: 'My Title'}
     * @return {string} id
     */
    generateStyleId: ({title = ''}) => `${title.toLowerCase().replace(/\s/g, '_')}${STYLE_ID_SEPARATOR}${uuidv1()}`,
    /**
     * extract feature properties from a layer object
     * @param  {object} layer layer object
     * @return {object} {geometryType, properties, owsType}
     */
    extractFeatureProperties: ({describeLayer = {}, describeFeatureType = {}} = {}) => {

        const owsType = describeLayer && describeLayer.owsType || null;
        const descProperties = get(describeFeatureType, 'complexType[0].complexContent.extension.sequence.element') || null;
        const geomProperty = descProperties && head(descProperties.filter(({ type }) => type && type.prefix === 'gml'));
        const geometryType = owsType === 'WCS' && 'raster' || geomProperty && owsType === 'WFS' && getGeometryType(geomProperty) || null;
        const properties = descProperties && descProperties.reduce((props, { name, type = {} }) => ({
            ...props,
            [name]: {
                localPart: type.localPart,
                prefix: type.prefix
            }
        }), {});
        return {
            geometryType,
            properties,
            owsType
        };
    },
    /**
     * convert style format to codemirror mode
     * @param  {string} format style format css or sld
     * @return {string} mode name for codemirror or format string
     */
    getEditorMode: format => EDITOR_MODES[format] || format,
    /**
     * verify if layer url is valid for style editor service
     * @param  {object} layer layer object
     * @param  {object} service style service object
     * @return {bool}
     */
    isSameOrigin: (layer = {}, service = {}) => {
        if (StyleEditorCustomUtils.isSameOrigin) return StyleEditorCustomUtils.isSameOrigin(layer, service);
        if (!service.baseUrl || !layer.url) return false;
        const availableUrls = [service.baseUrl, ...(service.availableUrls || [])];
        const parsedAvailableUrls = availableUrls.map(availableUrl => {
            const urlObj = url.parse(availableUrl);
            return `${urlObj.protocol}//${urlObj.host}`;
        });
        const layerObj = url.parse(layer.url);
        const layerUrl = `${layerObj.protocol}//${layerObj.host}`;
        return parsedAvailableUrls.indexOf(layerUrl) !== -1;
    },
    /**
     * return a ist of style templates
     * Can be overrided with setCustomUtils, must return an array of templates
     * @return {array} list of templates
     */
    getStyleTemplates: () => {
        if (StyleEditorCustomUtils.getStyleTemplates) {
            const generatedTemplates = StyleEditorCustomUtils.getStyleTemplates();
            return [...(isArray(generatedTemplates) ? generatedTemplates : [] ), ...baseTemplates];
        }
        return [...customTemplates, ...baseTemplates];
    },
    /**
     * Override function in StyleEditorUtils (only isSameOrigin, getStyleTemplates)
     * @param  {string} name function name
     * @param  {function} fun function to override
     */
    setCustomUtils: (name, fun) => {
        StyleEditorCustomUtils[name] = fun;
    }
};

module.exports = StyleEditorUtils;
