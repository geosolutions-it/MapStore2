/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useRef, useLayoutEffect, useState } from 'react';
import { castArray, find } from 'lodash';
import { Glyphicon } from 'react-bootstrap';
import { isInsideResolutionsLimits, getLayerTypeGlyph } from '../../../utils/LayersUtils';
import { getLayerErrorMessage } from '../utils/TOCUtils';
import DropNode from './DropNode';
import DragNode from './DragNode';
import { VisualizationModes } from '../../../utils/MapTypeUtils';
import InlineLoader from './InlineLoader';
import WMSLegend from './WMSLegend';
import ArcGISLegend from './ArcGISLegend';
import OpacitySlider from './OpacitySlider';
import VectorLegend from './VectorLegend';
import VisibilityCheck from './VisibilityCheck';
import NodeHeader from './NodeHeader';
import NodeTool from './NodeTool';
import ExpandButton from './ExpandButton';
import Message from '../../../components/I18N/Message';
import FilterNodeTool from './FilterNodeTool';

const getLayerVisibilityWarningMessageId = (node, config = {}) => {
    if (config.visualizationMode === VisualizationModes._2D && ['3dtiles', 'model'].includes(node.type)) {
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

const NodeLegend = ({
    config,
    node,
    visible,
    onChange
}) => {

    if (config?.layerOptions?.hideLegend) {
        return null;
    }
    const layerType = node?.type;
    if (['wfs', 'vector'].includes(layerType)) {
        const hasStyle = node?.style?.format === 'geostyler' && node?.style?.body?.rules?.length > 0;
        return hasStyle
            ? (
                <>
                    <li>
                        {visible ? <VectorLegend
                            style={node?.style}
                            layer={node}
                            interactive
                            onChange={onChange}
                        /> : null}
                    </li>
                </>
            )
            : null;
    }
    if (layerType === 'wms') {
        return (
            <>
                <li>
                    {visible ? <WMSLegend
                        node={node}
                        currentZoomLvl={config?.zoom}
                        scales={config?.scales}
                        language={config?.language}
                        {...config?.layerOptions?.legendOptions}
                        onChange={onChange}
                        interactive
                    /> : null}
                </li>
            </>
        );
    }
    if (layerType === 'arcgis') {
        return (
            <>
                <li>
                    {visible ? <ArcGISLegend
                        node={node}
                    /> : null}
                </li>
            </>
        );
    }
    return null;
};

const NodeContent = ({
    error,
    config,
    node,
    visible,
    onChange,
    items
}) => {
    if (error) {
        return null;
    }
    const contentProps = {
        config,
        node,
        onChange,
        visible
    };
    return <>
        {items.map(({ Component, name }) => {
            return (<Component key={name} {...contentProps} />);
        })}
        <NodeLegend {...contentProps} />
    </>;
};
/**
 * DefaultLayerNode renders internal part of the layer node
 * @prop {string} node layer node properties
 * @prop {string} filterText filter to apply to the layer title
 * @prop {function} onChange return the changes of a specific node
 * @prop {object} config optional configuration available for the nodes
 * @prop {array} nodeToolItems list of node tool component to customize specific tool available on a node, expected structure [ { name, Component } ]
 * @prop {array} nodeContentItems list of node content component to customize specific content available after expanding the node, expected structure [ { name, Component } ]
 * @prop {function} onSelect return the current selected node on click event
 * @prop {string} nodeType node type
 * @prop {object} nodeTypes constant values for node types
 * @prop {object} error error message object
 * @prop {string} visibilityWarningMessageId message id for visibility warning tool
 * @prop {component} sortHandler component for the sort handler
 * @prop {component} visibilityCheck component for the visibility check
 * @prop {component} nodeIcon component for the node icon
 */
const DefaultLayerNode = ({
    node,
    filterText,
    onChange,
    sortHandler,
    config = {},
    nodeToolItems = [],
    nodeContentItems = [],
    onSelect,
    nodeType,
    nodeTypes,
    error,
    visibilityWarningMessageId,
    visibilityCheck,
    nodeIcon
}) => {

    const contentNode = useRef();
    const [hasContent, setHasContent] = useState(false);
    useLayoutEffect(() => {
        setHasContent(!!contentNode?.current?.children?.length);
    }, [error, node, config]);

    const forceExpanded = config?.expanded !== undefined;
    const expanded = forceExpanded ? config?.expanded : node?.expanded;

    const componentProps = {
        node,
        onChange,
        nodeType,
        nodeTypes,
        config,
        itemComponent: NodeTool
    };

    const filterNode = !config?.layerOptions?.hideFilter
        ? [{ name: 'FilterLayer', Component: FilterNodeTool }]
        : [];

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
                            hide={!(!forceExpanded && hasContent)}
                            expanded={expanded}
                            onChange={onChange}
                        />
                        {visibilityCheck}
                        {nodeIcon}
                    </>
                }
                afterTitle={
                    <>
                        {error ? <NodeTool tooltip={<Message msgId={error.msgId} msgParams={error.msgParams} />}  glyph="exclamation-mark" /> : null}
                        {visibilityWarningMessageId && <NodeTool glyph="info-sign" tooltipId={visibilityWarningMessageId} />}
                        {config?.layerOptions?.indicators ? castArray(config.layerOptions.indicators).map( indicator =>
                            (indicator.type === 'dimension'
                                ? find(node?.dimensions || [], indicator.condition) : false)
                                ? indicator.glyph && <NodeTool onClick={false} key={indicator.key} glyph={indicator.glyph} {...indicator.props} />
                                : null)
                            : null}
                        {[ ...filterNode, ...nodeToolItems ].filter(({ selector = () => true }) => selector(componentProps)).map(({ Component, name }) => {
                            return (<Component key={name} {...componentProps} />);
                        })}
                    </>
                }
            />
            <ul ref={contentNode} style={!expanded || !hasContent ? { display: 'none' } : {}}>
                <NodeContent
                    error={error}
                    config={config}
                    node={node}
                    onChange={onChange}
                    visible={expanded}
                    items={nodeContentItems}
                />
            </ul>
            <OpacitySlider
                hide={!!error || config?.hideOpacitySlider || ['3dtiles', 'model'].includes(node?.type)}
                opacity={node?.opacity}
                disabled={!node.visibility}
                hideTooltip={!config.showOpacityTooltip}
                onChange={opacity => onChange({ opacity })}
            />
        </>
    );
};
/**
 * DefaultLayer renders the layer node representation
 * @prop {string} node layer node properties
 * @prop {string} parentId id of the parent node
 * @prop {number} index index of the node
 * @prop {object} sort sorting handlers
 * @prop {function} sort.beginDrag begin drag event
 * @prop {function} sort.hover hover dragging event
 * @prop {function} sort.drop drop event
 * @prop {function} filter if false hides the component
 * @prop {string} filterText filter to apply to the layer title
 * @prop {function} replaceNodeOptions function to change the node properties (used by LayersTree)
 * @prop {function} onChange return the changes of a specific node
 * @prop {function} onContextMenu return the context menu event of a specific node
 * @prop {function} onSelect return the current selected node on click event
 * @prop {function} getNodeStyle function to create a custom style (used by LayersTree)
 * @prop {function} getNodeClassName function to create a custom class name (used by LayersTree)
 * @prop {boolean} mutuallyExclusive if true changes the visibility icon to radio button
 * @prop {string} nodeType type of the current node
 * @prop {boolean} sortable if false hides the sort handler components
 * @prop {array} nodeItems list of node component to customize specific nodes, expected structure [ { name, Component, selector } ]
 * @prop {array} nodeToolItems list of node tool component to customize specific tool available on a node, expected structure [ { name, Component } ]
 * @prop {object} config optional configuration available for the nodes
 * @prop {number} config.resolution map resolution
 * @prop {array} config.resolutions list of available map resolutions
 * @prop {array} config.scales list of available map scales
 * @prop {number} config.zoom zoom level of the map
 * @prop {string} config.visualizationMode visualization mode of the map, `2D` or `3D`
 * @prop {boolean} config.hideOpacitySlider hide the opacity slider
 * @prop {string} config.language current language code
 * @prop {string} config.currentLocale current language code
 * @prop {boolean} config.showTitleTooltip show the title tooltip
 * @prop {boolean} config.showOpacityTooltip show the opacity tooltip
 * @prop {object} config.layerOptions specific options for layer nodes
 * @prop {object} config.layerOptions.tooltipOptions options for layer title tooltip
 * @prop {boolean} config.layerOptions.hideLegend hide the legend of the layer
 * @prop {object} config.layerOptions.legendOptions additional options for WMS legend
 * @prop {boolean} config.layerOptions.hideFilter hide the filter button
 */
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
    mutuallyExclusive,
    nodeType,
    sortable,
    config,
    nodeToolItems = [],
    nodeContentItems = [],
    nodeItems = [],
    nodeTypes,
    theme
}) => {

    const replacedNode = replaceNodeOptions(nodeProp, nodeType);
    const error = replacedNode?.error ?? getLayerErrorMessage(replacedNode);
    const visibilityWarningMessageId = getLayerVisibilityWarningMessageId(replacedNode, config);
    const node = {
        ...replacedNode,
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
        mutuallyExclusive,
        config,
        nodeToolItems,
        nodeContentItems,
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
            hide={config?.hideVisibilityButton}
            mutuallyExclusive={mutuallyExclusive}
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
                className={`ms-node ms-node-layer${node?.dragging ? ' dragging' : ''}${className ? ` ${className}` : ''}`}
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
