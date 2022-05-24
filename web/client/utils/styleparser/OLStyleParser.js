/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import GeoStylerOLStyleParser  from "geostyler-openlayers-parser";

class OLStyleParser {
    constructor({ drawIcons, getImageIdFromSymbolizer } = {}) {
        this._parser = new GeoStylerOLStyleParser();
        this._drawIcons = drawIcons ? drawIcons : () => Promise.resolve(null);
        this._getImageIdFromSymbolizer = getImageIdFromSymbolizer
            ? getImageIdFromSymbolizer
            : (symbolizer) => symbolizer.symbolizerId;
    }

    readStyle(olStyle) {
        if (olStyle) {
            return this._parser.readStyle(olStyle);
        }
        return Promise.reject('No style provided');
    }

    writeStyle(geoStylerStyle) {
        if (geoStylerStyle) {
            // preload all the images
            return this._drawIcons(geoStylerStyle)
                .then((images = []) => {
                    // here we need to make additional checks to the style
                    // because some rules are not applied as expected
                    const parsedGeoStylerStyle = {
                        ...geoStylerStyle,
                        rules: (geoStylerStyle?.rules || [])
                            .map((rule) => {
                                return {
                                    ...rule,
                                    symbolizers: (rule?.symbolizers || [])
                                        .map(symbolizer => {
                                            // the icon use scale as value inside the mapstore style
                                            // we can only compute it if the image as been preloaded and we got all size info
                                            if (symbolizer.kind === 'Icon') {
                                                const { image, width, height } = images.find(({ id }) => id === this._getImageIdFromSymbolizer(symbolizer)) || {};
                                                if (image && width && height) {
                                                    const side = width > height ? width : height;
                                                    const scale = symbolizer.size / side;
                                                    return {
                                                        ...symbolizer,
                                                        size: scale
                                                    };
                                                }
                                            }
                                            // the openlayers parser does not support fillOpacity
                                            if (symbolizer.kind === 'Fill' || symbolizer.kind === 'Mark') {
                                                return {
                                                    ...symbolizer,
                                                    opacity: symbolizer.fillOpacity
                                                };
                                            }
                                            return symbolizer;
                                        })
                                };
                            })
                    };
                    return this._parser.writeStyle(parsedGeoStylerStyle);
                });
        }
        return Promise.reject('No style provided');
    }
}

export default OLStyleParser;
