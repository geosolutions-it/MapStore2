/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');
const {isString, isObject, isArray, head} = require('lodash');

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
    // type 'ol' represents 'No background' layer
    if (layer.type === 'ol') {
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

            return assign({}, mapState, {
                layers: {
                    flat: LayersUtils.reorder(groups, mapState.layers),
                    groups: groups
                }
            });
        }
        return mapState;
    },
    geoJSONToLayer: (geoJSON, id) => {
        return {
            type: 'vector',
            visibility: true,
            group: 'Local shape',
            id,
            name: geoJSON.fileName,
            hideLoading: true,
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
            features: layer.features,
            format: layer.format,
            group: layer.group,
            search: layer.search,
            source: layer.source,
            name: layer.name,
            opacity: layer.opacity,
            provider: layer.provider,
            styles: layer.styles,
            style: layer.style,
            availableStyles: layer.availableStyles,
            capabilitiesURL: layer.capabilitiesURL,
            title: layer.title,
            transparent: layer.transparent,
            tiled: layer.tiled,
            type: layer.type,
            url: layer.url,
            bbox: layer.bbox,
            visibility: layer.loadingError === 'Error' ? true : layer.visibility,
            singleTile: layer.singleTile || false,
            allowedSRS: layer.allowedSRS,
            matrixIds: layer.matrixIds,
            tileMatrixSet: layer.tileMatrixSet,
            dimensions: layer.dimensions || [],
            maxZoom: layer.maxZoom,
            maxNativeZoom: layer.maxNativeZoom,
            ...assign({}, layer.params ? {params: layer.params} : {})
        };
    },
    getCapabilitiesUrl: (layer) => {
        let reqUrl = layer.url;
        let urlParts = reqUrl.split("/geoserver/");
        if (urlParts.length === 2) {
            let layerParts = layer.name.split(":");
            if (layerParts.length === 2) {
                reqUrl = urlParts[0] + "/geoserver/" + layerParts [0] + "/" + layerParts[1] + "/" + urlParts[1];
            }
        }
        return addBaseParams(reqUrl, layer.baseParams || {});
    },
    invalidateUnsupportedLayer(layer, maptype) {
        return isSupportedLayer(layer, maptype) ? checkInvalidParam(layer) : assign({}, layer, {invalid: true});
    },
    isSupportedLayer(layer, maptype) {
        return isSupportedLayer(layer, maptype);
    },
    getLayerTitleTranslations: (capabilities) => {
        return !!LayerCustomUtils.getLayerTitleTranslations ? LayerCustomUtils.getLayerTitleTranslations(capabilities) : capabilities.Title;
    },
    setCustomUtils(type, fun) {
        LayerCustomUtils[type] = fun;
    },
    getNode,
    getGroupNodes,
    deepChange
};

module.exports = LayersUtils;
