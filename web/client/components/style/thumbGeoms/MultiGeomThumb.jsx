/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');

class MultiGeomThumb extends React.Component {

    static propTypes = {
        linecap: PropTypes.string,
        linejoin: PropTypes.string,
        stroke: PropTypes.string,
        strokeWidth: PropTypes.number,
        styleMultiGeom: PropTypes.object,
        geometry: PropTypes.object,
        properties: PropTypes.object
    };

    static defaultProps = {
        linecap: 'round', // butt round square
        linejoin: 'round', // miter round bevel
        stroke: '#ffcc33',
        strokeWidth: 3,
        styleMultiGeom: {},
        geometry: {
            geometries: []
        },
        properties: {}
    };

    render() {

        let styleCircle = this.props.styleMultiGeom.Circle;
        let styleLine = this.props.styleMultiGeom.MultiLineString || this.props.styleMultiGeom.LineString;
        let stylePolygon = this.props.styleMultiGeom.MultiPolygon || this.props.styleMultiGeom.Polygon;
        let textPresent = this.props.properties && this.props.properties.textValues && !!this.props.properties.textValues.length;
        let circlePresent = this.props.properties && this.props.properties.circles && !!this.props.properties.circles.length;
        let styleText = textPresent ? this.props.styleMultiGeom.Text : {};
        let types;
        if (this.props.geometry.geometries && this.props.geometry.geometries.length) {
            types = (this.props.geometry.geometries).map(g => g.type);
        }
        if (this.props.geometry.features && this.props.geometry.features.length) {
            types = (this.props.geometry.features).map(g => g.geometry.type);
        }
        let polygonPresent = types.indexOf("Polygon") !== -1 || types.indexOf("MultiPolygon") !== -1;
        let lineStringPresent = types.indexOf("LineString") !== -1 || types.indexOf("MultiLineString") !== -1;
        return (
            <div className="ms-thumb-geom">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox={"0 0 100 100"}>
                {styleLine && lineStringPresent && (<path
                    d={polygonPresent ? "M10 15 L10 65" : "M45 15 L45 65" }
                    strokeLinecap={this.props.linecap}
                    strokeLinejoin={this.props.linejoin}
                    stroke={styleLine.color || this.props.stroke}
                    strokeWidth={styleLine.weight || this.props.strokeWidth}
                    fill={styleLine.fillColor}/>)
                }
                {stylePolygon && polygonPresent && (<rect
                    width="50" height="50" x={lineStringPresent ? "40" : "20"} y="15"
                    style={{
                        fill: stylePolygon.fillColor,
                        strokeWidth: stylePolygon.weight || this.props.strokeWidth,
                        stroke: stylePolygon.color || this.props.stroke,
                        fillOpacity: stylePolygon.fillOpacity,
                        opacity: stylePolygon.opacity
                    }}
                />) }
                {textPresent && <text x="10" y="40" fill={styleText.color}>T</text>}
                {circlePresent && <circle cx="50" cy="50" r="25" stroke={styleCircle.color} opacity={styleCircle.opacity} strokeWidth={styleCircle.weight} fill={styleCircle.fillColor} fillOpacity={styleCircle.fillOpacity}/> }
            </svg>
        </div>
        );
    }
}

module.exports = MultiGeomThumb;
