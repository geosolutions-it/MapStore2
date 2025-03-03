/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from 'object-assign';
import toBbox from 'turf-bbox';
import uuidv1 from 'uuid/v1';
import isString from 'lodash/isString';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import head from 'lodash/head';
import castArray from 'lodash/castArray';
import isEmpty from 'lodash/isEmpty';
import findIndex from 'lodash/findIndex';
import pick from 'lodash/pick';
import isNil from 'lodash/isNil';
import get from 'lodash/get';
import { addAuthenticationParameter } from './SecurityUtils';
import { getEPSGCode } from './CoordinatesUtils';
import { ANNOTATIONS, updateAnnotationsLayer, isAnnotationLayer } from '../plugins/Annotations/utils/AnnotationsUtils';
import { getLocale } from './LocaleUtils';

let LayersUtils;

let regGeoServerRule = /\/[\w- ]*geoserver[\w- ]*\//;

export const NodeTypes = {
    LAYER: 'layers',
    GROUP: 'groups'
};

export const DEFAULT_GROUP_ID = 'Default';
export const ROOT_GROUP_ID = 'root';

const getGroup = (groupId, groups) => {
    return head(groups.filter((subGroup) => isObject(subGroup) && subGroup.id === groupId));
};
const getLayer = (layerName, allLayers) => {
    return head(allLayers.filter((layer) => layer.id === layerName));
};
const getLayersId = (groupId, allLayers) => {
    return allLayers.filter((layer) => (layer.group || DEFAULT_GROUP_ID) === groupId).map((layer) => layer.id).reverse();
};
/**
 * utility to check
 * @param {object} l layer data
 * @returns {string} wps url or fallback to other layer urls
 */
export const getWpsUrl = l => l && l.wpsUrl || (l.search && l.search.url) || l.url;
const initialReorderLayers = (groups, allLayers) => {
    return groups.slice(0).reverse().reduce((previous, group) => {
        return previous.concat(
            group.nodes.slice(0).reverse().reduce((layers, node) => {
                if (isObject(node)) {
                    return layers.concat(initialReorderLayers([node], allLayers));
                }
                return layers.concat(getLayer(node, allLayers));
            }, [])
        );
    }, []);
};
const reorderLayers = (groups, allLayers) => {
    return initialReorderLayers(groups, allLayers);
};
const createGroup = (groupId, groupTitle, groupName, layers, addLayers) => {
    return assign({}, {
        id: groupId,
        title: groupTitle ?? (groupName || "").replace(/\${dot}/g, "."),
        name: groupName,
        nodes: addLayers ? getLayersId(groupId, layers) : [],
        expanded: true
    });
};

const getElevationDimension = (dimensions = []) => {
    return dimensions.reduce((previous, dim) => {
        return dim.name.toLowerCase() === 'elevation' || dim.name.toLowerCase() === 'depth' ?
            assign({
                positive: dim.name.toLowerCase() === 'elevation'
            }, dim, {
                name: dim.name.toLowerCase() === 'elevation' ? dim.name : 'DIM_' + dim.name
            }) : previous;
    }, null);
};

const addBaseParams = (url, params) => {
    const query = Object.keys(params).map((key) => key + '=' + encodeURIComponent(params[key])).join('&');
    return url.indexOf('?') === -1 ? (url + '?' + query) : (url + '&' + query);
};

const isSupportedLayerFunc = (layer, maptype) => {
    const LayersUtil = require('./' + maptype + '/Layers');
    const Layers = LayersUtil.default || LayersUtil;
    if (layer.type === "mapquest" || layer.type === "bing") {
        return Layers.isSupported(layer.type) && layer.apiKey && layer.apiKey !== "__API_KEY_MAPQUEST__" && !layer.invalid;
    }

    /*
     * type 'empty' represents 'No background' layer
     * previously was checking for types
    */
    if (layer.type === 'empty') {
        return true;
    }
    return Layers.isSupported(layer.type) && !layer.invalid;
};


const checkInvalidParam = (layer) => {
    return layer && layer.invalid ? assign({}, layer, {invalid: false}) : layer;
};

export const getNode = (nodes, id) => {
    if (nodes && isArray(nodes)) {
        return nodes.reduce((previous, node) => {
            if (previous) {
                return previous;
            }
            if (node && (node.name === id || node.id === id || node === id)) {
                return node;
            }
            if (node && node.nodes && node.nodes.length > 0) {
                return getNode(node.nodes, id);
            }
            return previous;
        }, null);
    }
    return null;
};

export const getGroupNodes = (node) => {
    if (node && node.nodes) {
        return node.nodes.reduce((a, b) => {
            let nodes = [].concat(a);
            if (b.nodes) {
                nodes = a.concat(getGroupNodes(b));
            }
            if (isString(b)) {
                return [...nodes, b];
            }
            return [...nodes, b.id];
        }, []);
    }
    return [];
};

/**
 * Gets title of nested groups from Default
 * @param {string} id of group
 * @param {array} groups groups of map
 * @return {string} title of the group
 */
export const getNestedGroupTitle = (id, groups = []) => {
    return isArray(groups) && head(groups.map(group => {
        const groupObj = group.id === id ? group : null;
        if (groupObj) {
            return groupObj.title;
        }
        const nodeObj = getNode(group.nodes, id);
        return nodeObj ? nodeObj.title : null;
    }));
};

