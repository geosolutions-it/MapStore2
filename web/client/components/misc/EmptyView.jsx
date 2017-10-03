 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');

const FullWidthIcon = require('./FullWidthGlyph');

/**
 * A component to display an empty page.
 * It allows to display a big icon with some information centered. As an option some additiona content can be provided via props. (e.g. add buttons, tools or info)
 * It is very similar to material design concept for [empty state](https://material.io/guidelines/patterns/empty-states.html)
 *
 * @class EmptyView
 * @memberof components.misc
 * @param  {Number} [opacity=0.45]      The opactity
 * @param  {String} [glyph="info-sign"] The icon glyph
 * @param  {string|node} [title]               The title of the advice to display
 * @param  {string|node} [description]         The description to display
 * @param  {string|node} [content]             Additional content for the empty view (e.g. buttons...)
 */
module.exports = ({
        opacity= 0.45,
        glyph="info-sign",
        title,
        description,
        content
    } = {}) =>
        (<div style={{textAlign: "center", position: "absolute", width: "100%"}} >
            <div key="empty-main-view" style={{opacity}}>
                {glyph ? <div key="glyph" style={{width: "40%", "marginLeft": "30%", textAlign: "center"}}><FullWidthIcon glyph={glyph} /></div> : null}
                {title ? <h1 key="title" >{title}</h1> : null}
                {description ? <p key="description">{description}</p> : null}
            </div>
            <div key="content">{content}</div>
        </div>);
