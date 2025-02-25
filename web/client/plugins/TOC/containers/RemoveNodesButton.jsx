/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useState } from 'react';
import { connect } from 'react-redux';
import { removeNode } from '../../../actions/layers';
import ConfirmModal from '../../../components/layout/ConfirmDialog';
import Portal from '../../../components/misc/Portal';


const getRemoveNodes = (node) => {
    return [
        ...(node?.id ? [ node ] : []),
        ...(node?.nodes || []).map(getRemoveNodes).flat()
    ];
};
/**
 * This component provides the remove node actions to make them available inside the toolbar or context menu
 */
const RemoveNodesButton = connect(() => ({}), {
    onRemove: removeNode
})(({
    onRemove,
    status,
    itemComponent,
    selectedNodes,
    statusTypes,
    nodeTypes,
    config,
    rootGroupId,
    ...props
}) => {

    const ItemComponent = itemComponent;
    const [showDeleteDialog, setShowDeleteDialog] = useState(null);

    function handleRemoveNodes() {
        const { nodes } = showDeleteDialog || {};
        const nodesToRemove = getRemoveNodes({ id: null, nodes });
        nodesToRemove.forEach((node) => {
            onRemove(node.id, node?.nodes ? nodeTypes.GROUP : nodeTypes.LAYER);
        });
        setShowDeleteDialog(null);
    }

    if (selectedNodes?.[0]?.id === rootGroupId) {
        return null;
    }

    if (config.activateRemoveLayer === false && [statusTypes.LAYER, statusTypes.LAYERS].includes(status)) {
        return null;
    }

    if (config.activateRemoveGroup === false && [statusTypes.GROUP, statusTypes.GROUPS].includes(status)) {
        return null;
    }

    const isSelectedGroup = [statusTypes.GROUP, statusTypes.GROUPS, statusTypes.BOTH].includes(status);
    const isSingleLayer = statusTypes.LAYER === status;
    return (
        <>
            {[statusTypes.LAYER, statusTypes.LAYERS, statusTypes.GROUP, statusTypes.GROUPS, statusTypes.BOTH].includes(status) ? <ItemComponent
                {...props}
                glyph="trash"
                active={showDeleteDialog}
                labelId={
                    isSelectedGroup
                        ? 'toc.toolTrashGroupTooltip'
                        : isSingleLayer
                            ? 'toc.toolTrashLayerTooltip'
                            : 'toc.toolTrashLayersTooltip'
                }
                tooltipId={
                    isSelectedGroup
                        ? 'toc.toolTrashGroupTooltip'
                        : isSingleLayer
                            ? 'toc.toolTrashLayerTooltip'
                            : 'toc.toolTrashLayersTooltip'
                }
                onClick={() => setShowDeleteDialog({ nodes: selectedNodes.map(({ node }) => node) })}
            /> : null}
            <Portal>
                <ConfirmModal
                    show= {!!showDeleteDialog}
                    onCancel={() => setShowDeleteDialog(null)}
                    onConfirm={handleRemoveNodes}
                    preventHide
                    titleId= { isSelectedGroup ? "layerProperties.deleteLayerGroupMessage" : "layerProperties.deleteLayerMessage" }
                    confirmId={`layerProperties.delete`}
                    cancelId={`cancel`}
                    variant="danger"
                />
            </Portal>
        </>
    );
});

export default RemoveNodesButton;

