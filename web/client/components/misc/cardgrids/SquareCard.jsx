/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

/**
 * Component for rendering a square card with preview and title.
 * @memberof components.misc.cardgrids
 * @name SquareCard
 * @class
 * @prop {bool} selected hilglight the card with selected style
 * @prop {node} preview insert a glyphicon or img node
 * @prop {string} previewSrc src for img preview
 * @prop {node|string} title text for title
 * @prop {function} onClick callback on card click
 */

const SquareCard = ({ disabled, selected, title, preview, previewSrc, onClick = () => { } }) => (
    <div
        className={`ms-square-card${selected ? ' ms-selected' : ''}${disabled ? ' ms-disabled' : ''}`}
        onClick={disabled ? null : () => onClick()}>
        {(preview || previewSrc) && <div className="ms-preview">
            {preview || previewSrc && <img src={previewSrc} />}
        </div>}
        <small>{title}</small>
    </div>
);

module.exports = SquareCard;
