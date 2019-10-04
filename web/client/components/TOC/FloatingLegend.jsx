/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const PropTypes = require('prop-types');
const {isEqual, delay} = require('lodash');

const {Glyphicon, Panel, Grid, Row, Col, Button: ButtonB} = require('react-bootstrap');
const {Resizable} = require('react-resizable');
const ContainerDimensions = require('react-container-dimensions').default;
const tooltip = require('../misc/enhancers/tooltip');
const Button = tooltip(ButtonB);
const SideGrid = require('../misc/cardgrids/SideGrid');
const OpacitySlider = require('./fragments/OpacitySlider');
const WMSLegend = require('./fragments/WMSLegend');

/**
 * Component for rendering a legend component.
 * This component shows a list of layers with visibility and opacity controls
 * @memberof components.TOC
 * @name FloatingLegend
 * @class
 * @prop {array} layers array of layer objects
 * @prop {bool} expanded expanded state
 * @prop {number} width width of legend
 * @prop {number} height height of legend
 * @prop {title} title title of map
 * @prop {object} legendProps props for WMSLegend
 * @prop {function} onChange return three arguments, layerId, node type and object with changed value of layer
 * @prop {function} onResize return changed size of legend, e.g {height: 700}
 * @prop {function} onExpand return current expanded state
 * @prop {node} toggleButton component added on legend header, left side
 * @prop {number} minHeight minimum height of legend
 * @prop {number} maxHeight maximum height of legend
 * @prop {number} deltaHeight additional height to increase the evaluated list height
 * @prop {bool} disabled disable and hide the component
 * @prop {number} currentZoomLvl current zoom level of map
 * @prop {array} scales array of supported scales
 * @prop {bool} disableOpacitySlider disable and hide opacity slider
 * @prop {bool} expandedOnMount show expanded legend when component did mount
 * @prop {bool} hideOpacityTooltip hide toolip on opacity sliders
 */

class FloatingLegend extends React.Component {

    static propTypes = {
        layers: PropTypes.array,
        expanded: PropTypes.bool,
        width: PropTypes.number,
        height: PropTypes.number,
        title: PropTypes.string,
        legendProps: PropTypes.object,
        onChange: PropTypes.func,
        onResize: PropTypes.func,
        onExpand: PropTypes.func,
        toggleButton: PropTypes.node,
        minHeight: PropTypes.number,
        maxHeight: PropTypes.number,
        disabled: PropTypes.bool,
        currentZoomLvl: PropTypes.number,
        scales: PropTypes.array,
        disableOpacitySlider: PropTypes.bool,
        deltaHeight: PropTypes.number,
        expandedOnMount: PropTypes.bool,
        hideOpacityTooltip: PropTypes.bool
    };

    static defaultProps = {
        layers: [],
        expanded: true,
        width: 300,
        height: 900,
        title: '',
        legendProps: {},
        onChange: () => {},
        onResize: () => {},
        onExpand: () => {},
        toggleButton: <Glyphicon glyph="1-map" style={{margin: '0 8px'}}/>,
        minHeight: 150,
        maxHeight: 9999,
        deltaHeight: 110,
        expandedOnMount: true
    };

    state = {};

    componentDidMount() {
        this.props.onExpand(this.props.expandedOnMount);
    }

    componentDidUpdate(prevProps) {
        delay(() => {
            if (!isEqual(this.props.layers, prevProps.layers)
            || this.props.maxHeight !== prevProps.maxHeight
            || this.props.disabled !== prevProps.disabled) {
                const listHeight = this.findListHeight();
                if (this.props.maxHeight < this.props.height) {
                    this.props.onResize({
                        height: this.props.maxHeight
                    });
                } else if (listHeight && listHeight < this.props.height) {
                    this.props.onResize({
                        height: listHeight
                    });
                }
            }
            if (this.props.layers.length !== prevProps.layers.length
            || this.props.expanded && !prevProps.expanded) {
                const listHeight = this.findListHeight();
                this.props.onResize({
                    height: listHeight < this.props.maxHeight ? listHeight : this.props.maxHeight
                });
            }
        }, 100);
    }