/**
 * Flatten nested groupDetails to a one-level groupDetails
 * @param {(Object[]|Object)} groupDetails of objects
 * @returns {Object[]} flattened groupDetails
 */
export const flattenArrayOfObjects = (groupDetails) => {
    let result = [];
    groupDetails && castArray(groupDetails).forEach((a) => {
        result.push(a);
        if (a.nodes && Array.isArray(groupDetails) && Array.isArray(a.nodes)) {
            result = result.concat(flattenArrayOfObjects(a.nodes));
        }
    });
    return result;
};

/**
 * Gets group title by id
 * @param {string} id of group
 * @param {object[]} groups groups of map
 * @returns {string} title of the group
 */

export const displayTitle = (id, groups) => {
    if (groups && Array.isArray(groups)) {
        for (let group of groups) {
            if (group?.id === id) {
                return group.title;
            }
        }
    }
    return DEFAULT_GROUP_ID;
};
/**
 * adds or update node property in a nested node
 * if propName is an object it overrides a whole group of options instead of one
 */
export const deepChange = (nodes, findValue, propName, propValue) => {
    if (nodes && isArray(nodes) && nodes.length > 0) {
        return nodes.map((node) => {
            if (isObject(node)) {
                if (node.id === findValue) {
                    return {...node, ...(isObject(propName) ? propName : {[propName]: propValue})};
                } else if (node.nodes) {
                    return {...node, nodes: deepChange(node.nodes, findValue, propName, propValue)};
                }
            }
            return node;
        });
    }
    return [];
};

export const updateAvailableTileMatrixSetsOptions = ({ tileMatrixSet, matrixIds,  ...layer }) => {
    if (!layer.availableTileMatrixSets && tileMatrixSet && matrixIds) {
        const matrixIdsKeys = isArray(matrixIds) ? matrixIds : Object.keys(matrixIds);
        const availableTileMatrixSets = matrixIdsKeys
            .reduce((acc, key) => {
                const tileMatrix = (tileMatrixSet || []).find((matrix) => matrix['ows:Identifier'] === key);
                if (!tileMatrix) {
                    return acc;
                }
                const limits = isObject(matrixIds) ? matrixIds[key] : null;
                const isLayerLimit = !!(limits || []).find(({ ranges }) => !!ranges);
                const tileMatrixCRS = getEPSGCode(tileMatrix['ows:SupportedCRS'] || '');
                return {
                    ...acc,
                    [key]: {
                        crs: tileMatrixCRS,
                        ...(isLayerLimit && { limits }),
                        tileMatrixSet: tileMatrix
                    }
                };
            }, {});
        return { ...layer, availableTileMatrixSets };
    }
    return layer;
};

/**
 * Extracts the sourceID of a layer.
 * @param {object} layer the layer object
 */
export const getSourceId = (layer = {}) => layer.capabilitiesURL || head(castArray(layer.url));
export const getTileMatrixSetLink = (layer = {}, tileMatrixSetId) => `sources['${getSourceId(layer)}'].tileMatrixSet['${tileMatrixSetId}']`;
/**
 * It extracts tile matrix set from sources and add them to the layer
 *
 * @param sources {object} sources object from state or configuration
 * @param layer {object} layer to check
 * @return {object} new layers with tileMatrixSet and matrixIds (if needed)
 */
export const extractTileMatrixFromSources = (sources, layer) => {
    if (!sources || !layer) {
        return {};
    }
    if (layer.availableTileMatrixSets) {
        const availableTileMatrixSets =  Object.keys(layer.availableTileMatrixSets)
            .reduce((acc, tileMatrixSetId) => {
                const tileMatrixSetLink = getTileMatrixSetLink(layer, tileMatrixSetId);
                const tileMatrixSet = get({ sources }, tileMatrixSetLink);
                if (tileMatrixSet) {
                    return {
                        ...acc,
                        [tileMatrixSetId]: {
                            ...layer.availableTileMatrixSets[tileMatrixSetId],
                            tileMatrixSet
                        }
                    };
                }
                return {
                    ...acc,
                    [tileMatrixSetId]: layer.availableTileMatrixSets[tileMatrixSetId]
                };
            }, {});
        return { availableTileMatrixSets };
    }
    if (!isArray(layer.matrixIds) && isObject(layer.matrixIds)) {
        layer.matrixIds = [...Object.keys(layer.matrixIds)];
    }
    const sourceId = getSourceId(layer);
    const matrixIds = layer.matrixIds && layer.matrixIds.reduce((acc, mI) => {
        const ids = (sources?.[sourceId]?.tileMatrixSet?.[mI]?.TileMatrix || [])
            .map(i => ({
                identifier: i['ows:Identifier'],
                ranges: i.ranges
            }));
        return ids.length === 0 ? acc : { ...acc, [mI]: [...ids] };
    }, {}) || null;
    const tileMatrixSet = layer.tileMatrixSet && layer.matrixIds.map(mI => sources[sourceId].tileMatrixSet[mI]).filter(v => v) || null;
    const newTileMatrixOptions = updateAvailableTileMatrixSetsOptions((tileMatrixSet && matrixIds) ? { tileMatrixSet, matrixIds } : {});
    return newTileMatrixOptions;
};

/**
 * It extracts tile matrix set from layers and add them to sources map object
 *
 * @param  {object} groupedLayersByUrl layers grouped by url
 * @param {object} [sources] current sources map object
 * @return {object} new sources object with data from layers
 */
