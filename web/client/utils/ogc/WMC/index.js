/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Parser } from 'xml2js';
import { keys, values, omit, get, head, isString, flatten, mapValues } from 'lodash';
import uuidv1 from 'uuid/v1';

// object for default values
const defaultValues = {
    maxExtent: [
        0,
        0,
        10000,
        10000
    ],
    center: {
        x: 0,
        y: 0,
        crs: 'EPSG:900913'
    },
    projection: 'EPSG:900913',
    layerType: 'wms'
};

/**
 * Extracts params and character content of a all tags with a specified from a specific namespace
 * @param {string} xmlNameSpace xml namespace uri
 * @param {object} xmlObj xml node represented by an object
 * @param {string} tagName local tag name to extract
 */
const extractTags = (xmlNameSpace, xmlObj = {}, tagName) => {
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
const extractTag = (xmlNameSpace, xmlObj, tagName) => head(extractTags(xmlNameSpace, xmlObj, tagName));

/**
 * Extract the value of an attribute from a tag
 * @param {string} xmlNameSpace namespace uri of an attribute
 * @param {object} tagObj xml node represented by an object
 * @param {string} attrName attribute name
 */
const extractAttributeValue = (xmlNameSpace, tagObj, attrName) => values(get(tagObj, 'params', {})).reduce(
    (result, attribute) => result || attribute.local === attrName && attribute.uri === xmlNameSpace && attribute.value, null);

/**
 * Make an object out of attribute values: {[attrName]: attrValue}
 * @param {object} tagObj xml node represented by an object
 * @param {...(string|object)} attrNames an array of attribute names to extract. If an attribute name is a string then it is also used as
 * a prop name in the resulting object and it is assumed that the attribute does not belong to any namespace, otherwise attribute names
 * can be represented with an object {local, uri, paramName}, where local is an attribute name, uri is a namespace and paramName is a prop
 * name in the resulting object
 */
const pickAttributeValues = (tagObj, ...attrNames) => values(get(tagObj, 'params', {})).reduce((finalObj, param) => {
    const attrName = attrNames.reduce((result, curAttrName) => {
        const {local, uri, paramName} = isString(curAttrName) ? {local: curAttrName, paramName: curAttrName, uri: ''} : curAttrName;
        return result || local === param.local && uri === param.uri && paramName;
    }, null);
    return attrName ? {...finalObj, [attrName]: param.value} : finalObj;
}, {});

const serviceToLayerType = (service) => {
    switch (service) {
    case 'OGC:WMS': {
        return 'wms';
    }
    default:
        return defaultValues.layerType;
    }
};

const parseBoolean = (string = '') => {
    const lowered = string.toLowerCase();
    return lowered === 'true' ? true : false;
};

const removeEmptyProps = (obj) => keys(obj).filter(key => obj[key] !== undefined).reduce((result, key) => ({...result, [key]: obj[key]}), {});

/**
 * Generates MapStore map configuration object from a WMC string
 * @param {string} wmcString wmc string
 * @param {bool} generateLayersGroup when true put all layers in a group with context's title
 */
export const toMapConfig = (wmcString, generateLayersGroup = false) => {
    const parser = new Parser({
        explicitRoot: false,
        xmlns: true
    });

    return new Promise((resolve) => {
        parser.parseString(wmcString, (err, result) => {
            if (err) {
                throw new Error('General XML parsing error');
            }

            const rootNamespace = 'http://www.opengis.net/context'; // default namespace of WMC context
            const openlayersNamespace = 'http://openlayers.org/context'; // namespace of openlayers
            const xlinkNamespace = 'http://www.w3.org/1999/xlink'; // standard namespace for hyperlinks

            // extractor functions for different namespaces
            const rootTagExtractor = extractTag.bind(null, rootNamespace);
            const rootTagsExtractor = extractTags.bind(null, rootNamespace);
            const olTagExtractor = extractTag.bind(null, openlayersNamespace);
            const attrExtractor = extractAttributeValue.bind(null, '');

            const viewContext = rootTagExtractor({root: [result]}, 'ViewContext'); // the root element
            const general = rootTagExtractor(viewContext, 'General'); // General element
            const layerList = rootTagExtractor(viewContext, 'LayerList'); // LayerList element

            const contextVersion = attrExtractor(viewContext, 'version');

            // if no ViewContext found or no version information the xml is not a valid WMC
            if (!viewContext || !contextVersion) {
                throw new Error('Not a WMC file!');
            }

            const viewContextTitle = get(rootTagExtractor(general, 'Title'), 'charContent');
            const globalExtensions = rootTagExtractor(general, 'Extension');

            const maxExtentExtension = olTagExtractor(globalExtensions, 'maxExtent');
            const bbox = rootTagExtractor(general, 'BoundingBox');

            // if we have maxExtent in Extension then use that otherwise use bbox information
            const maxExtentAndSRS = mapValues(
                maxExtentExtension && pickAttributeValues(maxExtentExtension, 'minx', 'miny', 'maxx', 'maxy', 'SRS') ||
                pickAttributeValues(bbox, 'minx', 'miny', 'maxx', 'maxy', 'SRS'),
                parseFloat
            );
            const maxExtent = maxExtentAndSRS && [maxExtentAndSRS.minx, maxExtentAndSRS.miny, maxExtentAndSRS.maxx, maxExtentAndSRS.maxy] ||
                defaultValues.maxExtent;
            const projection = maxExtentAndSRS.SRS || defaultValues.projection; // from bbox or default

            const layerGroup = generateLayersGroup ? uuidv1() : undefined;

            const layers = rootTagsExtractor(layerList, 'Layer').map(layer => {
                const layerExtensions = rootTagExtractor(layer, 'Extension');
                const server = rootTagExtractor(layer, 'Server');
                const styleTag = head(rootTagsExtractor(rootTagExtractor(layer, 'StyleList'), 'Style')
                    .filter(style => attrExtractor(style, 'current') === '1'));
                const transparentValue = get(olTagExtractor(layerExtensions, 'transparent'), 'charContent');

                const olParameters = {
                    maxExtent: mapValues(
                        pickAttributeValues(olTagExtractor(layerExtensions, 'maxExtent'), 'minx', 'maxx', 'miny', 'maxy'),
                        parseFloat),
                    tileSize: mapValues(pickAttributeValues(olTagExtractor(layerExtensions, 'tileSize'), 'width', 'height'), parseInt),
                    transparent: transparentValue && parseBoolean(transparentValue)
                    // other additional openlayers parameters go here
                };

                // constructed ms layer object
                const msLayerBase = {
                    id: uuidv1(),
                    visibility: attrExtractor(layer, 'hidden') === '0' ? true : false,
                    type: serviceToLayerType(attrExtractor(server, 'service')),
                    url: extractAttributeValue(xlinkNamespace, rootTagExtractor(server, 'OnlineResource'), 'href'),
                    name: get(rootTagExtractor(layer, 'Name'), 'charContent'),
                    title: get(rootTagExtractor(layer, 'Title'), 'charContent'),
                    format: get(head(rootTagsExtractor(rootTagExtractor(layer, 'FormatList'), 'Format')
                        .filter(format => attrExtractor(format, 'current') !== '0')), 'charContent'),
                    style: get(rootTagExtractor(styleTag, 'Name'), 'charContent'),
                    bbox: olParameters.maxExtent !== {} ? {
                        bounds: olParameters.maxExtent
                    } : undefined,
                    group: layerGroup
                };

                return {...removeEmptyProps(msLayerBase), params: removeEmptyProps(msLayerBase.params)};
            });

            const groups = [...(layers.filter(layer => !layer.group || layer.group === 'Default').length > 0 ? [{
                id: 'Default',
                title: 'Default',
                expanded: true
            }] : []), ...(generateLayersGroup ? [{
                id: layerGroup,
                title: viewContextTitle || layerGroup
            }] : [])];

            const msMapConfig = {
                catalogServices: {},
                map: {
                    maxExtent,
                    center: defaultValues.center,
                    projection,
                    backgrounds: [],
                    groups,
                    layers
                },
                version: 2
            };

            resolve(msMapConfig);
        });
    });
};
