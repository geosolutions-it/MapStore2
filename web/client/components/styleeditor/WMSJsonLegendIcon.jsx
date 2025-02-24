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

const icon = {
    Line: ({ symbolizer }) => {
        const displayWidth = symbolizer['stroke-width'] ? symbolizer['stroke-width'] : symbolizer.width === 0
            ? 1
            : symbolizer.width > 7
                ? 7
                : symbolizer.width;
        return (
            <svg viewBox="0 0 50 50">
                <path d={`M ${displayWidth} ${displayWidth} L ${50 - displayWidth} ${50 - displayWidth}`}
                    stroke={symbolizer.stroke || symbolizer.color}
                    strokeWidth={displayWidth}
                    strokeDasharray={symbolizer.dasharray ? "18 18" : null}
                    strokeLinecap={symbolizer['stroke-linecap']}
                    strokeLinejoin={symbolizer['stroke-linejoin']}
                    strokeOpacity={symbolizer['stroke-opacity']}
                />
            </svg>
        );
    },
    Polygon: ({ symbolizer }) => {
        return (
            <svg viewBox="0 0 50 50">
                <path d="M 1 1 L 1 49 L 49 49 L 49 1 L 1 1"
                    fill={symbolizer.fill}
                    opacity={symbolizer['fill-opacity']}
                    stroke={symbolizer.stroke}
                    strokeWidth={symbolizer['stroke-width']}
                    strokeOpacity={symbolizer['stroke-opacity']}
                />
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
    const ruleSymbolizers = rule?.symbolizers;
    const icons = [];
    ruleSymbolizers.forEach((symbolizer) => {
        let symbolyzierKinds = Object.keys(symbolizer);
        const availableSymbolyzers = ['Point', 'Line', 'Polygon'];
        symbolyzierKinds.forEach(kind => {
            if (!availableSymbolyzers.includes(kind)) return;
            else if (kind === 'Point') {
                let graphicSymbolyzer = symbolizer[kind]?.graphics?.find(gr => Object.keys(gr).includes('mark'));
                const graphicType = graphicSymbolyzer ? 'Mark' : 'Icon';
                if (graphicType === 'Mark') {
                    symbolizer[kind] = createSymbolizerForPoint(symbolizer[kind]);
                }
                symbolizer[kind].wellKnownName = graphicType === 'Mark' ? graphicSymbolyzer.mark.charAt(0).toUpperCase() + graphicSymbolyzer.mark.slice(1) : '';
                icons.push({Icon: icon[graphicType], symbolizer: symbolizer[kind]});
                return;
            }
            icons.push({Icon: icon[kind], symbolizer: symbolizer[kind]});
        });
    });
    return icons.length ? <> {icons.map(({ Icon, symbolizer }, idx) => <div key={'icons-wms-json' + idx} className="ms-legend-icon"><Icon symbolizer={symbolizer}/></div>)} </> : null;
}

export default WMSJsonLegendIcon;
