/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const Node = require('./Node');
const {isObject, isArray} = require('lodash');
const {Grid, Row, Col} = require('react-bootstrap');
const VisibilityCheck = require('./fragments/VisibilityCheck');
const Title = require('./fragments/Title');
const WMSLegend = require('./fragments/WMSLegend');
const LayersTool = require('./fragments/LayersTool');
const Slider = require('../misc/Slider');

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
        showFullTitleOnExpand: PropTypes.bool
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
        visibilityCheckType: "glyph",
        additionalTools: [],
        currentLocale: 'en-US',
        selectedNodes: [],
        filterText: '',
        onUpdateNode: () => {},
        filter: () => true,
        titleTooltip: false,
        showFullTitleOnExpand: false
    };

    getTitle = (layer) => {
        const translation = isObject(layer.title) ? layer.title[this.props.currentLocale] || layer.title.default : layer.title;
        return translation || layer.name;
    };

    renderOpacitySlider = () => {
        const layerOpacity = this.props.node.opacity !== undefined ? Math.round(this.props.node.opacity * 100) : 100;
        return this.props.activateOpacityTool ?
            <Slider
                disabled={!this.props.node.visibility}
                start={[layerOpacity]}
                range={{min: 0, max: 100}}
                onChange={(opacity) => {
                    if (isArray(opacity) && opacity[0]) {
                        this.props.onUpdateNode(this.props.node.id, 'layers', { opacity: parseFloat(opacity[0].replace(' %', '')) / 100 });
                    }
                }}/>
        : null;
    }

    renderCollapsible = () => {
        return (
            <div key="legend" position="collapsible" className="collapsible-toc">
                <Grid fluid>
                    {this.props.showFullTitleOnExpand ? <Row><Col xs={12} className="toc-full-title">{this.getTitle(this.props.node)}</Col></Row> : null}
                    {this.props.activateLegendTool ?
                        <Row>
                            <Col xs={12}>
                                <WMSLegend node={this.props.node} currentZoomLvl={this.props.currentZoomLvl} scales={this.props.scales} {...this.props.legendOptions} />
                            </Col>
                        </Row> : null}
                </Grid>
                {this.renderOpacitySlider()}
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

    renderNode = (grab, hide, selected, error, warning, other) => {
        const isEmpty = !this.props.activateLegendTool && !this.props.showFullTitleOnExpand;
        return (
            <Node className={'toc-default-layer' + hide + selected + error + warning} sortableStyle={this.props.sortableStyle} style={this.props.style} type="layer" {...other}>
                <div className="toc-default-layer-head">
                    {grab}
                    {this.renderVisibility()}
                    <Title tooltip={this.props.titleTooltip} filterText={this.props.filterText} node={this.props.node} currentLocale={this.props.currentLocale} onClick={this.props.onSelect} onContextMenu={this.props.onContextMenu} />
                    {this.props.node.loading ? <div className="toc-inline-loader"></div> : this.renderToolsLegend(isEmpty)}
                </div>
                {!this.props.activateOpacityTool || this.props.node.expanded || !this.props.node.visibility || this.props.node.loadingError === 'Error' ? null : this.renderOpacitySlider()}
                {isEmpty ? null : this.renderCollapsible()}
            </Node>
        );
    }

    render() {
        let {children, propertiesChangeHandler, onToggle, ...other } = this.props;

        const hide = !this.props.node.visibility || this.props.node.invalid ? ' visibility' : '';
        const selected = this.props.selectedNodes.filter((s) => s === this.props.node.id).length > 0 ? ' selected' : '';
        const error = this.props.node.loadingError === 'Error' ? ' layer-error' : '';
        const warning = this.props.node.loadingError === 'Warning' ? ' layer-warning' : '';
        const grab = other.isDraggable ? <LayersTool key="grabTool" tooltip="toc.grabLayerIcon" className="toc-grab" ref="target" glyph="menu-hamburger"/> : <span className="toc-layer-tool toc-grab"/>;
        const filteredNode = this.filterLayers(this.props.node) ? this.renderNode(grab, hide, selected, error, warning, other) : null;
        if (this.props.filter(this.props.node)) {
            return !this.props.filterText ? this.renderNode(grab, hide, selected, error, warning, other) : filteredNode;
        }
        return null;
    }

    filterLayers = (layer) => {
        const translation = isObject(layer.title) ? layer.title[this.props.currentLocale] || layer.title.default : layer.title;
        const title = translation || layer.name;
        return title.toLowerCase().indexOf(this.props.filterText.toLowerCase()) !== -1;
    };
}

module.exports = DefaultLayer;
