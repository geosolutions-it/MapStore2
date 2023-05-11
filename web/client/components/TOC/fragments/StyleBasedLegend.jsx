/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import MarkIcon from './MarkIcon';
import { Glyphicon } from 'react-bootstrap';

function StyleBasedLegend({ style }) {
    const renderIcon = (symbolizer) => {
        const {
            color,
            outlineColor,
            width,
            outlineWidth,
            dasharray,
            join,
            cap,
            opacity,
            outlineOpacity,
            fillOpacity,
            image,
            rotate
        } = symbolizer;
        switch (symbolizer.kind) {
        case 'Line':
            let displayWidth = width;
            if (width === 0) {
                displayWidth = 1;
            }
            if (width > 7) {
                displayWidth = 7;
            }
            return (<svg viewBox="0 0 50 50">
                <path d={`M ${displayWidth} ${displayWidth} L ${50 - displayWidth} ${50 - displayWidth}`}
                    stroke={color}
                    strokeWidth={displayWidth}
                    strokeDasharray={dasharray ? "18 18" : null}
                    strokeLinecap={cap}
                    strokeLinejoin={join}
                    strokeOpacity={opacity}
                />
            </svg>);
        case 'Fill':
            return (<svg viewBox="0 0 50 50">
                <path d="M 1 1 L 1 49 L 49 49 L 49 1 L 1 1"
                    fill={color}
                    opacity={fillOpacity}
                    stroke={outlineColor}
                    strokeWidth={outlineWidth}
                    strokeOpacity={outlineOpacity}
                />
            </svg>);
        case 'Mark':
            return <MarkIcon symbolizer={symbolizer} />;
        case 'Icon':
            const svgStyle = { transform: `rotate(${rotate}deg)`, opacity };
            return (<svg viewBox="0 0 50 50" style={svgStyle}>
                <image href={image} height="50" width="50" />
            </svg>);
        case 'Model':
            return <Glyphicon glyph="model"/>;
        case 'Text':
            return (<svg viewBox="0 0 16 16">
                <text x="8" y="8" text-anchor="middle" alignment-baseline="middle"  style={{
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
                }} >La</text>
            </svg>);
        default:
            return null;
        }
    };

    const renderRules = (rules) => {
        return (rules || []).map((rule) => {
            return (<div className="wfs-legend-rule" key={rule.ruleId}>
                <div className="wfs-legend-icon">{renderIcon(rule.symbolizers[0])}</div>
                <span>{rule.name || ''}</span>
            </div>);
        });
    };

    return <>
        {
            style.format === 'geostyler' && <div className="wfs-legend">
                {renderRules(style.body.rules)}
            </div>
        }
    </>;
}

StyleBasedLegend.propTypes = {
    style: PropTypes.object
};

export default StyleBasedLegend;
