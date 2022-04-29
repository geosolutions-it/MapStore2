import L from 'leaflet';

const geometryTypeToKind = {
    'Point': ['Mark', 'Icon', 'Text'],
    'MultiPoint': ['Mark', 'Icon', 'Text'],
    'LineString': ['Line'],
    'MultiLineString': ['Line'],
    'Polygon': ['Fill'],
    'MultiPolygon': ['Fill']
};

function getStyleFuncFromRules({ rules = [] }, {
    geoStylerFilter,
    images,
    getImageIdFromSymbolizer
}) {
    return ({
        opacity: globalOpacity = 1
    }) => {
        return {
            filter: (feature) => {
                const geometryType = feature?.geometry?.type;
                if (rules.length === 0) {
                    return false;
                }
                const supportedKinds = geometryTypeToKind[geometryType] || [];
                if (rules
                    .find(rule =>
                        // the symbolizer should be included in the supported ones
                        rule?.symbolizers?.find(symbolizer => supportedKinds.includes(symbolizer.kind))
                        // the filter should match the expression or be undefined
                        && (!rule.filter || geoStylerFilter(feature, rule.filter))
                    )
                ) {
                    return true;
                }
                return false;
            },
            pointToLayer: (feature, latlng) => {
                const geometryType = feature?.geometry?.type;
                const supportedKinds = geometryTypeToKind[geometryType] || [];
                const firstValidRule = rules
                    .find(rule =>
                        // the symbolizer should be included in the supported ones
                        rule?.symbolizers?.find(symbolizer => supportedKinds.includes(symbolizer.kind))
                        // the filter should match the expression or be undefined
                        && (!rule.filter || geoStylerFilter(feature, rule.filter))
                    ) || {};
                const firstValidSymbolizer = firstValidRule?.symbolizers?.find(symbolizer => supportedKinds.includes(symbolizer.kind)) || {};
                if (firstValidSymbolizer.kind === 'Mark') {
                    const { image, src, width, height } = images.find(({ id }) => id === getImageIdFromSymbolizer(firstValidSymbolizer)) || {};
                    if (image) {
                        const aspect = width / height;
                        let iconSizeW = firstValidSymbolizer.size;
                        let iconSizeH = iconSizeW / aspect;
                        if (height > width) {
                            iconSizeH = firstValidSymbolizer.size;
                            iconSizeW = iconSizeH * aspect;
                        }
                        return L.marker(latlng, {
                            icon: L.icon({
                                iconUrl: src,
                                iconSize: [iconSizeW, iconSizeH],
                                iconAnchor: [iconSizeW / 2, iconSizeH / 2]
                            }),
                            opacity: 1 * globalOpacity
                        });
                    }
                }
                if (firstValidSymbolizer.kind === 'Icon') {
                    const { image, src, width, height } = images.find(({ id }) => id === getImageIdFromSymbolizer(firstValidSymbolizer)) || {};
                    if (image) {
                        const aspect = width / height;
                        let iconSizeW = firstValidSymbolizer.size;
                        let iconSizeH = iconSizeW / aspect;
                        if (height > width) {
                            iconSizeH = firstValidSymbolizer.size;
                            iconSizeW = iconSizeH * aspect;
                        }
                        return L.marker(latlng, {
                            icon: L.icon({
                                iconUrl: src,
                                iconSize: [iconSizeW, iconSizeH],
                                iconAnchor: [iconSizeW / 2, iconSizeH / 2]
                            }),
                            opacity: firstValidSymbolizer.opacity * globalOpacity
                        });
                    }
                }
                if (firstValidSymbolizer.kind === 'Text') {
                    // return L.marker(latlng, { });
                }
                return null;
            },
            style: (feature) => {
                const geometryType = feature?.geometry?.type;
                const supportedKinds = geometryTypeToKind[geometryType] || [];
                const firstValidRule = rules
                    .find(rule =>
                        // the symbolizer should be included in the supported ones
                        rule?.symbolizers?.find(symbolizer => supportedKinds.includes(symbolizer.kind))
                        // the filter should match the expression or be undefined
                        && (!rule.filter || geoStylerFilter(feature, rule.filter))
                    ) || {};
                const firstValidSymbolizer = firstValidRule?.symbolizers?.find(symbolizer => supportedKinds.includes(symbolizer.kind)) || {};
                if (firstValidSymbolizer.kind === 'Line') {
                    return {
                        stroke: true,
                        fill: false,
                        color: firstValidSymbolizer.color,
                        opacity: firstValidSymbolizer.opacity * globalOpacity,
                        weight: firstValidSymbolizer.width,
                        ...(firstValidSymbolizer.dasharray && { dashArray: firstValidSymbolizer.dasharray.join(' ') }),
                        ...(firstValidSymbolizer.cap && { lineCap: firstValidSymbolizer.cap }),
                        ...(firstValidSymbolizer.join && { lineJoin: firstValidSymbolizer.join })
                    };
                }
                if (firstValidSymbolizer.kind === 'Fill') {
                    return {
                        fill: true,
                        stroke: true,
                        fillColor: firstValidSymbolizer.color,
                        fillOpacity: firstValidSymbolizer.fillOpacity * globalOpacity,
                        color: firstValidSymbolizer.outlineColor,
                        opacity: (firstValidSymbolizer.outlineOpacity ?? 0) * globalOpacity,
                        weight: firstValidSymbolizer.outlineWidth ?? 0
                    };
                }
                return {
                    stroke: false,
                    fill: false
                };
            }
        };
    };
}

class LeafletStyleParser {

    constructor({ drawIcons, getImageIdFromSymbolizer, geoStylerFilter } = {}) {
        this._drawIcons = drawIcons ? drawIcons : () => Promise.resolve(null);
        this._getImageIdFromSymbolizer = getImageIdFromSymbolizer
            ? getImageIdFromSymbolizer
            : (symbolizer) => symbolizer.symbolizerId;
        this._geoStylerFilter = geoStylerFilter ? geoStylerFilter : () => true;
    }

    readStyle() {
        return new Promise((resolve, reject) => {
            try {
                resolve(null);
            } catch (error) {
                reject(error);
            }
        });
    }

    writeStyle(geoStylerStyle) {
        return new Promise((resolve, reject) => {
            try {
                this._drawIcons(geoStylerStyle)
                    .then((images = []) => {
                        const styleFunc = getStyleFuncFromRules(geoStylerStyle, {
                            images,
                            getImageIdFromSymbolizer: this._getImageIdFromSymbolizer,
                            geoStylerFilter: this._geoStylerFilter
                        });
                        resolve(styleFunc);
                    });
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default LeafletStyleParser;
