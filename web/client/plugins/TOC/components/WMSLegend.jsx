/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import pick from 'lodash/pick';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import StyleBasedWMSJsonLegend from './StyleBasedWMSJsonLegend';
import Legend from './Legend';
import { getMiscSetting } from '../../../utils/ConfigUtils';
/**
 * WMSLegend renders the wms legend image
 * @prop {object} node layer node options
 * @prop {object} legendContainerStyle style of legend container
 * @prop {object} legendStyle style of legend image
 * @prop {boolean} showOnlyIfVisible show only if the layer node is visible
 * @prop {number} currentZoomLvl map zoom level
 * @prop {array} scales list of available scales on the map
 * @prop {string} WMSLegendOptions options for the WMS get legend graphic LEGEND_OPTIONS parameter
 * @prop {boolean} scaleDependent if true add the scale parameter to the legend graphic request
 * @prop {string} language current language code
 * @prop {number} legendWidth width of the legend symbols
 * @prop {number} legendHeight height of the legend symbols
 */
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
        onChange: PropTypes.func,
        projection: PropTypes.string,
        mapSize: PropTypes.object,
        mapBbox: PropTypes.object
    };

    static defaultProps = {
        legendContainerStyle: {},
        showOnlyIfVisible: false,
        scaleDependent: true,
        onChange: () => {}
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
        this.setState({ containerWidth, ...this.state }); // eslint-disable-line -- TODO: need to be fixed
    }
    getLegendProps = () => {
        return pick(this.props, ['currentZoomLvl', 'scales', 'scaleDependent', 'language', 'projection', 'mapSize', 'mapBbox']);
    }
    render() {
        let node = this.props.node || {};
        const experimentalInteractiveLegend = getMiscSetting('experimentalInteractiveLegend', false);
        const showLegend = this.canShow(node) && node.type === "wms" && node.group !== "background";
        const isJsonLegend = !!(experimentalInteractiveLegend && this.props.node?.enableInteractiveLegend);
        const useOptions = showLegend && this.useLegendOptions();
        if (showLegend && !isJsonLegend) {
            return (
                <div style={!this.setOverflow() ? this.props.legendContainerStyle : this.state.legendContainerStyle} ref={this.containerRef}>
                    <Legend
                        style={!this.setOverflow() ? this.props.legendStyle : {}}
                        layer={node}
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
                        {...this.getLegendProps()}
                    />
                </div>
            );
        }
        if (showLegend) {
            return (
                <div style={!this.setOverflow() ? this.props.legendContainerStyle : this.state.legendContainerStyle} ref={this.containerRef}>
                    <StyleBasedWMSJsonLegend
                        style={!this.setOverflow() ? this.props.legendStyle : {}}
                        layer={node}
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
                        onChange={this.props.onChange}
                        {...this.getLegendProps()}
                        interactive
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
