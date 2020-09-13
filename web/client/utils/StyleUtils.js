/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import assign from 'object-assign';

const getColor = function(color) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
};
const getGeomType = function(layer) {
    return layer.features && layer.features[0] ? layer.features[0].geometry && layer.features[0].geometry.type : undefined;
};
//
const DUMMY_COLOR = {r: 255, g: 0, b: 0, a: 1}; // This style should never be applied, is only a default for tests and to prevent failures
export const toVectorStyle = function(layer, style) {
    let newLayer = assign({}, layer);
    let geomT = getGeomType(layer);
    if (style.marker && (geomT === 'Point' || geomT === 'MultiPoint')) {
        newLayer.styleName = "marker";
        newLayer.handleClickOnLayer = true;
    }
    const {color = DUMMY_COLOR, fill = DUMMY_COLOR} = style || {};
    newLayer.style = {
        weight: style.width,
        radius: style.radius,
        opacity: color.a,
        fillOpacity: fill.a,
        color: getColor(color),
        fillColor: getColor(fill)
    };
    return newLayer;
};

