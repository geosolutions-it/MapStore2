/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Parser } from 'xml2js';
import { keys, values, get, head, mapValues, uniqWith, findIndex, pick, has, toPairs } from 'lodash';
import uuidv1 from 'uuid/v1';

import {
    extractTag,
    extractTags,
    extractAttributeValue,
    pickAttributeValues,
    writeXML,
    removeEmptyNodes,
    objectToAttributes,
    assignNamespace
} from '../../XMLUtils';
import {getLayerUrl} from '../../LayersUtils';

import { reprojectBbox } from '../../CoordinatesUtils';

// object for default values
const defaultValues = {
    maxExtent: [
        0,
        0,
        10000,
        10000
    ],
    projection: 'EPSG:900913',
    layerType: 'wms'
};

const namespaces = {
    root: {
        ns: 'http://www.opengis.net/context'
    },
    xsi: {
        ns: 'http://www.w3.org/2001/XMLSchema-instance',
        prefix: 'xsi'
    },
    xlink: {
        ns: 'http://www.w3.org/1999/xlink',
        prefix: 'xlink'
    },
    ol: {
        ns: 'http://openlayers.org/context',
        prefix: 'ol'
    },
    ms: {
        ns: 'http://geo-solutions.it/mapstore/context',
        prefix: 'ms'
    }
};

const emptyBackground = {
    group: 'background',
    id: 'empty_background',
    source: 'ol',
    title: 'Empty Background',
    type: 'empty',
    visibility: true
};

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
    return lowered === 'true' || lowered === '1' ? true : false;
};

const removeEmptyProps = (obj) => keys(obj).filter(key => obj[key] !== undefined).reduce((result, key) => ({...result, [key]: obj[key]}), {});

const isValidMaxExtentObject = (obj) => !!(obj && obj.minx && obj.miny && obj.maxx && obj.maxy);
const isValidBboxObject = (obj) => !!(obj && isValidMaxExtentObject(obj.bounds) && obj.crs);

