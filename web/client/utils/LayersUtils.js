/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');
const toBbox = require('turf-bbox');
const {isString, isObject, isArray, head, isEmpty} = require('lodash');
const REG_GEOSERVER_RULE = /\/[\w- ]*geoserver[\w- ]*\//;
const findGeoServerName = ({url, regex = REG_GEOSERVER_RULE}) => {
    return regex.test(url) && url.match(regex)[0] || null;
};
const getGroup = (groupId, groups) => {
    return head(groups.filter((subGroup) => isObject(subGroup) && subGroup.id === groupId));
};
const getLayer = (layerName, allLayers) => {
    return head(allLayers.filter((layer) => layer.id === layerName));
};
const getLayersId = (groupId, allLayers) => {
    return allLayers.filter((layer) => (layer.group || 'Default') === groupId).map((layer) => layer.id).reverse();
};
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
const createGroup = (groupId, groupName, layers, addLayers) => {
    return assign({}, {
        id: groupId,
        title: (groupName || "").replace(/\${dot}/g, "."),
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

const isSupportedLayer = (layer, maptype) => {
    const Layers = require('./' + maptype + '/Layers');
    if (layer.type === "mapquest" || layer.type === "bing") {
        return Layers.isSupported(layer.type) && layer.apiKey && layer.apiKey !== "__API_KEY_MAPQUEST__" && !layer.invalid;
    }

    /*
     * type 'empty' represents 'No background' layer
     * previously was checking for types
    */
    if (layer.type === 'empty') {
        return maptype === 'openlayers' || maptype === 'leaflet';
    }
    return Layers.isSupported(layer.type) && !layer.invalid;
};


const checkInvalidParam = (layer) => {
    return layer && layer.invalid ? assign({}, layer, {invalid: false}) : layer;
};

const getNode = (nodes, id) => {
    if (nodes && isArray(nodes)) {
        return nodes.reduce((previous, node) => {
            if (previous) {
                return previous;
            }
            if (node && (node.name === id || node.id === id)) {
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

const getGroupNodes = (node) => {
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

const deepChange = (nodes, findValue, propName, propValue) => {
    if (nodes && isArray(nodes) && nodes.length > 0) {
        return nodes.map((node) => {
            if (isObject(node)) {
                if (node.id === findValue) {
                    return assign({}, node, {[propName]: propValue});
                }else if (node.nodes) {
                    return assign({}, node, {nodes: deepChange(node.nodes, findValue, propName, propValue)});
                }
            }
            return node;
        });
    }
    return [];
};

/**
* It extracts tile matrix set from sources and add them to the layer
*
* @param sources {object} sources object from state or configuration
* @param layer {object} layer to check
* @return {object} new layers with tileMatrixSet and matrixIds (if needed)
*/

const extractTileMatrixFromSources = (sources, layer) => {
    if (!sources || !layer) {
        return {};
    }
    const matrixIds = layer.matrixIds && layer.matrixIds.reduce((a, mI) => {
        const ids = sources[layer.url] && sources[layer.url].tileMatrixSet && sources[layer.url].tileMatrixSet[mI] && sources[layer.url].tileMatrixSet[mI].TileMatrix.map(i => ({identifier: i['ows:Identifier'], ranges: i.ranges})) || [];
        return ids.length === 0 ? assign({}, a) : assign({}, a, {[mI]: [...ids]});
    }, {}) || null;
    const tileMatrixSet = layer.tileMatrixSet && layer.matrixIds.map(mI => sources[layer.url].tileMatrixSet[mI]).filter(v => v) || null;
    return tileMatrixSet && matrixIds && {tileMatrixSet, matrixIds} || {};
};

/**
* It extracts data from configuration sources and add them to the layers
*
* @param mapState {object} state of map, must contains layers array
* @return {object} new sources object with data from layers
*/

const extractDataFromSources = mapState => {
    if (!mapState || !mapState.layers || !isArray(mapState.layers)) {
        return null;
    }
    const sources = mapState.mapInitialConfig && mapState.mapInitialConfig.sources && assign({}, mapState.mapInitialConfig.sources) || {};

    return !isEmpty(sources) ? mapState.layers.map(l => {

        const tileMatrix = extractTileMatrixFromSources(sources, l);

        return assign({}, l, tileMatrix);
    }) : [...mapState.layers];
};

const getURLs = (urls, queryParametersString = '') => {
    return urls.map((url) => url.split("\?")[0] + queryParametersString);
};

const SecurityUtils = require('./SecurityUtils');

const LayerCustomUtils = {};

const LayersUtils = {
    getDimension: (dimensions, dimension) => {
        switch (dimension.toLowerCase()) {
        case 'elevation':
            return getElevationDimension(dimensions);
        default:
            return null;
        }
    },
    getLayerId: (layerObj, layers) => {
        return layerObj && layerObj.id || layerObj.name + "__" + layers.length;
    },
    getLayersByGroup: (configLayers) => {
        let i = 0;
        let mapLayers = configLayers.map((layer) => assign({}, layer, {storeIndex: i++}));
        let groupNames = mapLayers.reduce((groups, layer) => {
            return groups.indexOf(layer.group || 'Default') === -1 ? groups.concat([layer.group || 'Default']) : groups;
        }, []).filter((group) => group !== 'background').reverse();

        return groupNames.reduce((groups, names)=> {
            let name = names || 'Default';
            name.split('.').reduce((subGroups, groupName, idx, array)=> {
                const groupId = name.split(".", idx + 1).join('.');
                let group = getGroup(groupId, subGroups);
                const addLayers = idx === array.length - 1;
                if (!group) {
                    group = createGroup(groupId, groupName, mapLayers, addLayers);
                    subGroups.push(group);
                } else if (addLayers) {
                    group.nodes = group.nodes.concat(getLayersId(groupId, mapLayers));
                }
                return group.nodes;
            }, groups);
            return groups;
        }, []);
    },
    removeEmptyGroups: (groups) => {
        return groups.reduce((acc, group) => {
            return acc.concat(LayersUtils.getNotEmptyGroup(group));
        }, []);
    },
    getNotEmptyGroup: (group) => {
        const nodes = group.nodes.reduce((gNodes, node) => {
            return node.nodes ? gNodes.concat(LayersUtils.getNotEmptyGroup(node)) : gNodes.concat(node);
        }, []);
        return nodes.length > 0 ? assign({}, group, {nodes: nodes}) : [];
    },
    reorder: (groups, allLayers) => {
        return allLayers.filter((layer) => layer.group === 'background')
            .concat(reorderLayers(groups, allLayers));
    },
    denormalizeGroups: (allLayers, groups) => {
        let getGroupVisibility = (nodes) => {
            let visibility = true;
            nodes.forEach((node) => {
                if (!node.visibility) {
                    visibility = false;
                }
            });
            return visibility;
        };
        let getNormalizedGroup = (group, layers) => {
            const nodes = group.nodes.map((node) => {
                if (isObject(node)) {
                    return getNormalizedGroup(node, layers);
                }
                return layers.filter((layer) => layer.id === node)[0];
            });
            return assign({}, group, {nodes, visibility: getGroupVisibility(nodes)});
        };
        let normalizedLayers = allLayers.map((layer) => assign({}, layer, {expanded: layer.expanded || false}));
        return {
            flat: normalizedLayers,
            groups: groups.map((group) => getNormalizedGroup(group, normalizedLayers))
        };
    },

    sortLayers: (groups, allLayers) => {
        return allLayers.filter((layer) => layer.group === 'background')
            .concat(reorderLayers(groups, allLayers));
    },
    toggleByType: (type, toggleFun) => {
        return (node, status) => {
            return toggleFun(node, type, status);
        };
    },
    sortUsing: (sortFun, action) => {
        return (node, reorder) => {
            return action(node, reorder, sortFun);
        };
    },
    splitMapAndLayers: (mapState) => {
        if (mapState && isArray(mapState.layers)) {
            let groups = LayersUtils.getLayersByGroup(mapState.layers);
            // additional params from saved configuration
            if (isArray(mapState.groups)) {
                groups = mapState.groups.reduce((g, group) => {
                    let newGroups = g;
                    if (group.title) {
                        newGroups = LayersUtils.deepChange(newGroups, group.id, 'title', group.title);
                    }
                    newGroups = LayersUtils.deepChange(newGroups, group.id, 'expanded', group.expanded);
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
    },
    geoJSONToLayer: (geoJSON, id) => {
        const bbox = toBbox(geoJSON);
        return {
            type: 'vector',
            visibility: true,
            group: 'Local shape',
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
            features: geoJSON.features.map((feature, idx) => {
                if (!feature.id) {
                    feature.id = idx;
                }
                if (feature.geometry && feature.geometry.bbox && isNaN(feature.geometry.bbox[0])) {
                    feature.geometry.bbox = [null, null, null, null];
                }
                return feature;
            })
        };
    },
    saveLayer: (layer) => {
        return {
            id: layer.id,
            features: layer.features,
            format: layer.format,
            group: layer.group,
            search: layer.search,
            source: layer.source,
            name: layer.name,
            opacity: layer.opacity,
            provider: layer.provider,
            description: layer.description,
            styles: layer.styles,
            style: layer.style,
            styleName: layer.styleName,
            availableStyles: layer.availableStyles,
            capabilitiesURL: layer.capabilitiesURL,
            title: layer.title,
            transparent: layer.transparent,
            tiled: layer.tiled,
            type: layer.type,
            url: layer.url,
            bbox: layer.bbox,
            nativeCrs: layer.nativeCrs,
            visibility: layer.loadingError === 'Error' ? true : layer.visibility,
            singleTile: layer.singleTile || false,
            allowedSRS: layer.allowedSRS,
            matrixIds: layer.matrixIds,
            tileMatrixSet: layer.tileMatrixSet,
            dimensions: layer.dimensions || [],
            maxZoom: layer.maxZoom,
            maxNativeZoom: layer.maxNativeZoom,
            hideLoading: layer.hideLoading || false,
            handleClickOnLayer: layer.handleClickOnLayer || false,
            featureInfo: layer.featureInfo,
            catalogURL: layer.catalogURL,
            ...assign({}, layer.params ? {params: layer.params} : {})
        };
    },
    /**
    * default regex rule for searching for a /geoserver/ string in a url
    */
    REG_GEOSERVER_RULE,
    /**
    * it tests if a url is matched by a regex,
    * if so it returns the matched string
    * otherwise returns null
    * @param object.regex the regex to use for parsing the url
    * @param object.url the url to test
    */
    findGeoServerName,
    /**
     * This method search for a /geoserver/  string inside the url
     * if it finds it returns a getCapabilitiesUrl to a single layer if it has a name like WORKSPACE:layerName
     * otherwise it returns the default getCapabilitiesUrl
    */
    getCapabilitiesUrl: (layer) => {
        const matchedGeoServerName = findGeoServerName({url: layer.url});
        let reqUrl = layer.url;
        if (!!matchedGeoServerName) {
            let urlParts = reqUrl.split(matchedGeoServerName);
            if (urlParts.length === 2) {
                let layerParts = layer.name.split(":");
                if (layerParts.length === 2) {
                    reqUrl = urlParts[0] + matchedGeoServerName + layerParts [0] + "/" + layerParts[1] + "/" + urlParts[1];
                }
            }
        }
        return addBaseParams(reqUrl, layer.baseParams || {});
    },
    invalidateUnsupportedLayer(layer, maptype) {
        return isSupportedLayer(layer, maptype) ? checkInvalidParam(layer) : assign({}, layer, {invalid: true});
    },
    /**
     * Estasblish if a layer is supported or not
     * @return {boolean} value
    */
    isSupportedLayer(layer, maptype) {
        return !!isSupportedLayer(layer, maptype);
    },
    getLayerTitleTranslations: (capabilities) => {
        return !!LayerCustomUtils.getLayerTitleTranslations ? LayerCustomUtils.getLayerTitleTranslations(capabilities) : capabilities.Title;
    },
    setCustomUtils(type, fun) {
        LayerCustomUtils[type] = fun;
    },
    getNode,
    getGroupNodes,
    deepChange,
    extractDataFromSources,
    extractTileMatrixFromSources,
    getURLs,
    getAuthenticationParam: options => {
        const urls = getURLs(isArray(options.url) ? options.url : [options.url]);
        let authenticationParam = {};
        urls.forEach(url => {
            SecurityUtils.addAuthenticationParameter(url, authenticationParam, options.securityToken);
        });
        return authenticationParam;
    }
};

module.exports = LayersUtils;
