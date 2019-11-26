/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');

const FitIcon = require('./FitIcon');

/**
 * A component to display an empty page.
 * It allows to display a big icon with some information centered. As an option some additiona content can be provided via props. (e.g. add buttons, tools or info)
 * It is very similar to material design concept for [empty state](https://material.io/guidelines/patterns/empty-states.html)
 *
 * @class EmptyView
 * @memberof components.misc
 * @param  {object} [mainViewStyle]     Style for the main view
 * @param  {object} [contentStyle]      Style for the container view
 * @param  {string} [glyph="info-sign"] The icon glyph
 * @param  {string|node} [title]               The title of the advice to display
 * @param  {string|node} [description]         The description to display
 * @param  {string|node} [content]             Additional content for the empty view (e.g. buttons...)
 */
module.exports = ({
    style = {},
    mainViewStyle = {},
    contentStyle = {},
    imageStyle = {},
    glyph = "info-sign",
    iconFit,
    title,
    tooltip,
    tooltipId,
    description,
    content
} = {}) =>
    (<div className="empty-state-container" style={{height: iconFit ? "100%" : undefined, ...style}}>
        <div key="main-view" className="empty-state-main-view" style={{height: iconFit ? "100%" : undefined, ...mainViewStyle}} >
            {glyph
                ? <div key="glyph" className="empty-state-image" style={{height: iconFit ? "100%" : undefined, ...imageStyle}}>
                    <FitIcon iconFit={iconFit} tooltip={tooltip} tooltipId={tooltipId} glyph={glyph} />
                </div>
                : null}
            {title ? <h1 key="title" >{title}</h1> : null}
            {description ? <p key="description" className="empty-state-description">{description}</p> : null}
        </div>
        <div key="content" className="empty-state-content" style={contentStyle}>{content}</div>
    </div>);
