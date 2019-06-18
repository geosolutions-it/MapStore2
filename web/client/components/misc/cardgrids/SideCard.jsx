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
 * @prop {node}         body            add a node to the bottom of card
 * @prop {node|string}  caption         text for caption
 * @prop {string}       className       custom class
 * @prop {node|string}  description     text for description
 * @prop {bool}         fullText        add full-text className
 * @prop {function}     onClick         callback on card click
 * @prop {function}     onMouseEnter    callback on card mouse enter
 * @prop {function}     onMouseLeave    callback on card mouse leave
 * @prop {node}         preview         insert a glyphicon or img node
 * @prop {bool}         selected        highlight the card with selected style
 * @prop {string}       size            size of card, 'sm' for small
 * @prop {object}       style           inline style
 * @prop {node|string}  title           text for title
 * @prop {node}         tools           add a node to the right of card
 */

module.exports = ({
    body,
    caption,
    className = '',
    description,
    fullText,
    onClick=() => {},
    onMouseEnter = () => {},
    onMouseLeave = () => {},
    preview,
    selected,
    size,
    style = {},
    stylePreview = {},
    styleTools = {},
    title,
    tools,
    ...props
} = {}) =>
    <div
        className={`mapstore-side-card${selected ? ' selected' : ''}${size ? ' ms-' + size : ''}${className ? ` ${className}` : ''}${fullText ? ' full-text' : ''}`}
        onClick={() => onClick({title, preview, description, caption, tools, ...props})}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={style}>
        <div className="ms-head">
            {preview && <div className="mapstore-side-preview" style={stylePreview}>
                {preview}
            </div>}
            <div className="mapstore-side-card-info">
                {title && <div className="mapstore-side-card-title">
                    <span>{title}</span>
                </div>}
                {description && <div className="mapstore-side-card-desc">
                    <span>{description}</span>
                </div>}
                {caption && <div className="mapstore-side-card-caption">
                    <span>{caption}</span>
                </div>}
            </div>
            <div className="mapstore-side-card-tool text-center" style={styleTools}>
                {tools}
            </div>
        </div>
        {body && <div className="ms-body">
            {body}
        </div>}
    </div>;
