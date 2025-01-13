/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import tooltip from '../../../components/misc/enhancers/tooltip';
const Button = tooltip(({ children, ...props }) => <button {...props}>{children}</button>);
const GlyphIndicator = tooltip(Glyphicon);

/**
 * Item component to provide consistent interface for node tools
 * @prop {string} glyph icon name
 * @prop {string} tooltipId message id for tooltip
 * @prop {string} tooltip message for tooltip
 * @prop {boolean} active show active style if true
 * @prop {object} style add custom style
 * @prop {string} className add custom class name
 * @prop {boolean} disabled disable the click event
 */
function NodeTool({
    onClick,
    ...props
}) {

    if (!onClick) {
        return <GlyphIndicator {...props} />;
    }

    const {
        glyph,
        tooltipId,
        tooltip: tooltipProp,
        active,
        style,
        className,
        disabled
    } = props;
    return (
        <Button
            style={style}
            className={`${className ? className : ''}${active ? ' active' : ''}`}
            disabled={disabled}
            tooltipId={tooltipId}
            tooltip={tooltipProp}
            onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                if (!disabled) {
                    onClick(event);
                }
            }}>
            <Glyphicon glyph={glyph} />
        </Button>
    );
}

export default NodeTool;
