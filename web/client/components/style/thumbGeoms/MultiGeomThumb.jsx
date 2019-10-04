/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const markerIcon = require('../../map/openlayers/img/marker-icon.png');

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
            features: []
        },
        properties: {}
    };

    getGeoms() {
        return this.props.geometry && this.props.geometry.features.reduce((p, c) => {
            if (c.properties && c.properties.isCircle) {
                return {...p, "Circle": true};
            }
            if (c.properties && c.properties.isText) {
                return {...p, "Text": true};
            }
            return {...p, [c.geometry.type]: true};
        }, {"Circle": false, "Text": false});
    }
    render() {
        let geoms = this.getGeoms();
        const stroke = {color: "#ffcc33", opacity: 1, weight: 2 };
        const fill = {fillColor: "#FFFFFF", fillOpacity: 0 };
        let textPresent = geoms.Text;
        let circlePresent = geoms.Circle;
        let polygonPresent = geoms.Polygon || geoms.MultiPolygon;
        let lineStringPresent = geoms.LineString || geoms.MultiLineString;
        let pointPresent = geoms.Point || geoms.MultiPoint; // this can be a symbol tho..

        let styleLine = {...stroke};
        let stylePolygon = {...stroke, ...fill};
        let styleCircle = {...stroke, ...fill};
        let styleText = textPresent ? {
            fontStyle: 'normal',
            fontSize: '14',
            fontSizeUom: 'px',
            fontFamily: 'Arial',
            fontWeight: 'normal',
            font: "14px Arial",
            textAlign: 'center',
            ...stroke, ...fill} : {};
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
                {pointPresent && <img src={markerIcon} size={32} style={{position: "absolute"}}/>}
            </div>
        );
    }
}

module.exports = MultiGeomThumb;
