/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import MarkerUtils from '../MarkerUtils';

import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';
import isNil from 'lodash/isNil';

import {Text, Fill, Style, Icon} from 'ol/style';
import highlightIcon from './highlight.png';

const markers = MarkerUtils.markers.extra;
const extraMarker = markers.icons[0];
const extraMarkerShadow = markers.icons[1];
const anchorYSize = markers.size[1];

const glyphs = MarkerUtils.getGlyphs('fontawesome');


const getHighlightStyle = ({highlight, rotation = 0}, size) => (highlight ? [new Style({
    image: new Icon({
        anchor: [ 0.5, size ],
        rotation,
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: highlightIcon,
        scale: 0.5
    })
})] : []);

export default {
    extra: {
        getIcon: (options = {}) => {
            const rotation = !isNil(options.style && options.style.rotation) ? options.style.rotation : 0;
            return [new Style({
                image: new Icon(({
                    rotation,
                    anchor: [12, 12],
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                    src: extraMarkerShadow
                }))
            }), new Style({
                image: new Icon({
                    rotation,
                    src: extraMarker,
                    anchor: [markers.size[0] / 2, markers.size[1]],
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                    size: markers.size,
                    offset: [markers.colors.indexOf(options.style.iconColor || 'blue') * markers.size[0], markers.shapes.indexOf(options.style.iconShape || 'circle') * markers.size[1]]
                }),
                text: new Text({
                    rotation,
                    text: glyphs[options.style.iconGlyph],
                    font: '14px FontAwesome',
                    offsetY: -markers.size[1] * 2 / 3,
                    fill: new Fill({color: '#FFFFFF'})
                })
            })].concat(getHighlightStyle(options.style, (anchorYSize + 15) * 2));
        }
    },
    standard: {
        getIcon: ({style, iconAnchor }) => {
            const rotation = !isNil(style && style.rotation) ? style.rotation : 0;
            const anchor = style.iconAnchor || iconAnchor;
            let markerStyle = [new Style({
                image: new Icon(({
                    anchor: anchor || [0.5, 1],
                    anchorXUnits: style.anchorXUnits || (( anchor || anchor === 0) ? 'pixels' : 'fraction'),
                    anchorYUnits: style.anchorYUnits || (( anchor || anchor === 0) ? 'pixels' : 'fraction'),
                    size: isArray(style.size) ? style.size : isNumber(style.size) ? [style.size, style.size] : undefined,
                    rotation,
                    anchorOrigin: style.anchorOrigin || "top-left",
                    src: style.iconUrl || style.symbolUrlCustomized || style.symbolUrl
                }))
            })];
            if (style.shadowUrl) {
                markerStyle = [new Style({
                    image: new Icon({
                        anchor: [12, 41],
                        anchorXUnits: 'pixels',
                        anchorYUnits: 'pixels',
                        src: style.shadowUrl
                    })
                }), markerStyle[0]];
            }
            let size = isArray(style.size) ? style.size[1] : isNumber(style.size) ? style.size : 0;
            size = size > 32 ? size + (size * 0.75) : (anchorYSize + 10);
            return markerStyle.concat(getHighlightStyle(style, size));
        }
    },
    html: {
        getIcon: () => {
            // NOT implemented yet
            return null;
        }
    }
};
