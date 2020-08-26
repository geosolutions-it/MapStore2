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
const cs = require('classnames');
const Message = require('../../I18N/Message');
const {DEFAULT_ANNOTATIONS_STYLES, getStartEndPointsForLinestring, getGeometryGlyphInfo, getGeometryType} = require('../../../utils/AnnotationsUtils');

/**
 * Feature List component for Annotation Viewer.
 * @memberof components.mapControls.annotations
 * @function
 *
*/
const FeaturesList = (props) => {
    const {
        editing,
        onAddGeometry,
        onSetStyle,
        onStartDrawing,
        onAddText,
        onToggleGeometryEdit
    } = props;
    const {features = []} = editing || {};
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
                <ControlLabel><Message msgId={"annotations.geometries"}/></ControlLabel>
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
                                onToggleGeometryEdit(true);
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
                                onToggleGeometryEdit(true);
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
                                onToggleGeometryEdit(true);
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
                                onToggleGeometryEdit(true);
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
                                onToggleGeometryEdit(true);
                            },
                            tooltip: <Message msgId="annotations.titles.circle" />
                        }
                    ]}
                />
            </div>
            {features && features.length === 0 && <div style={{ textAlign: 'center' }}><Message msgId="annotations.addGeometry"/></div>}
            {features?.map((feature, key) => {
                return (
                    <FeatureCard feature={feature} key={key} {...props}/>
                );
            })}
        </>
    );
};

/**
 * Feature or Geometry card component for FeatureList.
 * @function
 *
 */
const FeatureCard = ({feature, selected, onDeleteGeometry, onZoom, maxZoom, onSelectFeature, onUnselectFeature}) => {
    const type = getGeometryType(feature);
    const {properties} = feature;
    const {glyph, label} = getGeometryGlyphInfo(type);
    const unselect = selected?.properties?.id === properties?.id;
    const isValidFeature = selected?.properties?.isValidFeature || properties?.isValidFeature;

    return (
        <div
            className={cs('geometry-card', {'ms-selected': unselect})}
            onClick={() => unselect ? onUnselectFeature() : onSelectFeature([feature])}
        >
            <div className="geometry-card-preview">
                <Glyphicon glyph={glyph}/>
            </div>
            <div className="geometry-card-label">
                <div>{properties?.geometryTitle || label || properties?.id}</div>
            </div>
            <Toolbar
                btnDefaultProps={{
                    className: 'square-button-md no-border'
                }}
                buttons={[
                    {
                        Element: () => <Glyphicon glyph={isValidFeature ? "ok-sign" : "exclamation-mark"} className="text-success"/>
                    },
                    {
                        glyph: 'zoom-to',
                        tooltip: <Message msgId="annotations.zoomToGeometry"/>,
                        onClick: (event) => {
                            event.stopPropagation();
                            const extent = bbox(feature);
                            onZoom(extent, 'EPSG:4326', maxZoom);
                        }
                    },
                    {
                        glyph: 'trash',
                        tooltip: <Message msgId="annotations.removeGeometry"/>,
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
