/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Glyphicon } from 'react-bootstrap';
import {
    getWellKnownNameImageFromSymbolizer
} from '../../utils/styleparser/StyleParserUtils';
import { colorToRgbaStr } from '../../utils/ColorUtils';
import useGraphicPattern from './hooks/useGraphicPattern';

function normalizeDashArray(dasharray) {
    if (!dasharray) return null;
    return Array.isArray(dasharray) ? dasharray.join(" ") : dasharray;
}

function getPolygonFill(symbolizer, graphicFill) {
    const fillOpacity = Number(symbolizer["fill-opacity"]);
    const baseFill = graphicFill?.fill || symbolizer.fill;

    // If baseFill is a pattern URL (starts with "url("), return it as-is
    // Pattern URLs can't be converted to rgba strings
    if (baseFill && typeof baseFill === 'string' && baseFill.startsWith('url(')) {
        return baseFill;
    }

    // Otherwise, convert the color with opacity
    return colorToRgbaStr(baseFill, fillOpacity, baseFill);
}

function getLineStroke(symbolizer, graphicStroke) {
    const strokeOpacity = Number(symbolizer["stroke-opacity"]);
    const baseStroke = graphicStroke?.stroke || symbolizer.stroke;

    // If baseStroke is a pattern URL (starts with "url("), return it as-is
    // Pattern URLs can't be converted to rgba strings
    if (baseStroke && typeof baseStroke === 'string' && baseStroke.startsWith('url(')) {
        return baseStroke;
    }

    // Otherwise, convert the color with opacity
    return colorToRgbaStr(baseStroke, strokeOpacity, baseStroke);
}

const icon = {
    Line: ({ symbolizer }) => {
        const symbolizers = Array.isArray(symbolizer) ? symbolizer : [symbolizer];
        const allDefs = [];
        const paths = symbolizers.map((sym, idx) => {
            const { defs, stroke } = useGraphicPattern(sym, "line");
            if (defs) {
                allDefs.push(defs);
            }
            const displayWidth = sym['stroke-width'] || 1;
            return (
                <path
                    key={idx}
                    d={`M ${displayWidth} ${displayWidth} L ${50 - displayWidth} ${50 - displayWidth}`}
                    stroke={getLineStroke(sym, { stroke })}
                    strokeWidth={displayWidth}
                    strokeDasharray={sym.dasharray ? "18 18" : normalizeDashArray(sym["stroke-dasharray"])}
                    strokeLinecap={sym['stroke-linecap']}
                    strokeLinejoin={sym['stroke-linejoin']}
                    strokeOpacity={sym['stroke-opacity']}
                />
            );
        });
        return (
            <svg viewBox="0 0 50 50">
                {allDefs}
                {paths}
            </svg>
        );
    },
    Polygon: ({ symbolizer }) => {
        // Handle both single symbolizer and array of symbolizers
        const symbolizers = Array.isArray(symbolizer) ? symbolizer : [symbolizer];
        // Collect all defs and paths
        const allDefs = [];
        const paths = symbolizers.map((sym, idx) => {
            const { defs, fill } = useGraphicPattern(sym, 'polygon');
            if (defs) {
                allDefs.push(defs);
            }
            const strokeDasharray = normalizeDashArray(
                sym["stroke-dasharray"]
            );
            return (
                <path
                    key={idx}
                    d="M 1 1 L 1 49 L 49 49 L 49 1 L 1 1"
                    fill={getPolygonFill(sym, { fill })}
                    stroke={sym.stroke}
                    strokeWidth={sym["stroke-width"]}
                    strokeOpacity={sym["stroke-opacity"]}
                    strokeLinecap={sym["stroke-linecap"]}
                    strokeLinejoin={sym["stroke-linejoin"]}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={sym["stroke-dashoffset"]}
                />
            );
        });

        return (
            <svg viewBox="0 0 50 50">
                {allDefs}
                {paths}
            </svg>
        );
    },
    Circle: ({ symbolizer }) => {
        return (
            <svg viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="25"
                    fill={symbolizer.fill}
                    opacity={symbolizer['fill-opacity']}
                    stroke={symbolizer.stroke}
                    strokeWidth={symbolizer['stroke-width']}
                    strokeOpacity={symbolizer['stroke-opacity']}
                />
            </svg>
        );
    },
    Mark: ({ symbolizer }) => {
        // square, circle, triangle
        const [iconData, setIconData] = useState(null);
        const isMounted = useRef();

        useEffect(() => {
            isMounted.current = true;
            return () => {
                isMounted.current = false;
            };
        }, []);

        useEffect(() => {
            getWellKnownNameImageFromSymbolizer(symbolizer)
                .then((data) => {
                    if (isMounted.current) {
                        setIconData(data);
                    }
                });
        }, [symbolizer]);

        const { rotate, opacity } = symbolizer;
        const svgStyle = { transform: `rotate(${rotate}deg)`, opacity };
        return (
            <svg viewBox="0 0 50 50" style={svgStyle}>
                {iconData && <image href={iconData.src} height="50" width="50" />}
            </svg>
        );
    },
    Icon: ({ symbolizer }) => {
        const [iconData, setIconData] = useState(null);
        const isMounted = useRef();

        useEffect(() => {
            isMounted.current = true;
            return () => {
                isMounted.current = false;
            };
        }, []);

        useEffect(() => {
            if (symbolizer?.image) {
                const img = new Image();
                img.onload = () => {
                    if (isMounted.current) {
                        setIconData(img);
                    }
                };
                img.onerror = () => {
                    if (isMounted.current) {
                        setIconData(null);
                    }
                };
                img.src = symbolizer.image;
            }
        }, [symbolizer?.image]);
        return iconData
            ? (<svg viewBox="0 0 50 50" style={{ transform: `rotate(${symbolizer.rotate}deg)`, opacity: symbolizer.opacity }}>
                <image href={iconData.src} height="50" width="50" />
            </svg>)
            : <Glyphicon glyph="point"/>;
    },
    Model: () => <Glyphicon glyph="model"/>,
    Text: ({ symbolizer }) => {
        return (
            <svg viewBox="0 0 16 16">
                <text x="8" y="8" textAnchor="middle" alignment-baseline="middle" style={{ // eslint-disable-line -- TODO: need to be fixed
                    fontSize: symbolizer.size < 14 ? symbolizer.size : 14,
                    fill: symbolizer.color,
                    fontFamily: symbolizer?.font?.join(', '),
                    fontStyle: symbolizer.fontStyle,
                    fontWeight: symbolizer.fontWeight,
                    ...((symbolizer.haloWidth && symbolizer.haloColor) && {
                        paintOrder: 'stroke',
                        stroke: symbolizer.haloColor,
                        strokeWidth: 1,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round'
                    })
                }} >T</text>
            </svg>
        );
    }
};
function createSymbolizerForPoint(pointSymbolizer) {
    let symbolizer = {
        color: pointSymbolizer.graphics[0].fill,
        fillOpacity: pointSymbolizer.graphics[0]['fill-opacity'] ? +pointSymbolizer.graphics[0]['fill-opacity'] : 1,
        strokeColor: pointSymbolizer.graphics[0].stroke,
        strokeOpacity: pointSymbolizer.graphics[0]['stroke-opacity'] ? +pointSymbolizer.graphics[0]['stroke-opacity'] : 1,
        strokeWidth: pointSymbolizer.graphics[0]['stroke-width'] ? +pointSymbolizer.graphics[0]['stroke-width'] : 0,
        strokeDasharray: pointSymbolizer.graphics[0]['strock-dasharray'] ? "18 18" : null,
        radius: pointSymbolizer.size ? +pointSymbolizer.size : 5,
        rotate: pointSymbolizer?.rotate || 0,
        opacity: pointSymbolizer?.opacity || 1
    };
    if (pointSymbolizer.graphics) symbolizer.graphics = pointSymbolizer.graphics;
    return symbolizer;
}

