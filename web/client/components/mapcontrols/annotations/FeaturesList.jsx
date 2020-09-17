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
const {get} = require('lodash');
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
        onStyleGeometry,
        styling,
        setTabValue
    } = props;
    const {features = []} = editing || {};
    const isValidFeature = get(props, "selected.properties.isValidFeature", true);

    const onClickGeometry = (type, style) => {
        styling && onStyleGeometry();
        onAddGeometry(type);
        type === "Text" && onAddText();
        onSetStyle(style);
        onStartDrawing();
        setTabValue('coordinates');
    };
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
                            disabled: !isValidFeature,
                            onClick: () => {
                                const style = [{ ...DEFAULT_ANNOTATIONS_STYLES.Point, highlight: true, id: uuidv1()}];
                                onClickGeometry("Point", style);
                            },
                            tooltip: <Message msgId="annotations.titles.marker" />
                        },
                        {
                            glyph: 'polyline-plus',
                            disabled: !isValidFeature,
                            onClick: () => {
                                const style = [{ ...DEFAULT_ANNOTATIONS_STYLES.LineString, highlight: true, id: uuidv1()}]
                                    .concat(getStartEndPointsForLinestring());
                                onClickGeometry("LineString", style);
                            },
                            tooltip: <Message msgId="annotations.titles.line" />
                        },
                        {
                            glyph: 'polygon-plus',
                            disabled: !isValidFeature,
                            onClick: () => {
                                const style = [
                                    {...DEFAULT_ANNOTATIONS_STYLES.Polygon, highlight: true, id: uuidv1()}];
                                onClickGeometry("Polygon", style);
                            },
                            tooltip: <Message msgId="annotations.titles.polygon" />
                        },
                        {
                            glyph: 'font-add',
                            disabled: !isValidFeature,
                            onClick: () => {
                                const style = [
                                    {...DEFAULT_ANNOTATIONS_STYLES.Text, highlight: true, type: "Text", title: "Text Style", id: uuidv1()}];
                                onClickGeometry("Text", style);
                            },
                            tooltip: <Message msgId="annotations.titles.text" />
                        },
                        {
                            glyph: '1-circle-add',
                            disabled: !isValidFeature,
                            onClick: () => {
                                const style = [
                                    {...DEFAULT_ANNOTATIONS_STYLES.Circle, highlight: true, type: "Circle", title: "Circle Style", id: uuidv1()},
                                    {...DEFAULT_ANNOTATIONS_STYLES.Point, highlight: true, iconAnchor: [0.5, 0.5], type: "Point", title: "Center Style", filtering: false, geometry: "centerPoint", id: uuidv1()}
                                ];
                                onClickGeometry("Circle", style);
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
const FeatureCard = ({feature, selected, onDeleteGeometry, onZoom, maxZoom, onSelectFeature, onUnselectFeature, setTabValue, styling, onStyleGeometry}) => {
    const type = getGeometryType(feature);
    const {properties} = feature;
    const {glyph, label} = getGeometryGlyphInfo(type);
    const unselect = selected?.properties?.id === properties?.id;
    const isValidFeature = selected?.properties?.isValidFeature || properties?.isValidFeature;

    return (
        <div
            className={cs('geometry-card', {'ms-selected': unselect})}
            onClick={() =>{
                if (unselect) {
                    onUnselectFeature();
                } else {
                    onSelectFeature([feature]);
                    setTabValue('coordinates');
                    styling && onStyleGeometry();
                }
            } }
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
                        Element: () => <Glyphicon glyph={isValidFeature ? "ok-sign" : "exclamation-mark"} className={"text-" + (isValidFeature ? "success" : "danger")}/>
                    },
                    {
                        glyph: 'zoom-to',
                        visible: isValidFeature,
                        tooltip: <Message msgId="annotations.zoomToGeometry"/>,
                        onClick: (event) => {
                            event.stopPropagation();
                            const extent = bbox(feature);
                            onZoom(extent, 'EPSG:4326', maxZoom);
                        }
                    },
                    {
                        glyph: 'trash',
                        visible: isValidFeature,
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
