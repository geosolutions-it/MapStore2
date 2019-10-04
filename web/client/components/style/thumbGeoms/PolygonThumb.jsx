/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');

class PolygonThumb extends React.Component {

    static propTypes = {
        stroke: PropTypes.string,
        fill: PropTypes.string,
        fillOpacity: PropTypes.number,
        strokeWidth: PropTypes.number,
        opacity: PropTypes.number,
        styleRect: PropTypes.object,
        viewBox: PropTypes.string,
        rectParams: PropTypes.object
    };

    static defaultProps = {
        stroke: '#ffcc33',
        fill: '#FFFFFF',
        fillOpacity: 0.2,
        strokeWidth: 3,
        opacity: 1,
        styleRect: {},
        viewBox: "0 0 100 100",
        rectParams: {
            height: "50",
            width: "50",
            x: "25",
            y: "25"
        }
    };

    render() {
        const {color, weight, fillColor, fillOpacity, opacity} = this.props.styleRect;
        const {height, width, x, y} = this.props.rectParams;
        return (
            <div className="ms-thumb-geom">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox={this.props.viewBox}>
                    <rect width={width} height={height} x={x} y={y} style={{
                        fill: fillColor || this.props.fill,
                        strokeWidth: weight || this.props.strokeWidth,
                        stroke: color || this.props.stroke,
                        fillOpacity: fillOpacity || this.props.fillOpacity,
                        opacity: opacity || this.props.opacity
                    }}
                    />
                </svg>
            </div>
        );
    }
}

module.exports = PolygonThumb;