export const extractTileMatrixSetFromLayers = (groupedLayersByUrl, sources = {}) => {
    return Object.keys(groupedLayersByUrl || [])
        .reduce((acc, url) => {
            const layers = groupedLayersByUrl[url];
            const tileMatrixSet = layers.reduce((layerAcc, layer) => {
                const { availableTileMatrixSets } = updateAvailableTileMatrixSetsOptions(layer);
                return {
                    ...layerAcc,
                    ...Object.keys(availableTileMatrixSets).reduce((tileMatrixSetAcc, tileMatrixSetId) => ({
                        ...tileMatrixSetAcc,
                        [tileMatrixSetId]: availableTileMatrixSets[tileMatrixSetId].tileMatrixSet
                    }), {})
                };
            }, {});
            return {
                ...acc,
                [url]: {
                    ...sources?.[url],
                    tileMatrixSet: {
                        ...sources?.[url]?.tileMatrixSet,
                        ...tileMatrixSet
                    }
                }
            };
        }, { ...sources });
};

/**
 * Creates a map of `sourceId: sourceObject` from the layers array.
 * @param {object[]} layers array of layer objects
 */
export const extractSourcesFromLayers = layers => {
    /* layers grouped by url to create the source object */
    const groupByUrl = layers
        .filter(layer => layer.tileMatrixSet || layer.availableTileMatrixSets)
        .reduce((acc, layer) => {
            const sourceId = getSourceId(layer);
            return {
                ...acc,
                [sourceId]: acc[sourceId]
                    ? [...acc[sourceId], layer]
                    : [layer]
            };
        }, {});

    /* extract and add tile matrix sets to sources object  */
    return extractTileMatrixSetFromLayers(groupByUrl);
};

/**
 * It extracts data from configuration sources and add them to the layers
 *
 * @param mapState {object} state of map, must contains layers array
 * @return {object} new sources object with data from layers
 */

export const extractDataFromSources = mapState => {
    if (!mapState || !mapState.layers || !isArray(mapState.layers)) {
        return null;
    }
    const sources = mapState.mapInitialConfig && mapState.mapInitialConfig.sources && assign({}, mapState.mapInitialConfig.sources) || {};

    return !isEmpty(sources) ? mapState.layers.map(l => {

        const tileMatrix = extractTileMatrixFromSources(sources, l);

        return assign({}, l, tileMatrix);
    }) : [...mapState.layers];
};

export const getURLs = (urls, queryParametersString = '') => {
    return urls.map((url) => url.split("\?")[0] + queryParametersString);
};


const LayerCustomUtils = {};
/**
 * Return a base url for the given layer.
 * Supports multiple urls.
 */

export const getLayerUrl = (layer) => {
    return isArray(layer.url) ? layer.url[0] : layer.url;
};

export const getGroupByName = (groupName, groups = []) => {
    const result = head(groups.filter(g => g.name === groupName));
    return result || groups.reduce((prev, g) => prev || !!g.nodes && LayersUtils.getGroupByName(groupName, g.nodes), undefined);
};
export const getDimension = (dimensions, dimension) => {
    switch (dimension.toLowerCase()) {
    case 'elevation':
        return getElevationDimension(dimensions);
    default:
        return null;
    }
};
/**
 * Returns an id for the layer. If the layer has layer.id returns it, otherwise it will return a generated id.
 * If the layer doesn't have any layer and if the 2nd argument is passed (it should be an array),
 * the layer id will returned will be something like `layerName__2` when 2 is the layer size (for retro compatibility, it should be removed in the future).
 * Otherwise a random string will be appended to the layer name.
 * @param {object} layer the layer
 * @returns {string} the id of the layer, or a generated one
 */
export const getLayerId = (layerObj) => {
    return layerObj && layerObj.id || `${layerObj.name ? `${layerObj.name}__` : ''}${uuidv1()}`;
};

/**
 * it creates an id of a feature if not existing
 * @param {object} feature list of layers to check
  * @return {string} the id
 */
export const createFeatureId = (feature = {}) => {
    return {
        ...feature,
        id: feature.id || feature.properties?.id || uuidv1()
    };
};
/**
 * Normalizes the layer to assign missing Ids and features for vector layers
 * @param {object} layer the layer to normalize
 * @returns {object} the normalized layer
 */

export const normalizeLayer = (layer) => {
    // con uuid
    let _layer = layer;
    if (layer.type === "vector") {
        _layer = _layer?.features?.length ? {
            ..._layer,
            features: _layer?.features?.map(createFeatureId)
        } : layer;
    }
    // regenerate geodesic lines as property since that info has not been saved
    if (_layer.id === ANNOTATIONS) {
        _layer = updateAnnotationsLayer(_layer)[0];
    }

    return {
        ..._layer,
        id: _layer.id || LayersUtils.getLayerId(_layer)};

};
/**
 * Normalizes the map adding missing ids, default groups.
 * @param {object} map the map
 * @param {object} the normalized map
 */
export const normalizeMap = (rawMap = {}) =>
    [
        (map) => (map.layers || []).filter(({ id } = {}) => !id).length > 0 ? {...map, layers: (map.layers || []).map(l => LayersUtils.normalizeLayer(l))} : map,
        (map) => map.groups ? map : {...map, groups: {id: DEFAULT_GROUP_ID, expanded: true}}
        // this is basically a compose
    ].reduce((f, g) => (...args) => f(g(...args)))(rawMap);
