/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ol = require('openlayers');

const {Row, Col, Panel, Input, Button, Glyphicon, OverlayTrigger, Tooltip} = require('react-bootstrap');

const Draggable = require('react-draggable');

const I18N = require('../I18N/I18N');

const assign = require('object-assign');

const GeometryDetails = React.createClass({
    propTypes: {
        geometry: React.PropTypes.string,
        type: React.PropTypes.string,
        onShowPanel: React.PropTypes.func,
        onChangeDrawingStatus: React.PropTypes.func,
        onEndDrawing: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            geometry: null,
            type: null,
            onShowPanel: () => {},
            onChangeDrawingStatus: () => {},
            onEndDrawing: () => {}
        };
    },
    onUpdateBBOX(value, name) {
        this.tempExtent[name] = parseFloat(value);

        let coordinates = [];
        for (let prop in this.tempExtent) {
            if (prop) {
                coordinates.push(this.tempExtent[prop]);
            }
        }

        let bbox = ol.geom.Polygon.fromExtent(coordinates);

        let feature = new ol.Feature({
            geometry: bbox
        });

        this.props.onChangeDrawingStatus("replace", undefined, "queryform", [feature]);
    },
    onUpdateRadius(value, name) {
        this.tempCircle[name] = parseFloat(value);

        let circle = new ol.geom.Circle(this.tempCircle.center, this.tempCircle[name]);
        circle = ol.geom.Polygon.fromCircle(circle, 100);

        let feature = new ol.Feature({
            geometry: circle
        });

        this.props.onChangeDrawingStatus("replace", undefined, "queryform", [feature]);
    },
    onModifyGeometry() {
        let geoJsonFormat = new ol.format.GeoJSON();
        let feature;

        // Update the geometry status
        if (this.props.type === "BBOX") {
            this.extent = this.tempExtent;

            let coordinates = [];
            for (let prop in this.extent) {
                if (prop) {
                    coordinates.push(this.extent[prop]);
                }
            }

            let geometry = ol.geom.Polygon.fromExtent(coordinates);
            feature = new ol.Feature({
                geometry: geometry
            });

            this.props.onEndDrawing(geoJsonFormat.writeFeature(feature), "queryform");
        } else if (this.props.type === "Circle") {
            this.circle = this.tempCircle;

            let geometry = new ol.geom.Circle(this.circle.center, this.circle.radius);
            geometry = ol.geom.Polygon.fromCircle(geometry, 100);

            feature = new ol.Feature({
                geometry: geometry
            });
        }

        this.props.onEndDrawing(geoJsonFormat.writeFeature(feature), "queryform");
        this.props.onShowPanel(false);
    },
    onClosePanel() {
        if (this.props.type === "BBOX") {
            this.resetBBOX();
        } else if (this.props.type === "Circle") {
            this.resetRadius();
        }

        this.props.onShowPanel(false);
    },
    renderHeader() {
        return (
            <div className="handle">
                <span>
                    <span><I18N.Message msgId={"queryform.spatialfilter.details.details_header"}/></span>
                    <Button onClick={() => this.onClosePanel(false)} className="close card-close"><span>×</span></Button>
                </span>
            </div>
        );
    },
    renderCoordinateField(defaultValue, name) {
        return (
            <Input
                style={{"width": "105px"}}
                type="number"
                id={"queryform_bbox_" + name}
                defaultValue={defaultValue}
                onChange={(evt) => this.onUpdateBBOX(evt.target.value, name)}/>
        );
    },
    renderRadiusField(radius, name) {
        return (
            <Input
                style={{"width": "200px"}}
                type="number"
                id={"queryform_circle_" + name}
                defaultValue={radius}
                onChange={(evt) => this.onUpdateRadius(evt.target.value, name)}/>
        );
    },
    renderDetailsContent() {
        let detailsContent;

        let geoJsonFormat = new ol.format.GeoJSON();
        let feature = geoJsonFormat.readFeature(this.props.geometry);
        let geometry = feature.getGeometry();
        let geomExtent = geometry.getExtent();

        if (this.props.type === "BBOX") {
            this.extent = {
                "west": geomExtent[0],
                "sud": geomExtent[1],
                "est": geomExtent[2],
                "north": geomExtent[3]
            };

            this.tempExtent = assign({}, this.extent, {});

            detailsContent = (
                <div style={{"display": "table", "margin": "0 auto", "width": "100%", "marginTop": "20px"}}>
                    <Row>
                        <Col xs={4}>
                            <span/>
                        </Col>
                        <Col xs={4}>
                            {this.renderCoordinateField(this.extent.north, "north")}
                        </Col>
                        <Col xs={4}>
                            <span/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}><div style={{"height": "50px"}}/></Col>
                    </Row>
                    <Row>
                        <Col xs={4}>
                            {this.renderCoordinateField(this.extent.west, "west")}
                        </Col>
                        <Col xs={2}>
                            <OverlayTrigger placement="bottom" overlay={(<Tooltip id="save-bbox-tooltip"><strong><I18N.Message msgId={"queryform.spatialfilter.details.save_bbox"}/></strong></Tooltip>)}>
                                <Button id="save-bbox" onClick={() => this.onModifyGeometry()}>
                                    <Glyphicon glyph="glyphicon glyphicon-ok"/>
                                </Button>
                            </OverlayTrigger>
                        </Col>
                        <Col xs={2}>
                            <OverlayTrigger placement="bottom" overlay={(<Tooltip id="reset-bbox-tooltip"><strong><I18N.Message msgId={"queryform.spatialfilter.details.reset"}/></strong></Tooltip>)}>
                                <Button id="reset-bbox" onClick={() => this.resetBBOX()}>
                                    <Glyphicon glyph="glyphicon glyphicon-remove"/>
                                </Button>
                            </OverlayTrigger>
                        </Col>
                        <Col xs={4}>
                            {this.renderCoordinateField(this.extent.est, "est")}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}><div style={{"height": "50px"}}/></Col>
                    </Row>
                    <Row>
                        <Col xs={4}>
                            <span/>
                        </Col>
                        <Col xs={4}>
                            {this.renderCoordinateField(this.extent.sud, "sud")}
                        </Col>
                        <Col xs={4}>
                            <span/>
                        </Col>
                    </Row>
                    <span>
                        <hr width="100%" style={{"borderTop": "1px solid #337AB7"}}/>
                        <div style={{"textAlign": "center"}}><h4><I18N.Message msgId={"queryform.spatialfilter.details.details_bbox_label"}/></h4></div>
                    </span>
                </div>
            );
        } else if (this.props.type === "Circle") {
            let center = ol.extent.getCenter(geomExtent);
            let coordinate = geometry.getFirstCoordinate();
            let radius = Math.sqrt(Math.pow(center[0] - coordinate[0], 2) + Math.pow(center[1] - coordinate[1], 2));

            this.circle = {
                "center": center,
                "radius": radius
            };

            this.tempCircle = assign({}, this.circle, {});

            detailsContent = (
                <div style={{"marginTop": "80px"}}>
                    <Row>
                        <Col xs={8}>
                            {this.renderRadiusField(this.circle.radius, "radius")}
                        </Col>
                        <Col xs={2}>
                            <OverlayTrigger placement="bottom" overlay={(<Tooltip id="save-radius-tooltip"><strong><I18N.Message msgId={"queryform.spatialfilter.details.save_radius"}/></strong></Tooltip>)}>
                                <Button id="save-radius" onClick={() => this.onModifyGeometry()}>
                                    <Glyphicon glyph="glyphicon glyphicon-ok"/>
                                </Button>
                            </OverlayTrigger>
                        </Col>
                        <Col xs={2}>
                            <OverlayTrigger placement="bottom" overlay={(<Tooltip id="reset-radius-tooltip"><strong><I18N.Message msgId={"queryform.spatialfilter.details.reset"}/></strong></Tooltip>)}>
                                <Button id="reset-radius" onClick={() => this.resetRadius()}>
                                    <Glyphicon glyph="glyphicon glyphicon-remove"/>
                                </Button>
                            </OverlayTrigger>
                        </Col>
                    </Row>
                    <span>
                        <hr width="100%" style={{"borderTop": "1px solid #337AB7"}}/>
                        <div style={{"textAlign": "center"}}><h4><I18N.Message msgId={"queryform.spatialfilter.details.details_circle_label"}/></h4></div>
                    </span>
                </div>
            );
        }

        return detailsContent;
    },
    render() {
        return (
            <Draggable start={{x: 100, y: 55}} handle=".handle">
                <Panel className="details-panel" header={this.renderHeader()} bsStyle="primary">
                    {this.renderDetailsContent()}
                </Panel>
            </Draggable>
        );
    },
    resetBBOX() {
        for (let prop in this.extent) {
            if (prop) {
                let coordinateInput = document.getElementById("queryform_bbox_" + prop);
                coordinateInput.value = this.extent[prop];
                this.onUpdateBBOX(coordinateInput.value, prop);
            }
        }
    },
    resetRadius() {
        let coordinateInput = document.getElementById("queryform_circle_radius");
        coordinateInput.value = this.circle.radius;
        this.onUpdateRadius(coordinateInput.value, "radius");
    }
});

module.exports = GeometryDetails;
