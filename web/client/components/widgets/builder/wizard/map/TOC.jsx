/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { compose } from 'recompose';

import DefaultGroup from '../../../../TOC/DefaultGroup';
import DefaultLayer from '../../../../TOC/DefaultLayer';
import DefaultLayerOrGroup from '../../../../TOC/DefaultLayerOrGroup';
import TOC from '../../../../TOC/TOC';
import handleNodeFiltering from './enhancers/handleNodeFiltering';
import handleNodePropertyChanges from './enhancers/handleNodePropertyChanges';
import mapToNodes from './enhancers/mapToNodes';

const enhanceTOC = compose(
    mapToNodes,
    handleNodeFiltering,
    handleNodePropertyChanges
);

export default enhanceTOC(({
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
            titleTooltip
            propertiesChangeHandler={(layer, changes) => Object.keys(changes).map(k => changeLayerProperty(layer, k, changes[k]))}
            onUpdateNode={(layer, _, changes) => Object.keys(changes).map(k => changeLayerProperty(layer, k, changes[k]))}
            onToggle={(id, expanded) => changeLayerProperty(id, "expanded", !expanded)} />} />
</TOC>);