/**
 * @param gid
 * @return function that filter by group
 */
export const belongsToGroup = (gid) => l => (l.group || DEFAULT_GROUP_ID) === gid || (l.group || "").indexOf(`${gid}.`) === 0;
export const getLayersByGroup = (configLayers, configGroups) => {
    let i = 0;
    let mapLayers = configLayers.map((layer) => assign({}, layer, {storeIndex: i++}));
    let groupNames = mapLayers.reduce((groups, layer) => {
        return groups.indexOf(layer.group || DEFAULT_GROUP_ID) === -1 ? groups.concat([layer.group || DEFAULT_GROUP_ID]) : groups;
    }, []).filter((group) => group !== 'background').reverse();
    return groupNames.reduce((groups, names)=> {
        let name = names || DEFAULT_GROUP_ID;
        name.split('.').reduce((subGroups, groupName, idx, array)=> {
            const groupId = name.split(".", idx + 1).join('.');
            let group = getGroup(groupId, subGroups);
            const addLayers = idx === array.length - 1;
            if (!group) {
                const flattenGroups = flattenArrayOfObjects(configGroups);
                const groupTitle = displayTitle(groupId, flattenGroups);
                group = createGroup(groupId, groupTitle || groupName, groupName, mapLayers, addLayers);
                subGroups.push(group);
            } else if (addLayers) {
                group.nodes = getLayersId(groupId, mapLayers).concat(group.nodes)
                    .reduce((arr, cur) => {
                        isObject(cur)
                            ? arr.push({node: cur, order: mapLayers.find((el) => el.group === cur.id)?.storeIndex})
                            : arr.push({node: cur, order: mapLayers.find((el) => el.id === cur)?.storeIndex});
                        return arr;
                    }, []).sort((a, b) => b.order - a.order).map(e => e.node);
            }
            return group.nodes;
        }, groups);
        return groups;
    }, []);
};
export const removeEmptyGroups = (groups) => {
    return groups.reduce((acc, group) => {
        return acc.concat(LayersUtils.getNotEmptyGroup(group));
    }, []);
};
export const getNotEmptyGroup = (group) => {
    const nodes = group.nodes.reduce((gNodes, node) => {
        return node.nodes ? gNodes.concat(LayersUtils.getNotEmptyGroup(node)) : gNodes.concat(node);
    }, []);
    return nodes.length > 0 ? assign({}, group, {nodes: nodes}) : [];
};
export const reorderFunc = (groups, allLayers) => {
    return allLayers.filter((layer) => layer.group === 'background')
        .concat(reorderLayers(groups, allLayers));
};

export const getInactiveNode = (groupId, groups, nodeId) => {
    const groupIds = groupId
        .split('.')
        .reverse()
        .map((val, idx, arr) => [val, ...arr.filter((v, jdx) => jdx > idx)].reverse().join('.'));
    const inactive = !!groups
        .find((group) => nodeId !== group?.id && groupIds.includes(group?.id) && group.visibility === false);
    return inactive;
};

export const getDerivedLayersVisibility = (layers = [], groups = []) => {
    const flattenGroups = flattenArrayOfObjects(groups).filter(isObject);
    return layers.map((layer) => {
        const inactive = getInactiveNode(layer?.group || DEFAULT_GROUP_ID, flattenGroups);
        return inactive ? { ...layer, visibility: false } : layer;
    });
};

export const denormalizeGroups = (allLayers, groups) => {
    const flattenGroups = flattenArrayOfObjects(groups).filter(isObject);
    let getNormalizedGroup = (group, layers) => {
        const nodes = group?.nodes?.map((node) => {
            if (isObject(node)) {
                return getNormalizedGroup(node, layers);
            }
            return layers.find((layer) => layer.id === node);
        });
        return {
            ...group,
            nodes,
            inactive: getInactiveNode(group?.id || '', flattenGroups, group?.id),
            visibility: group?.visibility === undefined ? true : group.visibility
        };
    };
    let normalizedLayers = allLayers.map((layer) => ({
        ...layer,
        inactive: getInactiveNode(layer?.group || DEFAULT_GROUP_ID, flattenGroups),
        expanded: layer.expanded || false
    }));
    return {
        flat: normalizedLayers,
        groups: groups.map((group) => getNormalizedGroup(group, normalizedLayers))
    };
};

