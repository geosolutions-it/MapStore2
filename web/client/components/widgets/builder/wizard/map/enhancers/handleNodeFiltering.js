/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { head} = require('lodash');
const { withProps } = require('recompose');

const addFilteredAttributesGroups = (nodes, filters) => {
    return nodes.reduce((newNodes, currentNode) => {
        let node = { ...currentNode };
        if (node.nodes) {
            node = { ...node, nodes: addFilteredAttributesGroups(node.nodes, filters) };
        }
        filters.forEach(filter => {
            if (node.nodes && filter.func(node)) {
                node = { ...node, ...filter.options };
            } else if (node.nodes) {
                node = { ...node };
            }
        });
        newNodes.push(node);
        return newNodes;
    }, []);
};
const filterLayersByTitle = () => true;

/**
 * Dummy replacement of original logic to add filtering by title in TOC.
 * For the moment it only adds the defaults
 * @param {object} props
 */
const addNodeFilters = ({ nodes, filterText, currentLocale }) => addFilteredAttributesGroups(nodes, [
    {
        options: { showComponent: true },
        func: () => !filterText
    },
    {
        options: { loadingError: true },
        func: (node) => head(node.nodes.filter(n => n.loadingError && n.loadingError !== 'Warning'))
    },
    {
        options: { expanded: true, showComponent: true },
        func: (node) => filterText && head(node.nodes.filter(l => filterLayersByTitle(l, filterText, currentLocale) || l.nodes && head(node.nodes.filter(g => g.showComponent))))
    }
]);

module.exports = withProps((props) => ({
    nodes: addNodeFilters(props)
}));
