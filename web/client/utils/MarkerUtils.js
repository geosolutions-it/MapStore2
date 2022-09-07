/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from 'object-assign';
import fontawesome from './font-awesome.json';

const cssJSON = {
    fontawesome
};
import baseImageUrl from '../components/mapcontrols/annotations/img/markers_default.png';
import shadowImageUrl from '../components/mapcontrols/annotations/img/markers_shadow.png';

const baseImage = new Image();
const shadowImage = new Image();

baseImage.src = baseImageUrl;
shadowImage.src = shadowImageUrl;

const glyphs = {};

const loadGlyphs = (font) => {
    const fontJSON = cssJSON[font];
    return Object.keys(fontJSON).reduce((acc, key) => {
        return {
            ...acc,
            [key]: eval("'\\u" + fontJSON[key] + "'") // eslint-disable-line
        };
    }, {});
};

const extraMarkers = {
    size: [36, 46],
    colors: ['red', 'orange-dark', 'orange', 'yellow', 'blue-dark', 'blue', 'cyan', 'purple', 'violet',
        'pink', 'green-dark', 'green', 'green-light', 'black'],
    shapes: ['circle', 'square', 'star', 'penta'],
    icons: [baseImageUrl, shadowImageUrl],
    images: [shadowImage, baseImage]
};

const getOffsets = (color, shape) => {
    return [-extraMarkers.colors.indexOf(color) * extraMarkers.size[0] - 2, -extraMarkers.shapes.indexOf(shape) * extraMarkers.size[1]];
};
const MarkerUtils = {
    extraMarkers: assign({}, extraMarkers, {
        getOffsets,
        markerToDataUrl: ({ iconColor, iconShape, iconGlyph }) => {
            if (MarkerUtils.extraMarkers.images) {
                let canvas = document.createElement('canvas');
                const size = extraMarkers.size;
                canvas.width = size[0];
                canvas.height = size[1];
                // const c = document.getElementById("container");
                // c.insertBefore(canvas, c.children[0])
                const ctx = canvas.getContext("2d");

                const offSet = getOffsets(iconColor, iconShape);
                ctx.drawImage(extraMarkers.images[0], 4, 31, 35, 16); // shadowImage
                ctx.drawImage(extraMarkers.images[1], Math.abs(offSet[0]), Math.abs(offSet[1]), size[0], size[1], 0, 0, size[0], size[1]); // iconImage
                // glyph
                ctx.font = "14px FontAwesome";
                ctx.fillStyle = "rgb(255,255,255)";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.fillText((MarkerUtils.getGlyphs("fontawesome"))[iconGlyph] || '', (size[0] / 2) - 2, (size[1] / 2) - 7);
                const data = canvas.toDataURL("image/png");
                canvas = null;
                return data;
            }
            return null;
        },
        matches: (style, marker) => {
            return style.iconColor === marker.color && style.iconShape === marker.shape;
        },
        getStyle: (marker) => {
            return {
                iconColor: marker.color,
                iconShape: marker.shape
            };
        },
        getGrid: () => {
            return extraMarkers.shapes.map((s) => ({
                name: s,
                markers: extraMarkers.colors.map((m) => ({
                    name: m,
                    width: extraMarkers.size[0],
                    height: extraMarkers.size[1],
                    offsets: getOffsets(m, s),
                    style: {
                        color: m,
                        shape: s
                    },
                    thumbnailStyle: {
                        backgroundImage: "url(" + extraMarkers.icons[0] + ")",
                        width: extraMarkers.size[0] + "px",
                        height: extraMarkers.size[1] + "px",
                        backgroundPositionX: getOffsets(m, s)[0],
                        backgroundPositionY: getOffsets(m, s)[1],
                        cursor: "pointer"
                    }
                }))
            }));
        }
    }),
    getGlyphs: (font) => {
        if (!glyphs[font]) {
            glyphs[font] = loadGlyphs(font);
        }
        return glyphs[font];
    }
};

MarkerUtils.markers = {
    'extra': MarkerUtils.extraMarkers
};

export default MarkerUtils;