export const sortLayers = (groups, allLayers) => {
    return allLayers.filter((layer) => layer.group === 'background')
        .concat(reorderLayers(groups, allLayers));
};
export const toggleByType = (type, toggleFun) => {
    return (node, status) => {
        return toggleFun(node, type, status);
    };
};
export const sortUsing = (sortFun, action) => {
    return (node, reorder) => {
        return action(node, reorder, sortFun);
    };
};
export const splitMapAndLayers = (mapState) => {
    if (mapState && isArray(mapState.layers)) {
        let groups = LayersUtils.getLayersByGroup(mapState.layers, mapState.groups);
        // additional params from saved configuration
        if (isArray(mapState.groups)) {
            groups = mapState.groups.reduce((g, group) => {
                let newGroups = g;
                let groupMetadata = {
                    expanded: group.expanded,
                    visibility: group.visibility,
                    nodesMutuallyExclusive: group.nodesMutuallyExclusive
                };
                if (group.title) {
                    groupMetadata = {
                        ...groupMetadata,
                        title: group.title,
                        description: group.description,
                        tooltipOptions: group.tooltipOptions,
                        tooltipPlacement: group.tooltipPlacement
                    };
                }
                newGroups = LayersUtils.deepChange(newGroups, group.id, groupMetadata);
                return newGroups;
            }, [].concat(groups));
        }

        let layers = extractDataFromSources(mapState);

        return assign({}, mapState, {
            layers: {
                flat: LayersUtils.reorder(groups, layers),
                groups: groups
            }
        });
    }
    return mapState;
};
/**
 * used for converting a geojson file with fileName into a vector layer
 * it supports FeatureCollection or Feature
 * @param {object} geoJSON object to put into features
 * @param {string} id layer id
 * @return {object} vector layer containing the geojson in features array
 */
export const geoJSONToLayer = (geoJSON, id) => {
    const bbox = toBbox(geoJSON);
    let features = [];
    if (geoJSON.type === "FeatureCollection") {
        features = geoJSON.features.map((feature, idx) => {
            if (!feature.id) {
                feature.id = idx;
            }
            if (feature.geometry && feature.geometry.bbox && isNaN(feature.geometry.bbox[0])) {
                feature.geometry.bbox = [null, null, null, null];
            }
            return feature;
        });
    } else {
        features = [pick({...geoJSON, id: isNil(geoJSON.id) ? uuidv1() : geoJSON.id}, ["geometry", "type", "style", "id"])];
    }
    return {
        type: 'vector',
        visibility: true,
        id,
        name: geoJSON.fileName,
        hideLoading: true,
        bbox: {
            bounds: {
                minx: bbox[0],
                miny: bbox[1],
                maxx: bbox[2],
                maxy: bbox[3]
            },
            crs: "EPSG:4326"
        },
        features,
        ...(['geostyler'].includes(geoJSON?.style?.format) && geoJSON?.style?.body && {
            style: geoJSON.style
        })
    };
};
export const saveLayer = (layer) => {
    return assign({
        id: layer.id,
        features: layer.features,
        format: layer.format,
        thumbURL: layer.thumbURL && layer.thumbURL.split(':')[0] === 'blob' ? undefined : layer.thumbURL,
        group: layer.group,
        search: layer.search,
        fields: layer.fields,
        source: layer.source,
        name: layer.name,
        opacity: layer.opacity,
        provider: layer.provider,
        description: layer.description,
        styles: layer.styles,
        style: layer.style,
        styleName: layer.styleName,
        layerFilter: layer.layerFilter,
        title: layer.title,
        transparent: layer.transparent,
        tiled: layer.tiled,
        type: layer.type,
        url: layer.url,
        bbox: layer.bbox,
        visibility: layer.visibility,
        singleTile: layer.singleTile || false,
        allowedSRS: layer.allowedSRS,
        matrixIds: layer.matrixIds,
        tileMatrixSet: layer.tileMatrixSet,
        availableTileMatrixSets: layer.availableTileMatrixSets,
        requestEncoding: layer.requestEncoding,
        dimensions: layer.dimensions || [],
        maxZoom: layer.maxZoom,
        maxNativeZoom: layer.maxNativeZoom,
        maxResolution: layer.maxResolution,
        minResolution: layer.minResolution,
        disableResolutionLimits: layer.disableResolutionLimits,
        hideLoading: layer.hideLoading || false,
        handleClickOnLayer: layer.handleClickOnLayer || false,
        queryable: layer.queryable,
        featureInfo: layer.featureInfo,
        catalogURL: layer.catalogURL,
        capabilitiesURL: layer.capabilitiesURL,
        serverType: layer.serverType,
        useForElevation: layer.useForElevation || false,
        hidden: layer.hidden || false,
        origin: layer.origin,
        thematic: layer.thematic,
        tooltipOptions: layer.tooltipOptions,
        tooltipPlacement: layer.tooltipPlacement,
        legendOptions: layer.legendOptions,
        tileSize: layer.tileSize,
        version: layer.version,
        expanded: layer.expanded || false
    },
    layer?.enableInteractiveLegend !== undefined ? { enableInteractiveLegend: layer?.enableInteractiveLegend } : {},
    layer.sources ? { sources: layer.sources } : {},
    layer.heightOffset ? { heightOffset: layer.heightOffset } : {},
    layer.params ? { params: layer.params } : {},
    layer.extendedParams ? { extendedParams: layer.extendedParams } : {},
    layer.localizedLayerStyles ? { localizedLayerStyles: layer.localizedLayerStyles } : {},
    layer.options ? { options: layer.options } : {},
    layer.credits ? { credits: layer.credits } : {},
    layer.tileGrids ? { tileGrids: layer.tileGrids } : {},
    layer.tileGridStrategy ? { tileGridStrategy: layer.tileGridStrategy } : {},
    layer.tileGridCacheSupport ? { tileGridCacheSupport: layer.tileGridCacheSupport } : {},
    isString(layer.rowViewer) ? { rowViewer: layer.rowViewer } : {},
    !isNil(layer.forceProxy) ? { forceProxy: layer.forceProxy } : {},
    !isNil(layer.disableFeaturesEditing) ? { disableFeaturesEditing: layer.disableFeaturesEditing } : {},
    layer.pointCloudShading ? { pointCloudShading: layer.pointCloudShading } : {},
    !isNil(layer.sourceMetadata) ? { sourceMetadata: layer.sourceMetadata } : {});
};