/**
 * Generates MapStore map configuration object from a WMC string.
 * List of WMC features to consider:
 * * FormatList and StyleList are lists of all possible formats and styles. Also styles can be in SLD(Style Layer Descriptor)
 * which is represented in a wmc file by a link to an SLD document.
 * * Styles can have legendURL that points to the location of a map legend describing current style
 * (extracted from Capabilities by context document creator). This element is optional.
 * * WMC can have sld:MinScaleDenominator and sld:MaxScaleDenominator that define min/max scale at which the particular layer should be visible.
 * * Layers can also have DataURL and MetadataURL that point to data or descriptive metadata respectively, corresponding to the layer.
 * Both are optional
 * @param {string} wmcString wmc string
 * @param {bool} generateLayersGroup when true put all layers in a group with context's title, unless wmc context contains GroupList mapstore
 * extension, in which case groups defined in GroupList are used
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

            // extractor functions for different namespaces
            const rootTagExtractor = extractTag.bind(null, namespaces.root.ns);
            const rootTagsExtractor = extractTags.bind(null, namespaces.root.ns);
            const olTagExtractor = extractTag.bind(null, namespaces.ol.ns);
            const msTagExtractor = extractTag.bind(null, namespaces.ms.ns);
            const msTagsExtractor = extractTags.bind(null, namespaces.ms.ns);
            const attrExtractor = extractAttributeValue.bind(null, '');
            const xlinkExtractor = extractAttributeValue.bind(null, namespaces.xlink.ns);

            const parseAttribute = attribute => {
                const {name, type} = pickAttributeValues(attribute, 'name', 'type');
                let value;

                switch (type) {
                case 'number':
                    value = parseFloat(attribute.charContent);
                    break;
                case 'object':
                    value = JSON.parse(attribute.charContent);
                    break;
                case 'boolean':
                    value = parseBoolean(attribute.charContent);
                    break;
                default:
                    value = attribute.charContent;
                }

                return {
                    name,
                    type,
                    value
                };
            };

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
            const bboxTag = rootTagExtractor(general, 'BoundingBox');

            // if we have maxExtent in Extension then use that otherwise use bbox information
            const maxExtentObj = mapValues(
                maxExtentExtension && pickAttributeValues(maxExtentExtension, 'minx', 'miny', 'maxx', 'maxy') ||
                pickAttributeValues(bboxTag, 'minx', 'miny', 'maxx', 'maxy'),
                parseFloat
            );
            const maxExtent = isValidMaxExtentObject(maxExtentObj) &&
                [maxExtentObj.minx, maxExtentObj.miny, maxExtentObj.maxx, maxExtentObj.maxy] ||
                defaultValues.maxExtent;
            const projection = attrExtractor(bboxTag, 'SRS') || defaultValues.projection; // from bbox or default

            // extract bbox
            const bboxObj = {
                bounds: mapValues(
                    pickAttributeValues(bboxTag, 'minx', 'miny', 'maxx', 'maxy'),
                    parseFloat
                ),
                crs: attrExtractor(bboxTag, 'SRS')
            };
            const bbox = isValidBboxObject(bboxObj) ? bboxObj : undefined;

            const layerGroup = generateLayersGroup ? uuidv1() : undefined;

            const msLayers = rootTagsExtractor(layerList, 'Layer').map(layer => {
                const layerExtensions = rootTagExtractor(layer, 'Extension');
                const server = rootTagExtractor(layer, 'Server');
                const styleTag = head(rootTagsExtractor(rootTagExtractor(layer, 'StyleList'), 'Style')
                    .filter(style => parseBoolean(attrExtractor(style, 'current'))));

                const transparentValue = get(olTagExtractor(layerExtensions, 'transparent'), 'charContent');
                const opacityValue = get(olTagExtractor(layerExtensions, 'opacity'), 'charContent');
                const olParameters = {
                    maxExtent: mapValues(
                        pickAttributeValues(olTagExtractor(layerExtensions, 'maxExtent'), 'minx', 'maxx', 'miny', 'maxy'),
                        parseFloat),
                    tileSize: mapValues(pickAttributeValues(olTagExtractor(layerExtensions, 'tileSize'), 'width', 'height'), parseInt),
                    transparent: transparentValue && parseBoolean(transparentValue),
                    isBaseLayer: parseBoolean(get(olTagExtractor(layerExtensions, 'isBaseLayer'), 'charContent')),
                    singleTile: parseBoolean(get(olTagExtractor(layerExtensions, 'singleTile'), 'charContent')),
                    opacity: opacityValue && parseFloat(opacityValue)
                    // other additional openlayers parameters go here
                };

                const searchTag = msTagExtractor(layerExtensions, 'search');
                const dimensions = msTagsExtractor(msTagExtractor(layerExtensions, 'DimensionList'), 'Dimension');
                const filterJSON = get(msTagExtractor(layerExtensions, 'filter'), 'charContent');
                const msParameters = {
                    group: get(msTagExtractor(layerExtensions, 'group'), 'charContent'),
                    search: searchTag && {
                        url: xlinkExtractor(searchTag, 'href'),
                        type: attrExtractor(searchTag, 'type')
                    },
                    dimensions: dimensions.map(dim => ({
                        name: attrExtractor(dim, 'name'),
                        source: {
                            type: attrExtractor(dim, 'type'),
                            url: xlinkExtractor(dim, 'href')
                        }
                    })),
                    filter: filterJSON && (() => {
                        try {
                            return JSON.parse(filterJSON);
                        } catch (e) {
                            return null;
                        }
                    })() || undefined
                };

                const rootDimensions = rootTagsExtractor(rootTagExtractor(layer, 'DimensionList'), 'Dimension').map(dim => ({
                    name: attrExtractor(dim, 'name'),
                    units: attrExtractor(dim, 'units'),
                    unitSymbol: attrExtractor(dim, 'unitSymbol'),
                    'default': attrExtractor(dim, 'default'),
                    values: get(dim, 'charContent', '').split(',')
                }));

                // constructed ms layer object
                const msLayerBase = {
                    id: uuidv1(),
                    visibility: !parseBoolean(attrExtractor(layer, 'hidden')),
                    type: serviceToLayerType(attrExtractor(server, 'service')),
                    url: xlinkExtractor(rootTagExtractor(server, 'OnlineResource'), 'href'),
                    name: get(rootTagExtractor(layer, 'Name'), 'charContent'),
                    title: get(rootTagExtractor(layer, 'Title'), 'charContent'),
                    format: get(head(rootTagsExtractor(rootTagExtractor(layer, 'FormatList'), 'Format')
                        .filter(format => parseBoolean(attrExtractor(format, 'current')))), 'charContent'),
                    style: get(rootTagExtractor(styleTag, 'Name'), 'charContent'),
                    singleTile: olParameters.singleTile,
                    queryable: parseBoolean(attrExtractor(layer, 'queryable')),
                    bbox: isValidMaxExtentObject(olParameters.maxExtent) ? {
                        bounds: olParameters.maxExtent,
                        crs: projection
                    } : undefined,
                    group: msParameters.group || (olParameters.isBaseLayer ? 'background' : layerGroup),
                    opacity: olParameters.opacity,
                    search: msParameters.search,
                    layerFilter: msParameters.filter,
                    dimensions: uniqWith([...msParameters.dimensions, ...rootDimensions], ({name: name1}, {name: name2}) => name1 === name2)
                };

                return {...removeEmptyProps(msLayerBase), params: removeEmptyProps(msLayerBase.params)};
            });

            // put background layers in the beginning of layers array
            const baseLayers = [
                ...msLayers.filter(layer => layer.group === 'background'),
                ...msLayers.filter(layer => layer.group !== 'background')
            ];

            // if there are no visible background layers, add an empty background
            const layers = baseLayers.filter(layer => layer.group === 'background' && layer.visibility).length === 0 ?
                [emptyBackground, ...baseLayers] :
                baseLayers;

            const msGroupsTag = msTagExtractor(globalExtensions, 'GroupList');
            const msGroups = msTagsExtractor(msGroupsTag, 'Group').map(group => ({
                id: attrExtractor(group, 'id'),
                title: attrExtractor(group, 'title'),
                expanded: parseBoolean(attrExtractor(group, 'expanded'))
            }));

            const groups = msGroupsTag && msGroups || [...(layers.filter(layer => !layer.group || layer.group === 'Default').length > 0 ? [{
                id: 'Default',
                title: 'Default',
                expanded: true
            }] : []), ...(generateLayersGroup ? [{
                id: layerGroup,
                title: viewContextTitle || layerGroup
            }] : [])];

            const msCenter = msTagExtractor(globalExtensions, 'center');
            const center = {
                ...mapValues(pickAttributeValues(msCenter, 'x', 'y'), parseFloat),
                crs: attrExtractor(msCenter, 'crs')
            };
            const zoom = parseFloat(get(msTagExtractor(globalExtensions, 'zoom'), 'charContent'));

            const catalogServices = msTagExtractor(globalExtensions, 'CatalogServices');
            const selectedService = attrExtractor(catalogServices, 'selectedService');
            const services = msTagsExtractor(catalogServices, 'Service')
                .map(catalogService => [attrExtractor(catalogService, 'serviceName'), msTagsExtractor(catalogService, 'Attribute')])
                .reduce((resultObj, [serviceName, attributes]) => ({
                    ...resultObj,
                    [serviceName]: attributes.map(parseAttribute).reduce((resultServiceObj, {name, value}) => ({
                        ...resultServiceObj,
                        [name]: value
                    }), {})
                }), {});

            const msMapConfig = {
                catalogServices: catalogServices && {
                    selectedService,
                    services
                },
                map: {
                    maxExtent,
                    bbox: zoom ? undefined : bbox,
                    projection,
                    backgrounds: [],
                    groups,
                    layers,
                    center: has(center, 'x', 'y', 'crs') ? center : undefined,
                    zoom
                },
                version: 2
            };

            resolve(msMapConfig);
        });
    });
};

const booleanValueToAttribute = value => value ? '1' : '0';

const layerTypeToService = {
    'wms': 'OGC:WMS'
};

/**
 * Makes a WMC string from mapstore map config
 * Note: the function expects each layer's capabilities in capabilities prop, i.e. each layer should look like this:
 * ```
 * {
 *   id: 'layer',
 *   name: 'layername',
 *   capabilities: {capabilities object},
 *   ... // other properties
 * }
 * ```
 * @param {object} config mapstore map config
 * @param {object} params context parameters
 * @param {number} [tabSize=2] tabSize to pass to writeXML
 * @param {number} [newline='\n'] newline to pass to writeXML
 */
