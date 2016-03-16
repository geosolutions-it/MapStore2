/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');
const {isObject} = require('lodash');

const initialReorderLayers = (groups, allLayers) => {
    return groups.slice(0).reverse().reduce((previous, group) => {
        return previous.concat(allLayers.filter((layer) => (layer.group || 'Default') === group.name))
            .concat(initialReorderLayers((group.groups || []).slice(0).reverse(), allLayers, group.name + '.').reverse());
    }, []);
};

const reorderLayers = (groups, allLayers) => {
    return groups.slice(0).reverse().reduce((previous, group) => {
        return previous.concat(
            group.nodes.filter((node) => !isObject(node)).reverse().map((layer) => allLayers.filter((fullLayer) => fullLayer.id === layer)[0])
        ).concat(reorderLayers((group.nodes || []).filter((node) => isObject(node)).reverse(), allLayers).reverse());
    }, []);
};

var LayersUtils = {
    getLayersByGroup: (configLayers) => {
        let i = 0;
        let mapLayers = configLayers.map((layer) => assign({}, layer, {storeIndex: i++}));
        let groupNames = mapLayers.reduce((groups, layer) => {
            return groups.indexOf(layer.group) === -1 ? groups.concat([layer.group]) : groups;
        }, []).filter((group) => group !== 'background');
        return groupNames.map((group) => {
            let groupName = group || 'Default';

            return assign({}, {
                id: groupName,
                name: groupName,
                title: groupName,
                nodes: mapLayers.filter((layer) => layer.group === group).map((layer) => layer.id).reverse(),
                expanded: true
            });
        }).reverse();
    },

    reorder: (groups, allLayers) => {
        return allLayers.filter((layer) => layer.group === 'background')
            .concat(initialReorderLayers(groups, allLayers));
    },
    denormalizeGroups: (layers, groups) => {
        let normalizedLayers = layers.map((layer) => assign({}, layer, {expanded: layer.expanded || false}));
        return {
            flat: normalizedLayers,
            groups: groups.map((group) => assign({}, group, {
                nodes: group.nodes.map((layerId) => normalizedLayers.filter((layer) => layer.id === layerId)[0])
            }))
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
    }
};

module.exports = LayersUtils;
