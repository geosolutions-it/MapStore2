/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import assign from 'object-assign';
import {Style, Stroke, Fill} from 'ol/style';
import CircleStyle from 'ol/style/Circle';

const getColor = function(color) {
    return `rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ color.a })`;
};
const getGeomType = function(layer) {
    return layer.features && layer.features[0] ? layer.features[0].geometry.type : undefined;
};
const toVectorStyle = function(layer, style) {
    let newLayer = assign({}, layer);
    let geomT = getGeomType(layer);
    if (style.marker && (geomT === 'Point' || geomT === 'MultiPoint')) {
        newLayer.styleName = "marker";
        newLayer.handleClickOnLayer = true;
    } else {
        newLayer.style = {
            weight: style.width,
            radius: style.radius,
            opacity: style.color.a,
            fillOpacity: style.fill.a,
            color: getColor(style.color),
            fillColor: getColor(style.fill)
        };
        let stroke = new Stroke({
            color: getColor(style.color),
            width: style.width
        });
        let fill = new Fill({
            color: getColor(style.fill)
        });
        switch (getGeomType(layer)) {
        case 'Polygon':
        case 'MultiPolygon': {
            // TODO clear this, it goes in maximum call stack size exceeded
            newLayer.nativeStyle = new Style({
                stroke: stroke,
                fill: fill
            });
            break;
        }
        case 'MultiLineString':
        case 'LineString':
            {
                // TODO clear this, it goes in maximum call stack size exceeded
                newLayer.nativeStyle = new Style({
                    stroke: stroke
                });
                break;
            }
        case 'Point':
        case 'MultiPoint': {
            // TODO clear this, it goes in maximum call stack size exceeded
            newLayer.nativeStyle = new Style({
                image: new CircleStyle({
                    radius: style.radius,
                    fill: fill,
                    stroke: stroke
                })});
            break;
        }
        case 'GeometryCollection': {
            // TODO clear this, it goes in maximum call stack size exceeded
            newLayer.nativeStyle = new Style({
                radius: style.radius,
                stroke: stroke,
                fill: fill,
                image: new CircleStyle({
                    radius: style.radius,
                    fill: fill,
                    stroke: stroke
                })
            });
            break;
        }
        default: {
            newLayer.style = null;
        }
        }
    }
    return newLayer;
};

export default toVectorStyle;
