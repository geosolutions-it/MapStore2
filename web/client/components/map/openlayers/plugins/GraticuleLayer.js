/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/openlayers/Layers';

import Graticule from '../../../../utils/openlayers/Graticule';
import {Stroke, Fill, Text, Style} from 'ol/style';
import {getStyle} from "../VectorStyle";

function create(options) {
    const graticule = new Graticule({
        // force graticule on foreground with zIndex
        zIndex: Infinity,
        strokeStyle: options.style ? getStyle(options).getStroke() : new Stroke({
            color: 'rgba(255,120,0,0.9)',
            width: 2,
            lineDash: [0.5, 4]
        }),
        xLabelStyle: options.labelXStyle ? getStyle({
            style: {
                ...options.labelXStyle,
                verticalAlign: options.labelXStyle.verticalAlign || "bottom",
                offsetY: 0
            },
            properties: {isText: true}
        })[0].getText() : new Text({
            font: '12px Calibri,sans-serif',
            textBaseline: 'bottom',
            fill: new Fill({
                color: 'rgba(0,0,0,1)'
            }),
            stroke: new Stroke({
                color: 'rgba(255,255,255,1)',
                width: 3
            })
        }),
        yLabelStyle: options.labelYStyle ? getStyle({
            style: {
                ...options.labelYStyle,
                textAlign: options.labelYStyle.textAlign || "end",
                offsetY: 0
            },
            properties: {isText: true}
        })[0].getText() : new Text({
            font: '12px Calibri,sans-serif',
            textAlign: 'end',
            fill: new Fill({
                color: 'rgba(0,0,0,1)'
            }),
            stroke: new Stroke({
                color: 'rgba(255,255,255,1)',
                width: 3
            })
        }),
        showLabels: options.labels || false,
        showFrame: options.frame || false,
        frameRatio: options.frameRatio,
        frameStyle: options.frameStyle ? getStyle({
            style: options.frameStyle
        }) : new Style({
            stroke: new Stroke({
                color: "rgba(0,0,0,1)"
            }),
            fill: new Fill({
                color: "rgba(255,255,255,1)"
            })
        }),
        projection: options.srs,
        xLabelFormatter: options.xLabelFormatter,
        yLabelFormatter: options.yLabelFormatter
    });
    return graticule;
}

Layers.registerType('graticule', {
    create,
    update(layer, newOptions, oldOptions, map) {
        if (newOptions.srs !== oldOptions.srs) {
            return create(newOptions, map);
        }
        return null;
    }
});
