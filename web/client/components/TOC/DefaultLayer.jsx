/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import Node from './Node';
import { isObject, castArray, find } from 'lodash';
import { Grid, Row, Col, Glyphicon } from 'react-bootstrap';
import draggableComponent from './enhancers/draggableComponent';
import VisibilityCheck from './fragments/VisibilityCheck';
import Title from './fragments/Title';
import WMSLegend from './fragments/WMSLegend';
import LayersTool from './fragments/LayersTool';
import OpacitySlider from './fragments/OpacitySlider';
import ToggleFilter from './fragments/ToggleFilter';
import tooltip from '../misc/enhancers/tooltip';
import localizedProps from '../misc/enhancers/localizedProps';
import { isInsideResolutionsLimits } from '../../utils/LayersUtils';

const GlyphIndicator = localizedProps('tooltip')(tooltip(Glyphicon));

/**
 * Default layer node for TOC
 */
class DefaultLayer extends React.Component {
    static propTypes = {
        node: PropTypes.object,
        propertiesChangeHandler: PropTypes.func,
        onToggle: PropTypes.func,
        onContextMenu: PropTypes.func,
        onSelect: PropTypes.func,
        style: PropTypes.object,
        sortableStyle: PropTypes.object,
        activateLegendTool: PropTypes.bool,
        activateOpacityTool: PropTypes.bool,
        indicators: PropTypes.array,
        visibilityCheckType: PropTypes.string,
        currentZoomLvl: PropTypes.number,
        scales: PropTypes.array,
        additionalTools: PropTypes.array,
        legendOptions: PropTypes.object,
        currentLocale: PropTypes.string,
        selectedNodes: PropTypes.array,
        filterText: PropTypes.string,
        onUpdateNode: PropTypes.func,
        titleTooltip: PropTypes.bool,
        filter: PropTypes.func,
        showFullTitleOnExpand: PropTypes.bool,
        hideOpacityTooltip: PropTypes.bool,
        tooltipOptions: PropTypes.object,
        connectDragPreview: PropTypes.func,
        connectDragSource: PropTypes.func,
        connectDropTarget: PropTypes.func,
        isDraggable: PropTypes.bool,
        isDragging: PropTypes.bool,
        isOver: PropTypes.bool,
        language: PropTypes.string,
        resolution: PropTypes.number
    };

    static defaultProps = {
        style: {},
        sortableStyle: {},
        propertiesChangeHandler: () => {},
        onToggle: () => {},
        onContextMenu: () => {},
        onSelect: () => {},
        activateLegendTool: false,
        activateOpacityTool: true,
        indicators: [],
        visibilityCheckType: "glyph",
        additionalTools: [],
        currentLocale: 'en-US',
        joinStr: ' - ',
        selectedNodes: [],
        filterText: '',
        onUpdateNode: () => {},
        filter: () => true,
        titleTooltip: false,
        showFullTitleOnExpand: false,
        hideOpacityTooltip: false,
        connectDragPreview: (x) => x,
        connectDragSource: (x) => x,
        connectDropTarget: (x) => x
    };

    getTitle = (layer) => {
        const translation = isObject(layer.title) ? layer.title[this.props.currentLocale] || layer.title.default : layer.title;
        return translation || layer.name;
    };

    getVisibilityMessage = () => {
        if (this.props.node.exclusiveMapType) return this.props.node?.type === '3dtiles' && 'toc.notVisibleSwitchTo3D';
        const maxResolution = this.props.node.maxResolution || Infinity;
        return this.props.resolution >=  maxResolution
            ? 'toc.notVisibleZoomIn'
            : 'toc.notVisibleZoomOut';
    };

    renderOpacitySlider = (hideOpacityTooltip) => {
        return (this.props.activateOpacityTool && this.props.node?.type !== '3dtiles') ? (
            <OpacitySlider
                opacity={this.props.node.opacity}
                disabled={!this.props.node.visibility}
                hideTooltip={hideOpacityTooltip}
                onChange={opacity => this.props.onUpdateNode(this.props.node.id, 'layers', {opacity})}/>
        ) : null;
    }

    renderCollapsible = () => {
        return (
            <div key="legend" position="collapsible" className="collapsible-toc">
                <Grid fluid>
                    {this.props.showFullTitleOnExpand ? <Row><Col xs={12} className="toc-full-title">{this.getTitle(this.props.node)}</Col></Row> : null}
                    {this.props.activateLegendTool ?
                        <Row>
                            <Col xs={12}>
                                <WMSLegend node={this.props.node} currentZoomLvl={this.props.currentZoomLvl} scales={this.props.scales} language={this.props.language} {...this.props.legendOptions} />
                            </Col>
                        </Row> : null}
                </Grid>
                {this.renderOpacitySlider(this.props.hideOpacityTooltip)}
            </div>);
    };

    renderVisibility = () => {
        return this.props.node.loadingError === 'Error' ?
            (<LayersTool key="loadingerror"
                glyph="exclamation-mark text-danger"
                tooltip="toc.loadingerror"
                className="toc-error" />)
            :
            (<VisibilityCheck key="visibilitycheck"
                tooltip={this.props.node.loadingError === 'Warning' ? 'toc.toggleLayerVisibilityWarning' : 'toc.toggleLayerVisibility'}
                node={this.props.node}
                checkType={this.props.visibilityCheckType}
                propertiesChangeHandler={this.props.propertiesChangeHandler} />);
    }

