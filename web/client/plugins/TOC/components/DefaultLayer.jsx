/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { castArray, find } from 'lodash';
import { Glyphicon } from 'react-bootstrap';
import { isInsideResolutionsLimits, getLayerTypeGlyph } from '../../../utils/LayersUtils';
import { getLayerErrorMessage } from '../utils/TOCUtils';
import DropNode from './DropNode';
import DragNode from './DragNode';
import { VisualizationModes } from '../../../utils/MapTypeUtils';
import InlineLoader from './InlineLoader';
import WMSLegend from './WMSLegend';
import OpacitySlider from './OpacitySlider';
import VectorLegend from './VectorLegend';
import VisibilityCheck from './VisibilityCheck';
import NodeHeader from './NodeHeader';
import NodeTool from './NodeTool';
import ExpandButton from './ExpandButton';

const getLayerVisibilityWarningMessageId = (node, config = {}) => {
    if (config.visualizationMode === VisualizationModes._2D && ['3dtiles'].includes(node.type)) {
        return 'toc.notVisibleSwitchTo3D';
    }
    if (config.visualizationMode === VisualizationModes._3D && ['cog'].includes(node.type)) {
        return 'toc.notVisibleSwitchTo2D';
    }
    if (config.resolution !== undefined && !isInsideResolutionsLimits(node, config.resolution)) {
        const maxResolution = node.maxResolution || Infinity;
        return config.resolution >=  maxResolution
            ? 'toc.notVisibleZoomIn'
            : 'toc.notVisibleZoomOut';
    }
    if (node.loadingError === 'Warning') {
        return 'toc.toggleLayerVisibilityWarning';
    }
    return '';
};

const DefaultLayerNode = ({
    node,
    filterText,
    onChange,
    sortHandler,
    config = {},
    nodeToolItems = [],
    onSelect,
    nodeType,
    nodeTypes,
    error,
    visibilityWarningMessageId,
    visibilityCheck,
    nodeIcon
}) => {

    const getContent = () => {

        // currently the only content of the layer is the legend
        // so we hide it if not visible
        if (error || config?.layerOptions?.hideLegend) {
            return null;
        }

        const layerType = node?.type;
        if (['wfs', 'vector'].includes(layerType)) {
            const hasStyle = node?.style?.format === 'geostyler' && node?.style?.body?.rules?.length > 0;
            return hasStyle
                ? (
                    <>
                        <li>
                            <VectorLegend
                                style={node?.style}
                            />
                        </li>
                    </>
                )
                : null;
        }
        if (layerType === 'wms') {
            return (
                <>
                    <li>
                        <WMSLegend
                            node={node}
                            currentZoomLvl={config?.zoom}
                            scales={config?.scales}
                            language={config?.language}
                            {...config?.layerOptions?.legendOptions}
                        />
                    </li>
                </>
            );
        }
        return null;
    };

    const forceExpanded = config?.expanded !== undefined;
    const expanded = forceExpanded ? config?.expanded : node?.expanded;
    const content = getContent(error);

    return (
        <>
            <NodeHeader
                node={node}
                className={nodeType}
                filterText={filterText}
                currentLocale={config?.currentLocale}
                tooltipOptions={config?.layerOptions?.tooltipOptions}
                onClick={onSelect}
                showTitleTooltip={config?.showTitleTooltip}
                showFullTitle={config?.showFullTitle}
                beforeTitle={
                    <>
                        {sortHandler}
                        <ExpandButton
                            hide={!(!forceExpanded && content)}
                            expanded={expanded}
                            onChange={onChange}
                        />
                        {visibilityCheck}
                        {nodeIcon}
                    </>
                }
                afterTitle={
                    <>
                        {visibilityWarningMessageId && <NodeTool glyph="info-sign" tooltipId={visibilityWarningMessageId} />}
                        {
                        // indicators are deprecated
                        // use node items instead
                        }
                        {config?.layerOptions?.indicators ? castArray(config.layerOptions.indicators).map( indicator =>
                            (indicator.type === 'dimension'
                                ? find(node?.dimensions || [], indicator.condition) : false)
                                ? indicator.glyph && <NodeTool onClick={false} key={indicator.key} glyph={indicator.glyph} {...indicator.props} />
                                : null)
                            : null}
                        {nodeToolItems.map(({ Component, name }) => {
                            return (<Component key={name} itemComponent={NodeTool} node={node} onChange={onChange} nodeType={nodeType} nodeTypes={nodeTypes}/>);
                        })}
                    </>
                }
            />
            {expanded && content ? <ul>
                {content}
            </ul> : null}
            <OpacitySlider
                hide={!!error || config?.hideOpacitySlider || ['3dtiles'].includes(node?.type)}
                opacity={node?.opacity}
                disabled={!node.visibility}
                hideTooltip={!config.showOpacityTooltip}
                onChange={opacity => onChange({ opacity })}
            />
        </>
    );
};

