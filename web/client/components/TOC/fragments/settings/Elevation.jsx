/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const Slider = require('react-nouislider');
const ElevationChart = require('./ElevationChart');
const {Grid} = require('react-bootstrap');
const Message = require('../../../I18N/Message');
const LayersUtils = require('../../../../utils/LayersUtils');
require('react-widgets/lib/less/react-widgets.less');
require("./css/elevation.css");

module.exports = class extends React.Component {
    static propTypes = {
        elevationText: PropTypes.node,
        element: PropTypes.object,
        getDimension: PropTypes.func,
        onChange: PropTypes.func,
        chartStyle: PropTypes.object,
        showElevationChart: PropTypes.bool,
        containerWidth: PropTypes.number
    };

    static defaultProps = {
        onChange: () => {},
        showElevationChart: true,
        containerWidth: 500,
        elevationText: <Message msgId="elevation"/>,
        getDimension: LayersUtils.getDimension
    };

    shouldComponentUpdate(nextProps) {
        return this.props.element.id !== nextProps.element.id;
    }

    renderElevationsChart = (elevations) => {
        if (this.props.showElevationChart) {
            return (
                <ElevationChart
                    elevations={elevations}
                    chartStyle={{height: 200, width: this.props.containerWidth - 30, ...this.props.chartStyle}}/>
            );
        }
        return null;
    };

    renderElevationsSlider = (elevations) => {
        const values = elevations.values;
        const min = 0;
        const max = values.length - 1;
        const dif = max - min;
        const firstVal = parseFloat(values[0]);
        const lastVal = parseFloat(values[values.length - 1]);
        const start = this.props.element &&
                        this.props.element.params &&
                        this.props.element.params[elevations.name] || values[0];
        return (
            <div id="mapstore-elevation">
                <Slider
                    snap
                    start={[parseFloat(start)] || [0.0]}
                    range= {this.calculateRange(values, min, max, dif, firstVal, lastVal)}
                    behaviour= "tap"
                    pips= {{
                        mode: 'range',
                        stepped: true,
                        density: 10,
                        format: {
                            to: function( value ) {
                                return parseFloat(value).toFixed(1);
                            }
                        }
                    }}
                    tooltips={!this.props.showElevationChart}
                    onChange={(value) => {
                        this.props.onChange("params", Object.assign({}, {
                            [elevations.name]: value[0]
                        }));
                    }}/>
            </div>
        );
    };

    render() {
        const elevations = this.props.getDimension(this.props.element.dimensions, 'elevation');
        return (
            <Grid fluid style={{paddingTop: 15, paddingBottom: 15}}>
                <label
                    id="mapstore-elevation-label"
                    key="elevation-label"
                    className="control-label"
                    style={this.props.showElevationChart ? {marginBottom: "10px"} : {marginBottom: "90px"}}>
                    {this.props.elevationText}: ({elevations.units})
                </label>
                {this.renderElevationsChart(elevations)}
                <div>
                    <div key="elevation">
                        {this.renderElevationsSlider(elevations)}
                    </div>
                </div>
            </Grid>
        );
    }

    calculateRange = (values, min, max, dif, firstVal, lastVal) => {
        let arr = [];
        let percText = "";
        let range = {min: firstVal, max: lastVal};
        values.forEach(function(currentValue, i) {
            arr[i] = (i - min) / dif * 100;
            percText = arr[i] + "%";
            range[percText] = parseFloat(currentValue);
        });
        return range;
    };
};
