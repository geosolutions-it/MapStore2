/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const React = require('react');
/**
 * Component for rendering a rectangular card with preview, title, description and caption.
 * @memberof components.misc.cardgrids
 * @name SideCard
 * @class
 * @prop {string} className custom class
 * @prop {object} style inline style
 * @prop {bool} selected hilglight the card with selected style
 * @prop {node} preview insert a glyphicon or img node
 * @prop {node|string} title text for title
 * @prop {node|string} description text for description
 * @prop {node|string} caption text for caption
 * @prop {node} tools add a node to the right of card
 * @prop {node} body add a node to the bottom of card
 * @prop {string} size size of card, 'sm' for small
 * @prop {function} onClick callback on card click
 */

module.exports = ({body, className = '', style = {}, onClick=() => {}, size, title, preview, description, caption, tools, selected, ...more} = {}) =>
<div className={`mapstore-side-card${selected ? ' selected' : ''}${size ? ' ms-' + size : ''} ${className}`}
    onClick={() => onClick({title, preview, description, caption, tools, ...more})}
    style={style}>
    <div className="ms-head">
        {preview && <div className="mapstore-side-preview">
            {preview}
        </div>}
        <div className="mapstore-side-card-info">
            <div className="mapstore-side-card-title">
                <span>{title}</span>
            </div>
            <div className="mapstore-side-card-desc">
                <span>{description}</span>
            </div>
            {caption && <div className="mapstore-side-card-caption">
                <span>{caption}</span>
            </div>}
        </div>
        <div className="mapstore-side-card-tool text-center">
            {tools}
        </div>
    </div>
    {body && <div className="ms-body">
        {body}
    </div>}
</div>;
