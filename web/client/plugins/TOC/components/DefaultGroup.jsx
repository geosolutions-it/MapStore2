
/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { cloneElement } from 'react';
import { Glyphicon } from 'react-bootstrap';
import DropNode from './DropNode';
import DragNode from './DragNode';
import VisibilityCheck from './VisibilityCheck';
import NodeHeader from './NodeHeader';
import NodeTool from './NodeTool';
import ExpandButton from './ExpandButton';
import InlineLoader from './InlineLoader';

const DefaultGroupNode = ({
    node,
    nodeType,
    nodeTypes,
    config,
    onSelect,
    onChange,
    nodeToolItems = [],
    sortHandler,
    expandButton,
    visibilityCheck,
    nodeIcon
}) => {
    return (
        <>
            <NodeHeader
                node={node}
                nodeType={nodeType}
                currentLocale={config?.currentLocale}
                tooltipOptions={config?.groupOptions?.tooltipOptions}
                showFullTitle={config?.showFullTitle}
                onClick={onSelect}
                showTitleTooltip={config?.showTitleTooltip}
                beforeTitle={<>
                    {sortHandler}
                    {expandButton}
                    {visibilityCheck}
                    {nodeIcon}
                </>}
                afterTitle={
                    <>
                        {node.error ? <NodeTool tooltipId="toc.loadingerror" glyph="exclamation-mark" /> : null}
                        {nodeToolItems.map(({ Component, name }) => {
                            return (<Component key={name} itemComponent={NodeTool} node={node} onChange={onChange} nodeType={nodeType} nodeTypes={nodeTypes} />);
                        })}
                    </>
                }
            />
        </>
    );
};

const DefaultGroup = ({
    node: nodeProp,
    parentId,
    children,
    connectDragPreview = cmp => cmp,
    connectDragSource = cmp => cmp,
    parentHasNodesMutuallyExclusive,
    sortable,
    nodeType,
    ...props
}) => {

    const {
        sort,
        index,
        filter = () => true,
        replaceNodeOptions = (node) => node,
        filterText,
        onChange = () => {},
        onContextMenu = () => {},
        onSelect = () => {},
        getNodeStyle = () => {},
        getNodeClassName = () => '',
        nodeTypes,
        config,
        nodeItems = [],
        nodeToolItems = [],
        theme
    } = props;

    const node = replaceNodeOptions(nodeProp, nodeType);

    function handleOnChange(options) {
        onChange({ node: nodeProp, nodeType, parentId, options });
    }

    function handleOnContextMenu(event) {
        event.stopPropagation();
        event.preventDefault();
        onContextMenu({ node: nodeProp, nodeType, parentId, event });
    }

    function handleOnSelect(event) {
        event.stopPropagation();
        event.preventDefault();
        onSelect({ node: nodeProp, nodeType, parentId, event });
    }

    if (!filter(node, nodeType, parentId)) {
        return null;
    }
    const forceExpanded = config?.expanded !== undefined;
    const expanded = forceExpanded
        ? config?.expanded
        : node?.expanded ?? true;

    const style = getNodeStyle(nodeProp, nodeType);
    const className = getNodeClassName(nodeProp, nodeType);

    const groupNodeProp = {
        index,
        parentId,
        theme,
        node,
        filterText,
        nodeType,
        nodeTypes,
        config,
        onSelect: handleOnSelect,
        onChange: handleOnChange,
        nodeToolItems,
        parentHasNodesMutuallyExclusive,
        visibilityCheck: (
            <VisibilityCheck
                hide={config?.hideVisibilityButton}
                mutuallyExclusive={parentHasNodesMutuallyExclusive}
                value={node?.visibility}
                onChange={(visibility) => {
                    handleOnChange({ visibility });
                }}
            />
        ),
        expandButton: (
            <ExpandButton
                hide={!!forceExpanded}
                expanded={expanded}
                onChange={handleOnChange}
                disabled={!!filterText}
            />
        ),
        sortHandler:
            sortable ? connectDragSource(
                <div className="grab-handle" onClick={(event) => event.stopPropagation()}>
                    <Glyphicon glyph="grab-handle" />
                </div>
            ) : <div className="grab-handle disabled" />,
        nodeIcon: (
            <Glyphicon className="ms-node-icon" glyph={expanded ? 'folder-open' : 'folder-close'} />
        )
    };

    const filteredNodeItems = nodeItems
        .filter(({ selector = () => false }) => selector(groupNodeProp));

    return (
        connectDragPreview(
            <li
                className={`ms-node ms-node-group${className ? ` ${className}` : ''}`}
                style={style}
                onClick={event => event.stopPropagation()}
                onContextMenu={handleOnContextMenu}
            >
                <DropNode
                    nodeType={nodeType}
                    index={index}
                    id={node.id}
                    parentId={parentId}
                    sort={sort}
                    sortable={sortable}
                >
                    <InlineLoader loading={node?.loading}/>
                    {filteredNodeItems.length
                        ? filteredNodeItems.map(({ Component, name }) => {
                            return (
                                <Component key={name} {...groupNodeProp} defaultGroupNodeComponent={DefaultGroupNode} />
                            );
                        })
                        : <DefaultGroupNode
                            {...groupNodeProp}
                        />}
                </DropNode>
                {expanded ? <ul>
                    <DropNode
                        sortable={sortable}
                        sort={sort}
                        nodeType={nodeType}
                        index={index}
                        id={node.id}
                        position="before"
                        parentId={parentId}
                    >
                        <div style={{ display: 'flex', height: 8 }}></div>
                    </DropNode>
                    {node?.nodes?.map?.((childNode, _index) => cloneElement(children, {
                        ...props,
                        key: childNode.id,
                        node: childNode,
                        parentId: node.id,
                        index: _index,
                        parentHasNodesMutuallyExclusive: node?.nodesMutuallyExclusive,
                        onChange: (value) => {
                            if (value?.parentId === node?.id && value?.options?.visibility !== undefined && node?.nodesMutuallyExclusive) {
                                node.nodes.forEach((cNode) => {
                                    if (cNode.id !== value?.node?.id) {
                                        onChange({
                                            node: cNode,
                                            nodeType: cNode?.nodes ? nodeTypes.GROUP : nodeTypes.LAYER,
                                            parentId: node?.id,
                                            options: { visibility: false }
                                        });
                                    }
                                });
                                return onChange({
                                    ...value,
                                    options: { ...value?.options, visibility: true }
                                });
                            }
                            return onChange(value);
                        }
                    }))}
                </ul> : null}
                <DropNode
                    sortable={sortable}
                    sort={sort}
                    nodeType={nodeType}
                    index={index}
                    id={node.id}
                    position="after"
                    parentId={parentId}
                >
                    <div style={{ display: 'flex', height: 8 }}></div>
                </DropNode>
            </li>
        )
    );
};

const DraggableDefaultGroup = (props) => <DragNode {...props} component={DefaultGroup} />;

export default DraggableDefaultGroup;