/**
 * constants to specify whether we can use some geoserver vendor extensions of if they
 * should rather be avoided
*/
export const ServerTypes = {
    GEOSERVER: 'geoserver',
    NO_VENDOR: 'no-vendor'
};

/**
 * default initial constant regex rule for searching for a /geoserver/ string in a url
 * useful for a reset to an initial state of the rule
 */
export const REG_GEOSERVER_RULE = regGeoServerRule;
/**
 * Override default REG_GEOSERVER_RULE variable
 * @param {regex} regex custom regex to override
 */
export const setRegGeoserverRule = (regex) => {
    regGeoServerRule = regex;
};
/**
 * Get REG_GEOSERVER_RULE regex variable
 */
export const getRegGeoserverRule = () => regGeoServerRule;
/**
 * it tests if a url is matched by a regex,
 * if so it returns the matched string
 * otherwise returns null
 * @param object.regex the regex to use for parsing the url
 * @param object.url the url to test
 */
export const findGeoServerName = ({url, regexRule}) => {
    const regex = regexRule || LayersUtils.getRegGeoserverRule();
    const location = isArray(url) ? url[0] : url;
    return regex.test(location) && location.match(regex)[0] || null;
};

/**
 * This method search for a /geoserver/  string inside the url
 * if it finds it returns a getCapabilitiesUrl to a single layer if it has a name like WORKSPACE:layerName
 * otherwise it returns the default getCapabilitiesUrl
 */
export const getCapabilitiesUrl = (layer) => {
    const matchedGeoServerName = LayersUtils.findGeoServerName({url: layer.url});
    let reqUrl = getLayerUrl(layer);
    if (!!matchedGeoServerName) {
        let urlParts = reqUrl.split(matchedGeoServerName);
        if (urlParts.length === 2) {
            let layerParts = layer.name.split(":");
            if (layerParts.length === 2) {
                reqUrl = urlParts[0] + matchedGeoServerName + layerParts [0] + "/" + layerParts[1] + "/" + urlParts[1];
            }
        }
    }
    const params = {
        ...layer.baseParams,
        ...layer.params
    };
    return addBaseParams(reqUrl, params);
};
/**
 * Gets the layer search url or the current url
 *
 * @memberof utils.LayerUtils
 * @param {Object} layer
 * @returns {string} layer url
 */
export const getSearchUrl = (l = {}) => l.search && l.search.url || l.url;
export const invalidateUnsupportedLayer = (layer, maptype) => {
    return isSupportedLayerFunc(layer, maptype) ? checkInvalidParam(layer) : assign({}, layer, {invalid: true});
};
/**
 * Establish if a layer is supported or not
 * @return {boolean} value
 */
export const isSupportedLayer = (layer, maptype) => {
    return !!isSupportedLayerFunc(layer, maptype);
};
export const getLayerTitleTranslations = (capabilities) => {
    return !!LayerCustomUtils.getLayerTitleTranslations ? LayerCustomUtils.getLayerTitleTranslations(capabilities) : capabilities.Title;
};
export const setCustomUtils = (type, fun) => {
    LayerCustomUtils[type] = fun;
};

export const getAuthenticationParam = options => {
    const urls = getURLs(isArray(options.url) ? options.url : [options.url]);
    let authenticationParam = {};
    urls.forEach(url => {
        addAuthenticationParameter(url, authenticationParam, options.securityToken);
    });
    return authenticationParam;
};
/**
 * Removes google backgrounds and select an alternative one as visible
 * returns a new list of layers modified accordingly
 */
export const excludeGoogleBackground = ll => {
    const hasVisibleGoogleBackground = ll.filter(({ type, group, visibility } = {}) => group === 'background' && type === 'google' && visibility).length > 0;
    const layers = ll.filter(({ type } = {}) => type !== 'google');
    const backgrounds = layers.filter(({ group } = {}) => group === 'background');

    // check if the selection of a new background is required
    if (hasVisibleGoogleBackground && backgrounds.filter(({ visibility } = {}) => visibility).length === 0) {
        // select the first available
        if (backgrounds.length > 0) {
            const candidate = findIndex(layers, {group: 'background'});
            return layers.map((l, i) => i === candidate ? {...l, visibility: true} : l);
        }
        // add osm if any other background is missing
        return [{
            "type": "osm",
            "title": "Open Street Map",
            "name": "mapnik",
            "source": "osm",
            "group": "background",
            "visibility": true
        }, ...layers];


    }
    return layers;
};
export const creditsToAttribution = ({ imageUrl, link, title, text }) => {
    // TODO: check if format is valid for an img (svg, for instance, may not work)
    const html = imageUrl ? `<img src="${imageUrl}" ${title ? `title="${title}"` : ``}>` : title || text || "credits";
    return link && html ? `<a href="${link}" target="_blank">${html}</a>` : html;
};

export const getLayerTitle = ({title, name}, currentLocale = 'default') => title?.[currentLocale] || title?.default || title || name;

/**
 * Check if a resolution is inside of the min and max resolution limits of a layer
 * @param {object} layer layer object
 * @param {number} resolution resolutions of the current view
 */
