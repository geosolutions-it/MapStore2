/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useState, useLayoutEffect, useRef } from 'react';
import DefaultLayerOrGroup from './DefaultLayerOrGroup';
import { getTitleAndTooltip, isSingleDefaultGroup } from '../utils/TOCUtils';
import { ROOT_GROUP_ID, DEFAULT_GROUP_ID, NodeTypes } from '../../../utils/LayersUtils';
import DefaultLayer from './DefaultLayer';
import DefaultGroup from './DefaultGroup';
import Message from '../../../components/I18N/Message';

const filterTitle = ({
    node,
    filterText,
    currentLocale
}) => {
    const { title: currentTitle } = getTitleAndTooltip({ node, currentLocale });
    return currentTitle.toLowerCase().includes(filterText.toLocaleLowerCase());
};

const loopFilter = ({ node: groupNode, filterText, currentLocale }) => {
    return !!groupNode?.nodes?.find((node) => {
        if (node?.nodes) {
            return loopFilter({ node, filterText, currentLocale });
        }
        return filterTitle({
            node,
            filterText,
            currentLocale
        });
    });
};

const loopGroupCondition = (groupNode, condition) => {
    return !!groupNode?.nodes?.find((node) => {
        if (condition(node)) {
            return true;
        }
        if (node?.nodes) {
            return !!loopGroupCondition(node, condition);
        }
        return !!condition(node);
    });
};

const LayersTree = ({
    tree,
    filterText,
    currentLocale,
    onSort = () => {},
    onChange = () => {},
    groupNodeComponent = DefaultGroup,
    layerNodeComponent = DefaultLayer,
    onContextMenu = () => {},
    onSelect = () => {},
    contextMenu,
    selectedNodes = [],
    rootGroupId = ROOT_GROUP_ID,
    defaultGroupId = DEFAULT_GROUP_ID,
    nodeTypes = NodeTypes,
    noFilteredResultsMsgId = 'toc.noFilteredResults',
    config,
    className,
    nodeItems,
    nodeToolItems,
    singleDefaultGroup = isSingleDefaultGroup(tree),
    theme
}) => {

    const containerNode = useRef();
    const root = singleDefaultGroup ? tree[0].nodes : tree;
    const rootParentId = singleDefaultGroup ? defaultGroupId : rootGroupId;

    const [isContainerEmpty, setIsContainerEmpty] = useState(false);
    useLayoutEffect(() => {
        setIsContainerEmpty(containerNode?.current?.children?.length === 0);
    }, [filterText]);

    const getGroup = () => {
        const Group = groupNodeComponent;
        return (<Group />);
    };

    const getLayer = () => {
        const Layer = layerNodeComponent;
        return (<Layer />);
    };

    const getNodeStyle = () => {
        return {};
    };

    const getNodeClassName = (currentNode) => {
        const selected = selectedNodes.find((selectedNode) => currentNode.id === selectedNode.id);
        const contextMenuHighlight = contextMenu?.id === currentNode.id;
        const inactive = currentNode.visibilityWarningMessageId
            || currentNode.visibility === false
            || currentNode.inactive === true;
        return [
            ...(contextMenuHighlight ? ['focused'] : []),
            ...(selected ? ['selected'] : []),
            ...(currentNode.error ? ['error'] : []),
            ...(inactive ? ['inactive'] : [])
        ].join(' ');
    };

    return (
        <div className={`ms-layers-tree${className ? ` ${className}` : ''}${theme ? ` ${theme}-tree` : ''}${!config.showFullTitle && !filterText ? ' single-line-title' : ''}`}>
            <ul
                ref={containerNode}
                data-root-parent-id={rootParentId}
                onContextMenu={(event) => {
                    event.preventDefault();
                }}
            >
                {(root || []).map((node, index) => {
                    return (
                        <DefaultLayerOrGroup
                            containerNode={containerNode.current}
                            key={node.id}
                            index={index}
                            node={node}
                            groupElement={getGroup()}
                            layerElement={getLayer()}
                            nodeTypes={nodeTypes}
                            replaceNodeOptions={(currentNode, nodeType) => ({
                                ...currentNode,
                                ...(filterText && { sortable: false }),
                                ...(nodeType === nodeTypes.GROUP && filterText && { expanded: true }),
                                ...(nodeType === nodeTypes.GROUP && currentNode?.id === defaultGroupId && { sortable: false }),
                                ...(nodeType === nodeTypes.GROUP && loopGroupCondition(currentNode, childNode => childNode.loadingError === 'Error') && { error: true }),
                                ...(nodeType === nodeTypes.GROUP && loopGroupCondition(currentNode, childNode => childNode.loading ) && { loading: true })
                            })}
                            getNodeStyle={getNodeStyle}
                            getNodeClassName={getNodeClassName}
                            currentLocale={currentLocale}
                            filterText={filterText}
                            config={config}
                            theme={theme}
                            filter={(currentNode, nodeType) => {
                                if (nodeType === nodeTypes.GROUP && filterText) {
                                    return loopFilter({ node: currentNode, filterText });
                                }
                                if (nodeType === nodeTypes.LAYER && filterText) {
                                    return filterTitle({
                                        node: currentNode,
                                        filterText,
                                        currentLocale
                                    });
                                }
                                return true;
                            }}
                            sort={{
                                hover: (id, groupId, newIndex) => {
                                    onSort(id, groupId, newIndex);
                                }
                            }}
                            onChange={onChange}
                            onContextMenu={onContextMenu}
                            onSelect={onSelect}
                            nodeItems={nodeItems}
                            nodeToolItems={nodeToolItems}
                        />
                    );
                })}
            </ul>
            {isContainerEmpty && filterText ? <Message msgId={noFilteredResultsMsgId} /> : null}
        </div>
    );
};

export default LayersTree;