export const toWMC = (
    {map, catalogServices},
    {
        title = 'MapStore Context',
        abstract = 'This is a map exported from MapStore2.'
    },
    tabSize = 2,
    newline = '\n'
) => {
    const makeSimpleXlink = href => objectToAttributes({
        type: 'simple',
        href
    }, namespaces.xlink);

    const makeOnlineResource = href => ({
        name: 'OnlineResource',
        attributes: makeSimpleXlink(href)
    });

    const {maxExtent, bbox, projection, layers, groups, center, zoom} = map;

    const makeMaxExtentFromBbox = bboxObj => {
        const reprojectedBbox = reprojectBbox(bboxObj.bounds, bboxObj.crs, projection);
        return {
            name: 'maxExtent',
            attributes: objectToAttributes({
                minx: reprojectedBbox[0],
                miny: reprojectedBbox[1],
                maxx: reprojectedBbox[2],
                maxy: reprojectedBbox[3]
            })
        };
    };

    const olExtensionsGeneral = assignNamespace([{
        name: 'maxExtent',
        attributes: objectToAttributes({
            minx: maxExtent[0],
            miny: maxExtent[1],
            maxx: maxExtent[2],
            maxy: maxExtent[3]
        })
    }], namespaces.ol);
    const msExtensionsGeneral = assignNamespace([groups.length > 0 ? {
        name: 'GroupList',
        children: groups.map(group => ({
            name: 'Group',
            xmlns: namespaces.ms,
            attributes: objectToAttributes({
                id: group.id,
                title: group.title,
                expanded: group.expanded
            })
        }))
    } : null, catalogServices && {
        name: 'CatalogServices',
        attributes: catalogServices.selectedService && objectToAttributes({
            selectedService: catalogServices.selectedService
        }),
        children: toPairs(catalogServices.services).map(([serviceName, service]) => ({
            name: 'Service',
            xmlns: namespaces.ms,
            attributes: objectToAttributes({
                serviceName
            }),
            children: keys(service).filter(key =>
                service[key] !== undefined && service[key] !== null &&
                (typeof service[key] === 'string' ||
                typeof service[key] === 'boolean' ||
                typeof service[key] === 'number' ||
                typeof service[key] === 'bigint' ||
                typeof service[key] === 'object')).map(key => ({
                name: 'Attribute',
                xmlns: namespaces.ms,
                attributes: objectToAttributes({
                    name: key,
                    type: typeof service[key]
                }),
                textContent: typeof service[key] === 'object' ?
                    JSON.stringify(service[key]) :
                    service[key].toString()
            }))
        }))
    }, center && {
        name: 'center',
        attributes: objectToAttributes(center)
    }, zoom && {
        name: 'zoom',
        textContent: zoom.toString()
    }], namespaces.ms);

    const layerList = {
        name: 'LayerList',
        children: layers.filter(({type}) => type === 'wms').map(layer => {
            const layerCaps = layer.capabilities || {};
            const dimensionsSource = (layer.dimensions || []).filter(({source}) => !!source);
            const dimensionsWMS = [
                ...(layer.dimensions || []).filter(({source}) => !source),
                ...get(layerCaps, 'dimension', []).filter(({name}) => findIndex(dimensionsSource, dim => dim.name === name) > -1)
                    .map(({_default, name, units, unitSymbol, value = ''}) => ({
                        name,
                        units,
                        unitSymbol,
                        values: value.split(','),
                        'default': _default
                    }))
            ];
            const styles = get(layerCaps, 'style', []).map(({name, title: styleTitle, legendURL = []}) => ({
                name,
                title: styleTitle,
                legendURL: legendURL[0] && pick(legendURL[0], 'width', 'height', 'format', 'onlineResource'),
                current: name === layer.style
            }));

            const olExtensions = assignNamespace([
                layer.bbox ? makeMaxExtentFromBbox(layer.bbox) : null, {
                    name: 'singleTile',
                    textContent: (layer.singleTile || false).toString()
                }, {
                    name: 'transparent',
                    textContent: (layer.transparent === undefined ? true : layer.transparent).toString()
                }, {
                    name: 'isBaseLayer',
                    textContent: (layer.group === 'background').toString()
                }, {
                    name: 'opacity',
                    textContent: (layer.opacity === undefined ? 1 : layer.opacity).toString()
                }
            ], namespaces.ol);

            const msExtensions = assignNamespace([{
                name: 'group',
                textContent: layer.group || 'Default'
            }, layer.search && {
                name: 'search',
                attributes: [{
                    name: 'type',
                    value: layer.search.type
                }, ...makeSimpleXlink(layer.search.url)]
            }, layer.layerFilter && {
                name: 'filter',
                textContent: JSON.stringify(layer.layerFilter)
            }, dimensionsSource.length > 0 && {
                name: 'DimensionList',
                children: dimensionsSource.map(({source: {type, url}, name}) => ({
                    name: 'Dimension',
                    xmlns: namespaces.ms,
                    attributes: [...objectToAttributes({
                        name,
                        type
                    }), ...makeSimpleXlink(url)]
                }))
            }], namespaces.ms);

            return {
                name: 'Layer',
                attributes: objectToAttributes(mapValues({
                    queryable: layer.queryable,
                    hidden: !layer.visibility
                }, booleanValueToAttribute)),
                children: [{
                    name: 'Name',
                    textContent: layer.name
                }, {
                    name: 'Title',
                    textContent: layer.title
                }, {
                    name: 'Server',
                    attributes: objectToAttributes({
                        service: layerTypeToService[layer.type],
                        version: '1.3.0'
                    }),
                    children: [makeOnlineResource(getLayerUrl(layer))]
                }, dimensionsWMS.length > 0 && {
                    name: 'DimensionList',
                    children: dimensionsWMS.map(dimension => {
                        const {name, units, unitSymbol, values: valuesArray = []} = dimension;
                        const defaultValue = dimension.default;

                        return {
                            name: 'Dimension',
                            attributes: objectToAttributes({
                                name,
                                units,
                                unitSymbol,
                                'default': defaultValue,
                                multipleValues: valuesArray.length > 1 && '1' || undefined
                            }),
                            textContent: valuesArray.toString()
                        };
                    })
                }, layer.format && {
                    name: 'FormatList',
                    children: [{
                        name: 'Format',
                        attributes: [{
                            name: 'current',
                            value: '1'
                        }],
                        textContent: layer.format
                    }]
                }, styles.length > 0 && {
                    name: 'StyleList',
                    children: styles.map(({name, title: styleTitle, current, legendURL}) => {
                        const href = get(legendURL, 'onlineResource.href');
                        return {
                            name: 'Style',
                            attributes: current && objectToAttributes({current}) || [],
                            children: [{
                                name: 'Name',
                                textContent: name
                            }, {
                                name: "Title",
                                textContent: styleTitle
                            }, legendURL && {
                                name: "LegendURL",
                                attributes: objectToAttributes({
                                    ...pick(legendURL, 'width', 'height', 'format')
                                }),
                                children: href && [makeOnlineResource(href)]
                            }]
                        };
                    })
                }, {
                    name: 'Extension',
                    children: [...olExtensions, ...msExtensions]
                }]
            };
        })
    };

    return writeXML(removeEmptyNodes({
        name: 'ViewContext',
        xmlns: namespaces.root,
        attributes: [{
            name: 'version',
            value: '1.1.0'
        }, {
            name: 'schemaLocation',
            value: 'http://www.opengis.net/context http://schemas.opengis.net/context/1.1.0/context.xsd',
            xmlns: namespaces.xsi
        }],
        children: [{
            name: 'General',
            children: [{
                name: 'Title',
                textContent: title
            }, {
                name: 'Abstract',
                textContent: abstract
            }, {
                name: 'BoundingBox',
                attributes: objectToAttributes(isValidBboxObject(bbox) ? {
                    ...bbox.bounds,
                    SRS: bbox.crs
                } : {
                    minx: maxExtent[0],
                    miny: maxExtent[1],
                    maxx: maxExtent[2],
                    maxy: maxExtent[3],
                    SRS: projection
                })
            }, {
                name: 'Extension',
                children: [...olExtensionsGeneral, ...msExtensionsGeneral]
            }]
        }, layerList]
    }), values(namespaces), tabSize, newline);
};
