/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const {Glyphicon, DropdownButton, MenuItem} = require('react-bootstrap');
const tooltip = require('../../misc/enhancers/tooltip');
const {DEFAULT_ANNOTATIONS_STYLES} = require('../../../utils/AnnotationsUtils');
const React = require('react');
const uuidv1 = require('uuid/v1');
const assign = require('object-assign');

const getGeomCollStyle = (type, multiType, style, defaultStyle = DEFAULT_ANNOTATIONS_STYLES) => {
    return assign({}, style, {
        [type]: assign({}, defaultStyle[type], style[type] || {}),
        [multiType]: assign({}, defaultStyle[type], style[type] || {}),
        type
    });
};

const DropdownButtonT = tooltip(DropdownButton);
const DropdownFeatureType = ({onClick = () => {}, onStopDrawing = () => {}, onAddText = () => {}, onSetStyle = () => {}, bsStyle = "primary", ...props} = {}) => (
    <DropdownButtonT id={props.idDropDown || uuidv1()} tooltip={props.tooltip} className="square-button-md" bsStyle={bsStyle} title={<Glyphicon glyph={props.glyph}/>} disabled={!!props.disabled} noCaret onClick={() => {onStopDrawing(); }}>
        <MenuItem eventKey="1" onClick={() => { onClick("MultiPoint"); onSetStyle(getGeomCollStyle("Point", "MultiPoint", props.style || {})); }}><Glyphicon glyph="point"/>{props.titles.marker}</MenuItem>
        <MenuItem eventKey="2" onClick={() => { onClick("MultiLineString"); onSetStyle(getGeomCollStyle("LineString", "MultiLineString", props.style || {})); }}><Glyphicon glyph="line"/>{props.titles.line}</MenuItem>
        <MenuItem eventKey="3" onClick={() => { onClick("MultiPolygon"); onSetStyle(getGeomCollStyle("Polygon", "MultiPolygon", props.style || {})); }}><Glyphicon glyph="polygon"/>{props.titles.polygon}</MenuItem>
        <MenuItem eventKey="4" onClick={() => { onClick("Text"); onAddText(); onSetStyle(assign({}, props.style, {type: "Text", "Text": assign({}, DEFAULT_ANNOTATIONS_STYLES.Text, props.style && props.style.Text || {})} )); }}><Glyphicon glyph="text-colour"/>{props.titles.text}</MenuItem>
    </DropdownButtonT>
);

module.exports = DropdownFeatureType;
