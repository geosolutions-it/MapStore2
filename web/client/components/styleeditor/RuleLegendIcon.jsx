/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Glyphicon } from 'react-bootstrap';
import {
    parseSymbolizerExpressions,
    getWellKnownNameImageFromSymbolizer
} from '../../utils/styleparser/StyleParserUtils';

const icon = {
    Line: ({ symbolizer }) => {
        const displayWidth = symbolizer.width === 0
            ? 1
            : symbolizer.width > 7
                ? 7
                : symbolizer.width;
        return (
            <svg viewBox="0 0 50 50">
                <path d={`M ${displayWidth} ${displayWidth} L ${50 - displayWidth} ${50 - displayWidth}`}
                    stroke={symbolizer.color}
                    strokeWidth={displayWidth}
                    strokeDasharray={symbolizer.dasharray ? "18 18" : null}
                    strokeLinecap={symbolizer.cap}
                    strokeLinejoin={symbolizer.join}
                    strokeOpacity={symbolizer.opacity}
                />
            </svg>
        );
    },
    Fill: ({ symbolizer }) => {
        return (
            <svg viewBox="0 0 50 50">
                <path d="M 1 1 L 1 49 L 49 49 L 49 1 L 1 1"
                    fill={symbolizer.color}
                    opacity={symbolizer.fillOpacity}
                    stroke={symbolizer.outlineColor}
                    strokeWidth={symbolizer.outlineWidth}
                    strokeOpacity={symbolizer.outlineOpacity}
                />
            </svg>
        );
    },
    Circle: ({ symbolizer }) => {
        return (
            <svg viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="25"
                    fill={symbolizer.color}
                    opacity={symbolizer.opacity}
                    stroke={symbolizer.outlineColor}
                    strokeWidth={symbolizer.outlineWidth}
                    strokeOpacity={symbolizer.outlineOpacity}
                />
            </svg>
        );
    },
    Mark: ({ symbolizer }) => {

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
                <text x="8" y="8" textAnchor="middle" alignmentBaseline="middle" style={{
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

function RuleLegendIcon({
    rule
}) {
    const symbolizer = parseSymbolizerExpressions(rule?.symbolizers?.[0] || {}, { properties: {} });
    const Icon = icon[symbolizer.kind];
    return Icon ? <div className="ms-legend-icon"><Icon symbolizer={symbolizer}/></div> : null;
}

export default RuleLegendIcon;