    render() {
        const expanded = this.props.expanded && this.props.layers && this.props.layers.length > 0;
        return this.props.layers && this.props.layers.length === 0 && !this.props.title &&
                <div
                    id="ms-legend-action"
                    className="ms-legend-action">
                    {this.props.toggleButton}
                </div>
            || !this.props.disabled && (
                <ContainerDimensions>
                    {({height: containerHeight}) =>
                        <Resizable
                            height={this.props.height}
                            axis="y"
                            minConstraints={[
                                this.props.width,
                                this.props.minHeight
                            ]}
                            maxConstraints={[
                                this.props.width,
                                this.state.listHeight && this.state.listHeight < this.props.maxHeight && this.state.listHeight
                            || containerHeight && containerHeight < this.props.maxHeight && containerHeight
                            || this.props.maxHeight
                            ]}
                            onResize={(e, data) =>
                                this.props.onResize({
                                    height: data.size && data.size.height
                                })
                            }>
                            <Panel
                                id="ms-legend-action"
                                className="ms-legend-action"
                                collapsible
                                header={
                                    <Grid fluid>
                                        <Row>
                                            <Col xs={12} className="ms-legend-header">
                                                {this.props.toggleButton}
                                                <div>
                                                    <h5>{this.props.title}</h5>
                                                </div>
                                                {this.props.layers && this.props.layers.length > 0 && <Button
                                                    tooltipId={this.props.expanded ? 'floatinglegend.hideLegend' : 'floatinglegend.showLegend'}
                                                    tooltipPosition="bottom"
                                                    className="no-border square-button-md"
                                                    onClick={() => this.props.onExpand(!this.props.expanded)}>
                                                    <Glyphicon glyph={this.props.expanded ? "chevron-down" : "chevron-left"} />
                                                </Button>}
                                            </Col>
                                        </Row>
                                    </Grid>
                                }
                                expanded={expanded}
                                footer={expanded && <Grid fluid/>}
                                style={{
                                    width: this.props.width,
                                    ...(this.props.height && expanded ? {height: this.props.minHeight > this.props.height ? this.props.minHeight : this.props.height} : {})
                                }}>
                                <SideGrid
                                    ref={list => { this.list = list; }}
                                    size="sm"
                                    items={this.props.layers.map(layer => ({
                                        title: !layer.title || layer.title === '' ? layer.name : layer.title,
                                        preview: <Glyphicon className="text-primary"
                                            glyph={layer.visibility ? 'eye-open' : 'eye-close'}
                                            onClick={() => this.props.onChange(layer.id, 'layers', {visibility: !layer.visibility})}/>,
                                        style: {
                                            opacity: layer.visibility ? 1 : 0.4
                                        },
                                        body: !layer.visibility ? null
                                            : (
                                                <div>
                                                    <Grid fluid>
                                                        <Row>
                                                            <Col xs={12} className="ms-legend-container">
                                                                <WMSLegend
                                                                    node={{...layer}}
                                                                    currentZoomLvl={this.props.currentZoomLvl}
                                                                    scales={this.props.scales}
                                                                    {...this.props.legendProps}/>
                                                            </Col>
                                                        </Row>
                                                    </Grid>
                                                    {!this.props.disableOpacitySlider &&
                                                        <OpacitySlider
                                                            opacity={layer.opacity}
                                                            disabled={!layer.visibility}
                                                            hideTooltip={this.props.hideOpacityTooltip}
                                                            onChange={opacity => this.props.onChange(layer.id, 'layers', {opacity})}/>
                                                    }
                                                </div>
                                            )
                                    })
                                    )}/>
                            </Panel>
                        </Resizable>
                    }
                </ContainerDimensions>
            );
    }

    findListHeight = () => {
        const list = this.list && ReactDOM.findDOMNode(this.list);
        const listHeight = list && list.clientHeight && list.clientHeight + this.props.deltaHeight || 9999;
        this.setState({ listHeight });
        return listHeight;
    };
}

module.exports = FloatingLegend;