export const isInsideResolutionsLimits = (layer, resolution) => {
    if (layer.disableResolutionLimits) {
        return true;
    }
    const minResolution = layer.minResolution || -Infinity;
    const maxResolution = layer.maxResolution || Infinity;
    return resolution !== undefined
        ? resolution < maxResolution && resolution >= minResolution
        : true;
};

/**
 * Filter array of layers to return layers with visibility key set to true
 * @param {Array} layers
 * @param {Array} timelineLayers
 * @returns {Array}
 */
export const visibleTimelineLayers = (layers, timelineLayers) => {
    return layers.filter(layer => {
        let timelineLayer = timelineLayers?.find(item => item.id === layer.id);
        return timelineLayer?.visibility ? layer : null;
    });
};

/**
 * Loop through array of timeline layers to determine if any of the layers is visible
 * @param {Array} layers
 * @returns {boolean}
 */
export const isTimelineVisible = (layers)=>{
    for (let layer of layers) {
        if (layer?.visibility) {
            return true;
        }
    }
    return false;
};

/**
 * Remove the workspace prefix from a geoserver layer name
 * @param {string} full layer name with workspace
 * @returns {string} layer name without workspace prefix
 */
export const removeWorkspace = (layer) => {
    if (layer.indexOf(':') !== -1) {
        return layer.split(':')[1];
    }
    return layer;
};

/**
 * Returns vendor params that can be used when calling wms server for display requests
 * @param {layer} the layer object
 */
export const getWMSVendorParams = (layer) =>  {
    if (layer?.serverType === ServerTypes.NO_VENDOR) {
        return {};
    }
    return { TILED: layer.singleTile ? false : (!isNil(layer.tiled) ? layer.tiled : true)};
};

/**
 * Utility function to check if the node allows to show fields tab
 * @param {object} node the node of the TOC (including layer properties)
 * @returns {boolean} true if the node allows to show fields
 */
export const hasWFSService = ({type, search = {}} = {}) =>
    type === 'wfs' // pure WFS layer
        || (type === 'wms' && search.type === 'wfs'); // WMS backed by WFS (search)

export const getLayerTypeGlyph = (layer) => {
    if (isAnnotationLayer(layer)) {
        return 'comment';
    }
    return '1-layer';
};

/**
Removes a group even if it is nested
It works for layers too
**/
export const deepRemove = (nodes, findValue) => {
    if (nodes && isArray(nodes) && nodes.length > 0) {
        return nodes.filter((node) => (node.id && node.id !== findValue) || (isString(node) && node !== findValue )).map((node) => isObject(node) ? assign({}, node, node.nodes ? {
            nodes: deepRemove(node.nodes, findValue)
        } : {}) : node);
    }
    return nodes;
};

const updateGroupIds = (node, parentGroupId, newLayers) => {
    if (node) {
        if (isString(node.id)) {
            const lastDot = node.id.lastIndexOf('.');
            const newId = lastDot !== -1 ?
                parentGroupId + node.id.slice(lastDot + (parentGroupId === '' ? 1 : 0)) :
                parentGroupId + (parentGroupId === '' ? '' : '.') + node.id;
            return assign({}, node, {id: newId, nodes: node.nodes.map(x => updateGroupIds(x, newId, newLayers))});
        } else if (isString(node)) {
            // if it's just a string it means it is a layer id
            for (let layer of newLayers) {
                if (layer.id === node) {
                    layer.group = parentGroupId;
                }
            }
            return node;
        }
    }
    return node;
};

export const sortGroups = (
    {
        groups: _groups,
        layers: _layers
    },
    {
        node: _node,
        index: _index,
        groupId: _groupId
    }
) => {
    const node = getNode(_groups || [], _node);
    const layerNode = getNode(_layers, _node);
    if (node && _index >= 0 && node.id !== ROOT_GROUP_ID && node.id !== DEFAULT_GROUP_ID && !(!!layerNode && _groupId === ROOT_GROUP_ID)) {
        const groupId = _groupId || DEFAULT_GROUP_ID;
        const curGroupId = layerNode ? (layerNode.group || DEFAULT_GROUP_ID) : (() => {
            const groups = node.id.split('.');
            return groups[groups.length - 2] || ROOT_GROUP_ID;
        })();

        if (groupId === curGroupId) {
            const curGroupNode = curGroupId === ROOT_GROUP_ID ? {nodes: _groups} : getNode(_groups, curGroupId);
            let nodes = (curGroupNode && curGroupNode.nodes || []).slice();
            const nodeIndex = nodes.findIndex(x => (x.id || x) === (node.id || node));

            if (nodeIndex !== -1 && nodeIndex !== _index) {
                const swapCnt = Math.abs(_index - nodeIndex);
                const delta = nodeIndex < _index ? 1 : -1;
                let pos = nodeIndex;
                for (let i = 0; i < swapCnt; ++i, pos += delta) {
                    const tmp = nodes[pos];
                    nodes[pos] = nodes[pos + delta];
                    nodes[pos + delta] = tmp;
                }

                const newGroups = curGroupId === ROOT_GROUP_ID ? nodes : deepChange(_groups, _groupId, 'nodes', nodes);

                return {
                    layers: sortLayers(newGroups, _layers),
                    groups: newGroups
                };
            }
        }
        const groupsWithRemovedNode = deepRemove(_groups, node.id || node);
        const dstGroup = groupId === ROOT_GROUP_ID ? {nodes: groupsWithRemovedNode} : getNode(groupsWithRemovedNode, _groupId);
        if (dstGroup) {
            const newLayers = _layers.map(layer => ({ ...layer }));
            const newNode = updateGroupIds(node, groupId === ROOT_GROUP_ID ? '' : groupId, newLayers);
            let newDestNodes = dstGroup.nodes.slice();
            newDestNodes.splice(_index, 0, newNode);
            const newGroups = groupId === ROOT_GROUP_ID ?
                newDestNodes :
                deepChange(groupsWithRemovedNode.slice(), dstGroup.id, 'nodes', newDestNodes);

            return {
                layers: sortLayers(newGroups, newLayers),
                groups: newGroups
            };
        }
    }
    return null;
};

