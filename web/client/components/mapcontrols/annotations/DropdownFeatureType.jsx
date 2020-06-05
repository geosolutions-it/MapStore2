/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const {Glyphicon, DropdownButton, MenuItem} = require('react-bootstrap');
const tooltip = require('../../misc/enhancers/tooltip');
const {DEFAULT_ANNOTATIONS_STYLES, getStartEndPointsForLinestring} = require('../../../utils/AnnotationsUtils');
const React = require('react');
const uuidv1 = require('uuid/v1');
const assign = require('object-assign');


const DropdownButtonT = tooltip(DropdownButton);
const DropdownFeatureType = ({
    onClick = () => {},
    onStartDrawing = () => {},
    onAddText = () => {},
    onSetStyle = () => {},
    defaultStyles = {},
    defaultPointType = 'marker',
    titles = {},
    glyph = "",
    bsStyle = "primary",
    ...props
} = {}) => (
    <DropdownButtonT
        id={props.idDropDown || uuidv1()}
        tooltipId={props.tooltipId}
        className="square-button-md"
        bsStyle={bsStyle}
        title={<Glyphicon glyph={glyph}/>}
        disabled={!!props.disabled}
        noCaret>

        <MenuItem eventKey="1" onClick={() => {
            onClick("Point");
            onSetStyle([{ ...defaultStyles.POINT?.[defaultPointType], highlight: true, id: uuidv1()}]);
            onStartDrawing();
        }}>
            <Glyphicon glyph="point"/>{titles.marker}
        </MenuItem>

        <MenuItem eventKey="2" onClick={() => {
            onClick("LineString");
            onSetStyle(
                [{ ...DEFAULT_ANNOTATIONS_STYLES.LineString, highlight: true, id: uuidv1()}]
                    .concat(getStartEndPointsForLinestring()));
            onStartDrawing();
        }}>
            <Glyphicon glyph="line"/>{titles.line}
        </MenuItem>

        <MenuItem eventKey="3" onClick={() => {
            onClick("Polygon");
            onSetStyle([
                {...DEFAULT_ANNOTATIONS_STYLES.Polygon, highlight: true, id: uuidv1()}
            ]);
            onStartDrawing();
        }}>
            <Glyphicon glyph="polygon"/>{titles.polygon}
        </MenuItem>

        <MenuItem eventKey="4" onClick={() => {
            onClick("Text");
            onAddText();
            onSetStyle([
                assign({}, {...DEFAULT_ANNOTATIONS_STYLES.Text, highlight: true, type: "Text", title: "Text Style", id: uuidv1()})
            ]);
            onStartDrawing();
        }}>
            <Glyphicon glyph="text-colour"/>{titles.text}
        </MenuItem>

        <MenuItem eventKey="5" onClick={() => {
            onClick("Circle");
            onSetStyle([
                assign({}, {...DEFAULT_ANNOTATIONS_STYLES.Circle, highlight: true, type: "Circle", title: "Circle Style", id: uuidv1()} ),
                {...DEFAULT_ANNOTATIONS_STYLES.Point, highlight: true, iconAnchor: [0.5, 0.5], type: "Point", title: "Center Style", filtering: false, geometry: "centerPoint", id: uuidv1()}
            ]);
            onStartDrawing();
        }}>
            <Glyphicon glyph="1-circle"/>{titles.circle}
        </MenuItem>
    </DropdownButtonT>
);

module.exports = DropdownFeatureType;
