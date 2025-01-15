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
/**
 * LayersTree renders all nodes given a tree representation
 * @prop {object} tree nodes tree
 * @prop {object} contextMenu context menu payload
 * @prop {function} onSort return the sorted node information
 * @prop {function} onChange return the changes of a specific node
 * @prop {function} onContextMenu return the context menu event of a specific node
 * @prop {component} groupNodeComponent custom group node component
 * @prop {component} layerNodeComponent custom layer node component
 * @prop {array} selectedNodes list of selected node objects
 * @prop {function} onSelect return the current selected node on click event
 * @prop {string} filterText filter to apply to layers title
 * @prop {string} theme layers tree theme, one of undefined or `legend`
 * @prop {string} className additional class name for the layer tree
 * @prop {array} nodeItems list of node component to customize specific nodes, expected structure [ { name, Component, selector } ]
 * @prop {array} nodeContentItems list of node content component to customize specific content available after expanding the node, expected structure [ { name, Component } ]
 * @prop {array} nodeToolItems list of node tool component to customize specific tool available on a node, expected structure [ { name, Component } ]
 * @prop {object} singleDefaultGroup if true it hides the default group nodes
 * @prop {string} noFilteredResultsMsgId message id for no result on filter
 * @prop {object} config optional configuration available for the nodes
 * @prop {boolean} config.sortable activate the possibility to sort nodes
 */
const LayersTree = ({
    tree,
    filterText,
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
    config = {},
    className,
    nodeItems,
    nodeToolItems,
    nodeContentItems,
    singleDefaultGroup = isSingleDefaultGroup(tree),
    theme
}) => {

    const containerNode = useRef();
    const root = singleDefaultGroup ? tree[0].nodes : tree;
    const rootParentId = singleDefaultGroup ? defaultGroupId : rootGroupId;
    const [sortId, setSortId] = useState(null);
    const parseSortId = (id) => {
        const parts = (id || '').split('.');
        return parts[parts.length - 1];
    };

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
        <div
            className={`ms-layers-tree${className ? ` ${className}` : ''}${theme ? ` ${theme}-tree` : ''}${!config.showFullTitle && !filterText ? ' single-line-title' : ''}`}
            onPointerLeave={() => {
                if (sortId) {
                    setSortId(null);
                }
            }}
        >
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
                            replaceNodeOptions={(currentNode, nodeType) => {
                                return {
                                    ...currentNode,
                                    ...(sortId && parseSortId(sortId) === parseSortId(currentNode.id) && { dragging: true }),
                                    ...(filterText && { sortable: false }),
                                    ...(nodeType === nodeTypes.GROUP && filterText && { expanded: true }),
                                    ...(nodeType === nodeTypes.GROUP && currentNode?.id === defaultGroupId && { sortable: false }),
                                    ...(nodeType === nodeTypes.GROUP && loopGroupCondition(currentNode, childNode => childNode.loadingError === 'Error') && { error: true }),
                                    ...(nodeType === nodeTypes.GROUP && loopGroupCondition(currentNode, childNode => childNode.loading ) && { loading: true })
                                };
                            }}
                            getNodeStyle={getNodeStyle}
                            getNodeClassName={getNodeClassName}
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
                                        currentLocale: config.currentLocale
                                    });
                                }
                                return true;
                            }}
                            sort={{
                                beginDrag: (id) => {
                                    setSortId(id);
                                },
                                hover: (id, groupId, newIndex) => {
                                    onSort(id, groupId, newIndex);
                                },
                                drop: () => {
                                    setSortId(null);
                                }
                            }}
                            onChange={onChange}
                            onContextMenu={onContextMenu}
                            onSelect={onSelect}
                            nodeItems={nodeItems}
                            nodeToolItems={nodeToolItems}
                            nodeContentItems={nodeContentItems}
                        />
                    );
                })}
            </ul>
            {isContainerEmpty && filterText ? <Message msgId={noFilteredResultsMsgId} /> : null}
        </div>
    );
};

export default LayersTree;
