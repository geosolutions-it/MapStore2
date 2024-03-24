/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import { isEmpty, isNumber } from 'lodash';
import Legend from './legend/Legend';
import StyleBasedWMSJsonLegend from './StyleBasedWMSJsonLegend';
class WMSLegend extends React.Component {
    static propTypes = {
        node: PropTypes.object,
        legendContainerStyle: PropTypes.object,
        legendStyle: PropTypes.object,
        showOnlyIfVisible: PropTypes.bool,
        currentZoomLvl: PropTypes.number,
        scales: PropTypes.array,
        WMSLegendOptions: PropTypes.string,
        scaleDependent: PropTypes.bool,
        language: PropTypes.string,
        legendWidth: PropTypes.number,
        legendHeight: PropTypes.number,
        onLayerFilterByLegend: PropTypes.func
    };

    static defaultProps = {
        legendContainerStyle: {},
        showOnlyIfVisible: false,
        scaleDependent: true,
        onLayerFilterByLegend: () => {}
    };

    constructor(props) {
        super(props);
        this.containerRef = React.createRef();
    }
    state = {
        containerWidth: 0,
        legendContainerStyle: {overflowX: "auto"}
    };

    componentDidMount() {
        const containerWidth = this.containerRef.current && this.containerRef.current.clientWidth;
        this.setState({ containerWidth, ...this.state });
    }

    render() {
        let node = this.props.node || {};
        const showLegend = this.canShow(node) && node.type === "wms" && node.group !== "background";
        const isJsonLegend = this.props.node?.enableInteractiveLegend;
        const useOptions = showLegend && this.useLegendOptions();
        if (showLegend && !isJsonLegend) {
            return (
                <div style={!this.setOverflow() ? this.props.legendContainerStyle : this.state.legendContainerStyle} ref={this.containerRef}>
                    <Legend
                        style={!this.setOverflow() ? this.props.legendStyle : {}}
                        layer={node}
                        currentZoomLvl={this.props.currentZoomLvl}
                        scales={this.props.scales}
                        legendHeight={
                            useOptions &&
                            this.props.node.legendOptions &&
                            this.props.node.legendOptions.legendHeight ||
                            this.props.legendHeight ||
                            undefined
                        }
                        legendWidth={
                            useOptions &&
                            this.props.node.legendOptions &&
                            this.props.node.legendOptions.legendWidth ||
                            this.props.legendWidth ||
                            undefined
                        }
                        legendOptions={this.props.WMSLegendOptions}
                        scaleDependent={this.props.scaleDependent}
                        language={this.props.language}
                    />
                </div>
            );
        } else if (showLegend) {
            return (
                <div style={!this.setOverflow() ? this.props.legendContainerStyle : this.state.legendContainerStyle} ref={this.containerRef}>
                    <StyleBasedWMSJsonLegend
                        onLayerFilterByLegend={this.props.onLayerFilterByLegend}
                        style={!this.setOverflow() ? this.props.legendStyle : {}}
                        layer={node}
                        currentZoomLvl={this.props.currentZoomLvl}
                        scales={this.props.scales}
                        legendHeight={
                            useOptions &&
                            this.props.node.legendOptions &&
                            this.props.node.legendOptions.legendHeight ||
                            this.props.legendHeight ||
                            undefined
                        }
                        legendWidth={
                            useOptions &&
                            this.props.node.legendOptions &&
                            this.props.node.legendOptions.legendWidth ||
                            this.props.legendWidth ||
                            undefined
                        }
                        legendOptions={this.props.WMSLegendOptions}
                        scaleDependent={this.props.scaleDependent}
                        language={this.props.language}
                    />
                </div>
            );
        }
        return null;
    }

    canShow = (node) => {
        return node.visibility || !this.props.showOnlyIfVisible;
    };

    useLegendOptions = () =>{
        return (
            !isEmpty(this.props.node.legendOptions) &&
            isNumber(this.props.node.legendOptions.legendHeight) &&
            isNumber(this.props.node.legendOptions.legendWidth)
        );
    };

    setOverflow = () => {
        return this.useLegendOptions() &&
            this.props.node.legendOptions.legendWidth > this.state.containerWidth;
    }
}

export default WMSLegend;
