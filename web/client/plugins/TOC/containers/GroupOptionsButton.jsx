/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect } from 'react-redux';
import {
    updateNode
} from '../../../actions/layers';

const getFlatNodes = (selected, condition = current => current) => {
    return [
        ...(selected?.id ? [ selected ] : []),
        ...(condition(selected) ? (selected?.nodes || [])  : []).map((node) => getFlatNodes(node, condition)).flat()
    ];
};
/**
 * This component provides the node groups actions to make them available inside the toolbar or context menu.
 * Available actions:
 * - activate visibility for all children nodes
 * - deactivate visibility for all children nodes
 * - activate/deactivate mutually exclusive children nodes
 * - collapse all children nodes
 * - expand all children nodes
 */
const GroupOptionsButton = connect(() => ({}), {
    onChange: updateNode
})(({
    status,
    onChange,
    itemComponent,
    selectedNodes,
    statusTypes,
    nodeTypes,
    rootGroupId,
    ...props
}) => {

    const ItemComponent = itemComponent;
    if ([statusTypes.GROUP].includes(status)) {
        const selected = selectedNodes?.[0];
        return (
            <>
                {!selected?.node?.nodesMutuallyExclusive && <ItemComponent
                    {...props}
                    labelId={'toc.toolGroupShowAllChildren'}
                    glyph={'checkbox-on'}
                    onClick={() => {
                        const nodes = getFlatNodes({ ...selected?.node, id: null }, current => !current?.nodesMutuallyExclusive);
                        nodes.forEach((node) => {
                            onChange(node?.id, node?.nodes ? nodeTypes.GROUP : nodeTypes.LAYER, {
                                visibility: true
                            });
                        });
                    }}
                />}
                {!selected?.node?.nodesMutuallyExclusive && <ItemComponent
                    {...props}
                    labelId={'toc.toolGroupHideAllChildren'}
                    glyph={'checkbox-off'}
                    onClick={() => {
                        const nodes = getFlatNodes({ ...selected?.node, id: null }, current => !current?.nodesMutuallyExclusive);
                        nodes.forEach((node) => {
                            onChange(node?.id, node?.nodes ? nodeTypes.GROUP : nodeTypes.LAYER, {
                                visibility: false
                            });
                        });
                    }}
                />}
                {selected.id !== rootGroupId && <ItemComponent
                    {...props}
                    labelId={selected?.node?.nodesMutuallyExclusive ? 'toc.deactivateToolGroupMutuallyExclusive' : 'toc.activateToolGroupMutuallyExclusive'}
                    glyph={selected?.node?.nodesMutuallyExclusive ? 'radio-on' : 'radio-off'}
                    onClick={() => {
                        const nodesMutuallyExclusive = !selected?.node?.nodesMutuallyExclusive;
                        if (nodesMutuallyExclusive && selected?.node?.nodes) {
                            selected.node.nodes.forEach((node) => {
                                onChange(node?.id, node?.nodes ? nodeTypes.GROUP : nodeTypes.LAYER, {
                                    visibility: false
                                });
                            });
                        }
                        onChange(selected?.id, selected?.type, {
                            nodesMutuallyExclusive
                        });
                    }}
                />}
                <ItemComponent
                    {...props}
                    labelId={'toc.toolGroupCollapseAllChildren'}
                    glyph={'next'}
                    onClick={() => {
                        const nodes = getFlatNodes({ ...selected?.node, id: null });
                        nodes.forEach((node) => {
                            onChange(node?.id, node?.nodes ? nodeTypes.GROUP : nodeTypes.LAYER, {
                                expanded: false
                            });
                        });
                    }}
                />
                <ItemComponent
                    {...props}
                    labelId={'toc.toolGroupExpandAllChildren'}
                    glyph={'bottom'}
                    onClick={() => {
                        const nodes = getFlatNodes({ ...selected?.node, id: null });
                        nodes.forEach((node) => {
                            onChange(node?.id, node?.nodes ? nodeTypes.GROUP : nodeTypes.LAYER, {
                                expanded: true
                            });
                        });
                    }}
                />
                <hr/>
            </>
        );
    }
    return null;
});

export default GroupOptionsButton;

