/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */


const React = require('react');
const {Glyphicon} = require('react-bootstrap');
const ContainerDimensions = require('react-container-dimensions').default;
const enhanceTooltip = require('./enhancers/tooltip');
const Glyph = enhanceTooltip(Glyphicon);
/**
 * An icon that fits to the width of the container
 * @prop {string} glyph icon glyph
 * @prop {tooltip} [tooltip] tooltip
 * @prop {iconfit} [iconfit] if true, the icon will fit min height or width.
 */
module.exports = ({glyph = "info-sign", tooltip, tooltipId, iconFit, padding = 0, margin = 0}) => (<ContainerDimensions>
    { ({ width, height }) =>
        (<Glyph
            glyph={glyph}
            tooltip={tooltip}
            tooltipId={tooltipId}
            style={{
                display: "inline-block",
                padding: padding + "px",
                margin: margin + "px",
                textAlign: "center",
                fontSize: iconFit
                    ? Math.min(width, height) - 2 * padding - 2 * margin
                    : width - 2 * padding - 2 * margin
            }} />)}
</ContainerDimensions>);
