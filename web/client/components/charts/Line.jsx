/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const {castArray, isNil, isEqual} = require('lodash');
const PropTypes = require('prop-types');
const React = require('react');
const {LineChart, Line} = require('recharts');

const renderCartesianTools = require('./cartesian').default;

class LineChartWrapper extends React.Component {
    static propTypes = {
        autoColorOptions: PropTypes.object,
        colorGenerator: PropTypes.func,
        data: PropTypes.array,
        isAnimationActive: PropTypes.bool,
        height: PropTypes.number,
        margin: PropTypes.object,
        series: PropTypes.array,
        xAxisAngle: PropTypes.number,
        width: PropTypes.number
    }
    static defaultProps = {
        height: 300,
        series: [],
        width: 600
    }
    state = {
        marginLeft: 0,
        marginBottom: 0
    }
    UNSAFE_componentWillReceiveProps(newProps) {
        if (!isEqual(newProps.xAxisAngle, this.props.xAxisAngle)) {
            this.setState({marginLeft: 0, marginBottom: 0});
        }
    }
    render() {
        const {autoColorOptions, colorGenerator, data, isAnimationActive, height, margin, series, width, ...props} = this.props;
        const seriesArray = castArray(series);
        const COLORS = colorGenerator(seriesArray.length, autoColorOptions);
        const legendLabel = props.yAxisLabel ? [props.yAxisLabel] : [];
        const yAxisLabel = props.yAxis;
        const xAxisAngle = !isNil(props.xAxisAngle) ? [`angle${props.xAxisAngle}`] : [];

        // WORKAROUND: recharts does not re-render line and bar charts when changing colors, y axis, x axis rotation angle and legend label.
        const key = (COLORS || ["linechart"]).concat(legendLabel, yAxisLabel, xAxisAngle).join("");

        const onUpdateLabelLength = ({marginLeft, marginBottom}) => {
            this.setState((state) => ({
                marginBottom: (state.marginBottom < marginBottom) ? marginBottom : state.marginBottom,
                marginLeft: (state.marginLeft < marginLeft) ? marginLeft : state.marginLeft
            }));

        };
        const marginLeft = this.state.marginLeft;
        const marginBottom = this.state.marginBottom;
        return (
            <LineChart
                key={key}
                width={width}
                height={height}
                data={data}
                margin={props.xAxisAngle ? {
                    top: 20,
                    right: 30,
                    left: marginLeft + 5,
                    bottom: marginBottom + 20
                } : margin }
            >
                {seriesArray.map(({color, ...serie}, i) =>
                    <Line
                        key={`line-${i}`}
                        name={props.yAxisLabel ? props.yAxisLabel : null}
                        isAnimationActive={isAnimationActive}
                        stroke={COLORS[i]} {...serie} />)
                }
                {renderCartesianTools({...props, onUpdateLabelLength})}
                {props.children}
            </LineChart>
        );
    }
}

module.exports = LineChartWrapper;
