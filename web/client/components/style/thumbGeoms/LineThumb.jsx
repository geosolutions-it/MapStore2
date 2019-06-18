/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');

class LineThumb extends React.Component {

    static propTypes = {
        linecap: PropTypes.string,
        linejoin: PropTypes.string,
        stroke: PropTypes.string,
        fillColor: PropTypes.string,
        strokeWidth: PropTypes.number,
        style: PropTypes.object
    };

    static defaultProps = {
        style: {},
        linecap: 'round', // butt round square
        linejoin: 'round', // miter round bevel
        strokeWidth: 3,
        stroke: '#ffcc33',
        fillColor: '#FFFFFF'
    };

    render() {
        const {color, weight, fillColor} = this.props.style;
        return (
            <div className="ms-thumb-geom">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox={"0 0 100 100"}>
                <path
                    d={"M25 75 L50 50 L75 75 L100 75"}
                    strokeLinecap={this.props.linecap}
                    strokeLinejoin={this.props.linejoin}
                    stroke={color || this.props.stroke}
                    strokeWidth={weight || this.props.strokeWidth}
                    fill={fillColor || this.props.fillColor}/>
            </svg>
        </div>
        );
    }
}

module.exports = LineThumb;