export const moveNode = (groups, node, groupId, newLayers, foreground = true) => {
    // Remove node from old group
    let newGroups = deepRemove(groups, node);
    // Check if group to move to exists
    let group = getNode(newGroups, groupId);
    if (!group) {
        // Create missing group
        group = head(getLayersByGroup([getNode(newLayers, node)]));
        // check for parent group if exist
        const parentGroup = groupId.split('.').reduce((tree, gName, idx) => {
            const gId = groupId.split(".", idx + 1).join('.');
            const parent = getNode(newGroups, gId);
            return parent ? tree.concat(parent) : tree;
        }, []).pop();
        if (parentGroup) {
            group = getNode([group], parentGroup.id).nodes[0];
            newGroups = deepChange(newGroups, parentGroup.id, 'nodes', foreground ? [group].concat(parentGroup.nodes) : parentGroup.nodes.concat(group));
        } else {
            newGroups = [group].concat(newGroups);
        }
    } else {
        newGroups = deepChange(newGroups, group.id, 'nodes', foreground ? [node].concat(group.nodes.slice(0)) : group.nodes.concat(node));
    }
    return newGroups;
};

export const changeNodeConfiguration = ({
    layers: _layers,
    groups: _groups
}, {
    node,
    nodeType,
    options
}) => {
    const selector = nodeType === 'groups' ? 'group' : 'id';
    if (selector === 'group') {
        const groups = _groups ? [].concat(_groups) : [];
        // updating correctly options in a (deep) subgroup
        const newGroups = deepChange(groups, node, options);
        return { groups: newGroups };
    }

    const flatLayers = (_layers || []);

    // const newGroups = action.options && action.options.group && action.options.group !== layer;
    let sameGroup = options.hasOwnProperty("group") ? false : true;

    const newLayers = flatLayers.map((layer) => {
        if (layer[selector] === node || layer[selector].indexOf(node + '.') === 0) {
            if (layer.group === (options.group || DEFAULT_GROUP_ID)) {
                // If the layer didn't change group, raise a flag to prevent groups update
                sameGroup = true;
            }
            // Edit the layer with the new options
            return { ...layer, ...options };
        }
        return layer;
    });
    let originalNode = head(flatLayers.filter((layer) => { return (layer[selector] === node || layer[selector].indexOf(node + '.') === 0); }));
    if (!sameGroup && originalNode ) {
        // Remove layers from old group
        const groupId = (options.group || DEFAULT_GROUP_ID);
        const newGroups = moveNode(_groups, node, groupId, newLayers);

        let orderedNewLayers = sortLayers ? sortLayers(newGroups, newLayers) : newLayers;
        return {
            layers: orderedNewLayers,
            groups: newGroups
        };
    }
    return { layers: newLayers };
};

export const getSelectedNodes = (selectedIds = [], id, ctrlKey) => {
    if (!id) {
        return [];
    }
    if (ctrlKey) {
        return selectedIds.includes(id)
            ? selectedIds.filter((selectedId) => selectedId !== id)
            : [...selectedIds, id];
    }
    return selectedIds.includes(id)
        ? []
        : [id];
};


/**
 * Returns a parsed title
 * @param {string/object} title title of the group
 * @param {string} locale
 */
export const getTitle = (title, locale = '') => {
    let _title = title || '';
    if (isObject(title)) {
        const _locale = locale || getLocale();
        _title = title[_locale] || title.default;
    }
    return _title.replace(/\./g, '/').replace(/\${dot}/g, '.');
};
/**
 * flatten groups and subgroups in a single array
 * @param {object[]} groups node to get the groups and subgroups
 * @param {number} idx
 * @params {boolean} wholeGroup, if true it returns the whole node
 * @return {object[]} array of nodes (groups and subgroups)
*/
export const flattenGroups = (groups, idx = 0, wholeGroup = false) => {
    return groups.filter((group) => group.nodes).reduce((acc, g) => {
        acc.push(wholeGroup ? g : {label: g.title, value: g.id});
        if (g.nodes.length > 0) {
            return acc.concat(flattenGroups(g.nodes, idx + 1, wholeGroup));
        }
        return acc;
    }, []);
};

LayersUtils = {
    getGroupByName,
    getLayerId,
    hasWFSService,
    normalizeLayer,
    getNotEmptyGroup,
    getLayersByGroup,
    deepChange,
    reorder: reorderFunc,
    getRegGeoserverRule,
    findGeoServerName,
    isInsideResolutionsLimits,
    visibleTimelineLayers
};