const DefaultLayer = ({
    node: nodeProp,
    parentId,
    connectDragPreview = cmp => cmp,
    connectDragSource = cmp => cmp,
    index,
    sort,
    filter = () => true,
    filterText,
    replaceNodeOptions = node => node,
    onChange = () => {},
    onContextMenu = () => {},
    onSelect = () => {},
    getNodeStyle = () => {},
    getNodeClassName = () => '',
    parentHasNodesMutuallyExclusive,
    nodeType,
    sortable,
    config,
    nodeToolItems = [],
    nodeItems = [],
    nodeTypes,
    theme
}) => {

    const replacedNode = replaceNodeOptions(nodeProp, nodeType);
    const error = replacedNode?.error ?? getLayerErrorMessage(replacedNode);
    const visibilityWarningMessageId = getLayerVisibilityWarningMessageId(replacedNode, config);
    const node = {
        ...nodeProp,
        error,
        visibilityWarningMessageId
    };

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
    const icon = getLayerTypeGlyph(node);
    const layerNodeProp = {
        index,
        parentId,
        theme,
        node,
        filterText,
        onChange: handleOnChange,
        parentHasNodesMutuallyExclusive,
        config,
        nodeToolItems,
        onSelect: handleOnSelect,
        nodeType,
        error,
        visibilityWarningMessageId,
        nodeTypes,
        sortHandler:
            sortable ? connectDragSource(
                <div className="grab-handle" onClick={(event) => event.stopPropagation()}>
                    <Glyphicon glyph="grab-handle" />
                </div>
            ) : <div className="grab-handle disabled" />,
        visibilityCheck: (<VisibilityCheck
            error={error}
            hide={config?.hideVisibilityButton}
            mutuallyExclusive={parentHasNodesMutuallyExclusive}
            value={!!node?.visibility}
            onChange={(visibility) => {
                handleOnChange({ visibility });
            }}
        />),
        nodeIcon: <Glyphicon className="ms-node-icon" glyph={icon} />
    };
    const style = getNodeStyle(node, nodeType);
    const className = getNodeClassName(node, nodeType);
    const filteredNodeItems = nodeItems
        .filter(({ selector = () => false }) => selector(layerNodeProp));
    return (
        connectDragPreview(
            <li
                className={`ms-node ms-node-layer${className ? ` ${className}` : ''}`}
                style={style}
                onContextMenu={handleOnContextMenu}>
                <DropNode
                    sortable={sortable}
                    sort={sort}
                    nodeType={nodeType}
                    index={index}
                    id={node.id}
                    parentId={parentId}
                >
                    <InlineLoader loading={node?.loading}/>
                    {filteredNodeItems.length
                        ? filteredNodeItems.map(({ Component, name }) => {
                            return (
                                <Component key={name} {...layerNodeProp} defaultLayerNodeComponent={DefaultLayerNode} />
                            );
                        })
                        : <DefaultLayerNode
                            {...layerNodeProp}
                        />}
                </DropNode>
            </li>
        )
    );
};

const DraggableDefaultLayer = (props) => <DragNode {...props} component={DefaultLayer}/>;

export default DraggableDefaultLayer;
