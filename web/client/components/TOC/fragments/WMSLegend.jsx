/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const { isEmpty, isNumber } = require('lodash');
const Legend = require('./legend/Legend');

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
        legendWidth: PropTypes.number,
        legendHeight: PropTypes.number
    };

    static defaultProps = {
        legendContainerStyle: {},
        showOnlyIfVisible: false,
        scaleDependent: true
    };

    render() {
        let node = this.props.node || {};
        const showLegend = this.canShow(node) && node.type === "wms" && node.group !== "background";
        const useOptions = showLegend && this.useLegendOptions();
        if (showLegend) {
            return (
                <div style={this.props.legendContainerStyle}>
                    <Legend
                        style={this.props.legendStyle}
                        layer={node}
                        currentZoomLvl={this.props.currentZoomLvl}
                        scales={this.props.scales}
                        legendHeigth={useOptions && this.props.node.legendOptions && this.props.node.legendOptions.legendHeight || this.props.legendHeight ||  undefined}
                        legendWidth={useOptions && this.props.node.legendOptions && this.props.node.legendOptions.legendWidth || this.props.legendWidth || undefined}
                        legendOptions={this.props.WMSLegendOptions}
                        scaleDependent={this.props.scaleDependent}/>
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
    }
}

module.exports = WMSLegend;
