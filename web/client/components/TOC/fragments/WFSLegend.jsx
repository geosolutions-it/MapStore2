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

function WFSLegend({ node }) {
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
            return (<svg width="21" height="21" viewBox="0 0 50 50">
                <path d="M 5 5 L 45 45"
                    stroke={color}
                    strokeWidth={width}
                    strokeDasharray={dasharray ? "18 18" : null}
                    strokeLinecap={cap}
                    strokeLinejoin={join}
                    strokeOpacity={opacity}
                />
            </svg>);
        case 'Fill':
            return (<svg width="21" height="21" viewBox="0 0 50 50">
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
            const svgStyle = {transform: `rotate(${rotate}deg)`, opacity};
            return (<svg width="21" height="21" viewBox="0 0 50 50" style={svgStyle}>
                <image href={image} height="50" width="50"/>
            </svg>);
        default:
            return null;

        }
    };

    const renderRules = (rules) => {
        return rules.map((rule) => {
            return (<div className="wfs-legend-rule" key={rule.ruleId}>
                <div className="wfs-legend-icon">{renderIcon(rule.symbolizers[0])}</div>
                <span>{rule.name || 'No Label'}</span>
            </div>);
        });
    };

    return (<div className="wfs-legend">
        {renderRules(node.style.body.rules)}
    </div>);
}

WFSLegend.PropTypes = {
    node: PropTypes.object
};

export default WFSLegend;