    renderToolsLegend = (isEmpty) => {
        return this.props.node.loadingError === 'Error' || isEmpty ?
            null
            :
            (<LayersTool
                node={this.props.node}
                tooltip="toc.displayLegendAndTools"
                key="toollegend"
                className="toc-legend"
                ref="target"
                glyph="chevron-left"
                onClick={(node) => this.props.onToggle(node.id, node.expanded)} />);
    }
    renderIndicators = () => {
        /** initial support to render icons in TOC nodes (now only type = "dimension" supported) */
        return castArray(this.props.indicators).map( indicator =>
            (indicator.type === "dimension" ? find(this.props.node && this.props.node.dimensions || [], indicator.condition) : false)
                ? indicator.glyph && <GlyphIndicator key={indicator.key} glyph={indicator.glyph} {...indicator.props} />
                : null);
    }
    renderNode = (grab, hide, selected, error, warning, isDummy, other) => {
        const isEmpty = this.props.node.type === 'wms' && !this.props.activateLegendTool && !this.props.showFullTitleOnExpand
        || this.props.node.type !== 'wms' && !this.props.showFullTitleOnExpand;
        const head = (isDummy ?
            <div style={{padding: 0, height: 10}} className="toc-default-layer-head"/> :
            <div className="toc-default-layer-head">
                {grab}
                {this.renderVisibility()}
                <ToggleFilter node={this.props.node} propertiesChangeHandler={this.props.propertiesChangeHandler}/>
                <Title
                    tooltipOptions={this.props.tooltipOptions}
                    tooltip={this.props.titleTooltip}
                    filterText={this.props.filterText}
                    node={this.props.node}
                    currentLocale={this.props.currentLocale}
                    onClick={this.props.onSelect}
                    onContextMenu={this.props.onContextMenu}
                />
                {this.props.node.loading ? <div className="toc-inline-loader"></div> : this.renderToolsLegend(isEmpty)}
                {!isInsideResolutionsLimits(this.props.node, this.props.resolution) || this.props.node.exclusiveMapType ? <GlyphIndicator glyph="info-sign" tooltipId={this.getVisibilityMessage()} style={{ 'float': 'right' }}/> : null}
                {this.props.indicators ? this.renderIndicators() : null}
            </div>
        );
        return (
            <Node className={(this.props.isDragging || this.props.node.placeholder ? "is-placeholder " : "") + 'toc-default-layer' + hide + selected + error + warning} style={this.props.style} type="layer" {...other}>
                {other.isDraggable && !isDummy ? this.props.connectDragPreview(head) : head}
                {isDummy || !this.props.activateOpacityTool || this.props.node.expanded || !this.props.node.visibility || this.props.node.loadingError === 'Error' ? null : this.renderOpacitySlider(this.props.hideOpacityTooltip)}
                {isDummy || isEmpty ? null : this.renderCollapsible()}
            </Node>
        );
    }

    render() {
        let {children, propertiesChangeHandler, onToggle, connectDragSource, connectDropTarget, ...other } = this.props;
        const hide = !this.props.node.visibility || this.props.node.invalid || this.props.node.exclusiveMapType || !isInsideResolutionsLimits(this.props.node, this.props.resolution) ? ' visibility' : '';
        const selected = this.props.selectedNodes.filter((s) => s === this.props.node.id).length > 0 ? ' selected' : '';
        const error = this.props.node.loadingError === 'Error' ? ' layer-error' : '';
        const warning = this.props.node.loadingError === 'Warning' ? ' layer-warning' : '';
        const grab = other.isDraggable ? <LayersTool key="grabTool" tooltip="toc.grabLayerIcon" className="toc-grab" ref="target" glyph="menu-hamburger"/> : <span className="toc-layer-tool toc-grab"/>;
        const isDummy = !!this.props.node.dummy;
        const filteredNode = !isDummy && this.filterLayers(this.props.node) ? this.renderNode(grab, hide, selected, error, warning, isDummy, other) : null;
        const tocListItem = (
            <div style={isDummy ? {opacity: 0, boxShadow: 'none'} : {}} className="toc-list-item">
                {!this.props.filterText || (this.props.filterText && isDummy) ? this.renderNode(grab, hide, selected, error, warning, isDummy, other) : filteredNode}
            </div>
        );
        if (other.node.showComponent !== false && !other.node.hide && this.props.filter(this.props.node)) {
            return connectDropTarget(other.isDraggable && !isDummy ? connectDragSource(tocListItem) : tocListItem);
        }
        return null;
    }

    filterLayers = (layer) => {
        const translation = isObject(layer.title) ? layer.title[this.props.currentLocale] || layer.title.default : layer.title;
        const title = translation || layer.name;
        return title.toLowerCase().indexOf(this.props.filterText.toLowerCase()) !== -1;
    };

}

export default draggableComponent('LayerOrGroup', DefaultLayer);
