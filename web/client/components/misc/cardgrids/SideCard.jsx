/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const React = require('react');
const { isObject } = require('lodash');

const Loader = require('../Loader');

/**
 * Component for rendering a rectangular card with preview, title, description and caption.
 * @memberof components.misc.cardgrids
 * @name SideCard
 * @class
 * @prop {node}         body            add a node to the bottom of card
 * @prop {node|string}  caption         text for caption
 * @prop {node}         infoExtra       add a node under info
 * @prop {string}       className       custom class
 * @prop {node|string}  description     text for description
 * @prop {bool}         fullText        add full-text className
 * @prop {function}     onClick         callback on card click
 * @prop {function}     onMouseEnter    callback on card mouse enter
 * @prop {function}     onMouseLeave    callback on card mouse leave
 * @prop {node}         preview         insert a glyphicon or img node
 * @prop {node|string}  dragSymbol      insert a glyphicon or string for  drag symbol
 * @prop {bool}         selected        highlight the card with selected style
 * @prop {string}       size            size of card, 'sm' for small
 * @prop {object}       style           inline style
 * @prop {node|string}  title           text for title
 * @prop {bool}         loading         loading spinner
 * @prop {node}         tools           add a node to the right of card
 */

module.exports = ({
    body,
    caption,
    infoExtra,
    className = '',
    description,
    fullText,
    onClick = () => {},
    onMouseEnter = () => {},
    onMouseLeave = () => {},
    preview,
    selected,
    size,
    style = {},
    stylePreview = {},
    styleTools = {},
    title,
    loading,
    dragSymbol = "+",
    tools,
    ...props
} = {}) =>
    <div
        className={`mapstore-side-card${selected ? ' selected' : ''}${size ? ' ms-' + size : ''}${className ? ` ${className}` : ''}${fullText ? ' full-text' : ''}`}
        onClick={(event) => onClick({title, preview, description, caption, tools, ...props}, event)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={style}>
        <div className="ms-head">
            {props.isDraggable && props.connectDragSource && props.connectDragSource(
                <div className="mapstore-side-card-tool text-center">
                    <div style={{ width: 10, overflow: 'hidden' }} >{dragSymbol}</div>
                </div>
            )}
            {preview && <div className="mapstore-side-preview" style={stylePreview}>
                {preview}
            </div>}
            <div className="mapstore-side-card-container">
                <div className="mapstore-side-card-inner">
                    <div className="mapstore-side-card-left-container">
                        <div className="mapstore-side-card-info">
                            {title && <div className="mapstore-side-card-title">
                                <span>{title}</span>
                            </div>}
                            {description && <div className="mapstore-side-card-desc">
                                {isObject(description) ? description : <span>{description}</span>}
                            </div>}
                            {caption && <div className="mapstore-side-card-caption">
                                <span>{caption}</span>
                            </div>}
                        </div>
                        {infoExtra}
                    </div>
                    <div className="mapstore-side-card-right-container">
                        <div className="mapstore-side-card-tool text-center" style={styleTools}>
                            {tools}
                        </div>
                        {size !== 'sm' && <div className="mapstore-side-card-loading">
                            <Loader className="mapstore-side-card-loader" size={12} hidden={!loading}/>
                        </div>}
                    </div>
                </div>
            </div>
        </div>
        {body && <div className="ms-body">
            {body}
        </div>}
    </div>;
