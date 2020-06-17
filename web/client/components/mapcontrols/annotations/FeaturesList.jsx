/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const {Glyphicon, ControlLabel} = require('react-bootstrap');
const uuidv1 = require('uuid/v1');
const bbox = require('@turf/bbox');
const Toolbar = require('../../misc/toolbar/Toolbar');
const Message = require('../../I18N/Message');
const {DEFAULT_ANNOTATIONS_STYLES, getStartEndPointsForLinestring} = require('../../../utils/AnnotationsUtils');

const FeaturesList = ({
    editing,
    onAddGeometry,
    onSetStyle,
    onStartDrawing,
    onAddText,
    onDeleteGeometry,
    onZoom,
    maxZoom
}) =>{
    const {features = []} = editing;
    return (
        <>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <ControlLabel>Geometries</ControlLabel>
                <Toolbar
                    btnDefaultProps={{
                        className: 'square-button-md no-border'
                    }}
                    buttons={[
                        {
                            glyph: 'point-plus',
                            onClick: () => {
                                onAddGeometry("Point");
                                onSetStyle([{ ...DEFAULT_ANNOTATIONS_STYLES.Point, highlight: true, id: uuidv1()}]);
                                onStartDrawing();
                            },
                            tooltip: <Message msgId="annotations.titles.marker" />
                        },
                        {
                            glyph: 'polyline-plus',
                            onClick: () => {
                                onAddGeometry("LineString");
                                onSetStyle(
                                    [{ ...DEFAULT_ANNOTATIONS_STYLES.LineString, highlight: true, id: uuidv1()}]
                                        .concat(getStartEndPointsForLinestring()));
                                onStartDrawing();
                            },
                            tooltip: <Message msgId="annotations.titles.line" />
                        },
                        {
                            glyph: 'polygon-plus',
                            onClick: () => {
                                onAddGeometry("Polygon");
                                onSetStyle([
                                    {...DEFAULT_ANNOTATIONS_STYLES.Polygon, highlight: true, id: uuidv1()}
                                ]);
                                onStartDrawing();
                            },
                            tooltip: <Message msgId="annotations.titles.polygon" />
                        },
                        {
                            glyph: 'font-add',
                            onClick: () => {
                                onAddGeometry("Text");
                                onAddText();
                                onSetStyle([
                                    {...DEFAULT_ANNOTATIONS_STYLES.Text, highlight: true, type: "Text", title: "Text Style", id: uuidv1()}
                                ]);
                                onStartDrawing();
                            },
                            tooltip: <Message msgId="annotations.titles.text" />
                        },
                        {
                            glyph: '1-circle-add',
                            onClick: () => {
                                onAddGeometry("Circle");
                                onSetStyle([
                                    {...DEFAULT_ANNOTATIONS_STYLES.Circle, highlight: true, type: "Circle", title: "Circle Style", id: uuidv1()},
                                    {...DEFAULT_ANNOTATIONS_STYLES.Point, highlight: true, iconAnchor: [0.5, 0.5], type: "Point", title: "Center Style", filtering: false, geometry: "centerPoint", id: uuidv1()}
                                ]);
                                onStartDrawing();
                            },
                            tooltip: <Message msgId="annotations.titles.circle" />
                        }
                    ]}
                />
            </div>
            {features.length === 0 && <div style={{ textAlign: 'center' }}>Add a new geometry</div>}
            {features.map((feature, key) => {
                return (
                    <FeatureCard feature={feature} key={key} onDeleteGeometry={onDeleteGeometry} onZoom={onZoom} maxZoom={maxZoom}/>
                );
            })}
        </>
    );
};

const getGeometryType = (feature) => {
    if (feature?.properties?.isCircle) {
        return 'Circle';
    }
    if (feature?.properties?.isText) {
        return 'Text';
    }
    return feature?.geometry?.type;
};

const getGeometryGlyphInfo = (type) => {
    const glyphs = {
        Point: {glyph: 'point', label: 'Point'},
        MultiPoint: {glyph: 'point', label: 'Point'},
        LineString: {glyph: 'polyline', label: 'Line'},
        MultiLineString: {glyph: 'polyline', label: 'Line'},
        Polygon: {glyph: 'polygon', label: 'Polygon'},
        MultiPolygon: {glyph: 'polygon', label: 'Polygon'},
        Text: {glyph: 'font', label: 'Text'},
        Circle: {glyph: '1-circle', label: 'Circle'}
    };
    return glyphs[type];
};

const FeatureCard = ({feature, onDeleteGeometry, onZoom, maxZoom}) => {
    const {properties, geometry} = feature;
    const type = getGeometryType({ properties, geometry });
    const {glyph, label} = getGeometryGlyphInfo(type);

    return (
        <div
            className={'geometry-card'} // ${selected ? ' ms-selected' : ''}
            // onClick={() => onSelect()}
        >
            <div className="geometry-card-preview">
                <Glyphicon glyph={glyph}/>
            </div>
            <div className="geometry-card-label">
                <div>{label || properties?.id}</div>
            </div>
            <Toolbar
                btnDefaultProps={{
                    className: 'square-button-md no-border'
                }}
                buttons={[
                    {
                        Element: () => <Glyphicon glyph="ok-sign" className="text-success"/>
                    },
                    {
                        glyph: 'zoom-to',
                        tooltip: 'Zoom to geometry',
                        onClick: (event) => {
                            event.stopPropagation();
                            const extent = bbox(feature);
                            onZoom(extent, 'EPSG:4326', maxZoom);
                        }
                    },
                    {
                        glyph: 'trash',
                        tooltip: 'Remove',
                        onClick: (event) => {
                            event.stopPropagation();
                            onDeleteGeometry(properties?.id);
                        }
                    }
                ]}
            />
        </div>
    );
};
module.exports = FeaturesList;