function WMSJsonLegendIcon({
    rule
}) {
    const ruleSymbolizers = rule?.symbolizers || [];
    const polygonSymbolizers = [];
    const lineSymbolizers = [];
    const pointSymbolizers = [];
    const icons = [];

    ruleSymbolizers.forEach((symbolizer) => {
        let symbolyzierKinds = Object.keys(symbolizer);
        const availableSymbolyzers = ['Point', 'Line', 'Polygon'];
        symbolyzierKinds.forEach(kind => {
            if (!availableSymbolyzers.includes(kind)) return;
            else if (kind === 'Point') {
                pointSymbolizers.push(symbolizer[kind]);
                return;
            } else if (kind === 'Line') {
                lineSymbolizers.push(symbolizer[kind]);
                return;
            } else if (kind === 'Polygon') {
                polygonSymbolizers.push(symbolizer[kind]);
                return;
            }
            icons.push({Icon: icon[kind], symbolizer: symbolizer[kind]});
        });
    });

    // Handle Line symbolizers (single or multiple)
    if (lineSymbolizers.length > 0) {
        icons.push({
            Icon: icon.Line,
            symbolizer: lineSymbolizers.length === 1 ? lineSymbolizers[0] : lineSymbolizers
        });
    }

    // Handle Polygon symbolizers (single or multiple)
    if (polygonSymbolizers.length > 0) {
        icons.push({
            Icon: icon.Polygon,
            symbolizer: polygonSymbolizers.length === 1 ? polygonSymbolizers[0] : polygonSymbolizers
        });
    }

    // Handle Point symbolizers (individual icons, not stacked)
    pointSymbolizers.forEach((pointSym) => {
        let graphicSymbolyzer = pointSym?.graphics?.find(gr => Object.keys(gr).includes('mark'));
        const graphicType = graphicSymbolyzer ? 'Mark' : 'Icon';
        const processedSymbolizer = graphicType === 'Mark'
            ? createSymbolizerForPoint(pointSym)
            : pointSym;
        if (graphicType === 'Mark' && graphicSymbolyzer) {
            processedSymbolizer.wellKnownName = graphicSymbolyzer.mark.charAt(0).toUpperCase() + graphicSymbolyzer.mark.slice(1);
        }
        icons.push({
            Icon: icon[graphicType],
            symbolizer: processedSymbolizer
        });
    });

    return icons.length ? <> {icons.map(({ Icon, symbolizer }, idx) => <div key={'icons-wms-json' + idx} className="ms-legend-icon"><Icon symbolizer={symbolizer}/></div>)} </> : null;
}

export default WMSJsonLegendIcon;
