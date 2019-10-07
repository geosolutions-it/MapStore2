/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { compose } = require('recompose');
const TOC = require('../../../../TOC/TOC');
const DefaultLayerOrGroup = require('../../../../TOC/DefaultLayerOrGroup');
const DefaultGroup = require('../../../../TOC/DefaultGroup');
const DefaultLayer = require('../../../../TOC/DefaultLayer');

const handleNodePropertyChanges = require('./enhancers/handleNodePropertyChanges');
const handleNodeFiltering = require('./enhancers/handleNodeFiltering');
const mapToNodes = require('./enhancers/mapToNodes');

const enhanceTOC = compose(
    mapToNodes,
    handleNodeFiltering,
    handleNodePropertyChanges,
);

module.exports = enhanceTOC(({
    changeLayerPropertyByGroup = () => {},
    changeLayerProperty = () => {},
    changeGroupProperty = () => {},
    onSort,
    onSelect,
    selectedNodes,
    nodes = []} = {}
) => <TOC
    onSort={onSort}
    selectedNodes={selectedNodes}
    onSelect={onSelect}
    nodes={nodes} >
    <DefaultLayerOrGroup
        groupElement={<DefaultGroup
            onSort={onSort}
            selectedNodes={selectedNodes}
            onSelect={onSelect}
            propertiesChangeHandler={(id, changes) => Object.keys(changes).map(k => changeLayerPropertyByGroup( id, k, changes[k]))}
            onToggle={(id, expanded) => changeGroupProperty(id, "expanded", !expanded)}
            groupVisibilityCheckbox/>}
        layerElement={<DefaultLayer
            selectedNodes={selectedNodes}
            onSelect={onSelect}
            propertiesChangeHandler={(layer, changes) => Object.keys(changes).map(k => changeLayerProperty(layer, k, changes[k]))}
            onUpdateNode={(layer, _, changes) => Object.keys(changes).map(k => changeLayerProperty(layer, k, changes[k]))}
            onToggle={(id, expanded) => changeLayerProperty(id, "expanded", !expanded)} />} />
</TOC>);
