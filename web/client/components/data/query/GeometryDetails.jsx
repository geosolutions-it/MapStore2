const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {Row, Col, FormControl} = require('react-bootstrap');
const SwitchPanel = require('../../misc/switch/SwitchPanel');
const I18N = require('../../I18N/I18N');

const assign = require('object-assign');

const CoordinatesUtils = require("../../../utils/CoordinatesUtils");


class GeometryDetails extends React.Component {
    static propTypes = {
        useMapProjection: PropTypes.bool,
        geometry: PropTypes.object,
        type: PropTypes.string,
        onShowPanel: PropTypes.func,
        onChangeDrawingStatus: PropTypes.func,
        onEndDrawing: PropTypes.func,
        zoom: PropTypes.number
    };

    static defaultProps = {
        useMapProjection: true,
        geometry: null,
        type: null,
        onShowPanel: () => {},
        onChangeDrawingStatus: () => {},
        onEndDrawing: () => {}
    };

    componentDidMount() {

        const geometry = this.props.geometry;

        if (this.props.type === "BBOX") {

            this.extent = this.getBBOXDimensions(geometry);
            this.tempExtent = assign({}, this.extent);

        } else if (this.props.type === "Circle") {

            this.circle = this.getCircleDimensions(geometry);
            this.tempCircle = assign({}, this.circle);

        }
    }

    onUpdateBBOX = (value, name) => {
        this.tempExtent[name] = parseFloat(value);

        let coordinates = [];
        for (let prop in this.tempExtent) {
            if (prop) {
                coordinates.push(this.tempExtent[prop]);
            }
        }

        let bbox = !this.props.useMapProjection ?
            CoordinatesUtils.reprojectBbox(coordinates, 'EPSG:4326', this.props.geometry.projection) : coordinates;

        let geometry = {
            type: this.props.geometry.type,
            coordinates: [[
                [bbox[0], bbox[1]],
                [bbox[0], bbox[3]],
                [bbox[2], bbox[3]],
                [bbox[2], bbox[1]],
                [bbox[0], bbox[1]]
            ]],
            projection: this.props.geometry.projection
        };

        this.props.onChangeDrawingStatus("replace", undefined, "queryform", [geometry]);
    };

    onUpdateCircle = (value, name) => {
        this.tempCircle[name] = parseFloat(value);

        let center = !this.props.useMapProjection ?
            CoordinatesUtils.reproject([this.tempCircle.x, this.tempCircle.y], 'EPSG:4326', this.props.geometry.projection) : [this.tempCircle.x, this.tempCircle.y];

        center = center.x === undefined ? {x: center[0], y: center[1]} : center;

        let geometry = {
            type: this.props.geometry.type,
            center: center,
            coordinates: [center.x, center.y],
            radius: this.tempCircle.radius,
            projection: this.props.geometry.projection
        };

        this.props.onChangeDrawingStatus("replace", undefined, "queryform", [geometry]);
    };

    onModifyGeometry = () => {
        let geometry;
        // Update the geometry
        if (this.props.type === "BBOX") {
            this.extent = this.tempExtent;

            let coordinates = [];
            for (let prop in this.extent) {
                if (prop) {
                    coordinates.push(this.extent[prop]);
                }
            }

            let bbox = !this.props.useMapProjection ?
                CoordinatesUtils.reprojectBbox(coordinates, 'EPSG:4326', this.props.geometry.projection) : coordinates;

            let center = [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];

            geometry = {
                type: this.props.geometry.type,
                extent: bbox,
                center: center,
                coordinates: [[
                    [bbox[0], bbox[1]],
                    [bbox[0], bbox[3]],
                    [bbox[2], bbox[3]],
                    [bbox[2], bbox[1]],
                    [bbox[0], bbox[1]]
                ]],
                radius: Math.sqrt(Math.pow(center[0] - bbox[0], 2) + Math.pow(center[1] - bbox[1], 2)),
                projection: this.props.geometry.projection
            };
        } else if (this.props.type === "Circle") {
            this.circle = this.tempCircle;

            let center = !this.props.useMapProjection ?
                CoordinatesUtils.reproject([this.tempCircle.x, this.tempCircle.y], 'EPSG:4326', this.props.geometry.projection) : [this.tempCircle.x, this.tempCircle.y];

            center = center.x === undefined ? {x: center[0], y: center[1]} : center;

            let extent = [
                center.x - this.circle.radius, center.y - this.circle.radius,
                center.x + this.circle.radius, center.y + this.circle.radius
            ];
            let coordinates = CoordinatesUtils.calculateCircleCoordinates(center, this.circle.radius, 100);
            if (this.props.geometry && this.props.geometry.projection) {
                // reproject into "EPSG:3857" to draw and circle coordinates
                const METRIC = "EPSG:3857";
                const tempCenter = CoordinatesUtils.reproject(center, this.props.geometry.projection, METRIC);
                const tempCoordinates = CoordinatesUtils.calculateCircleCoordinates(tempCenter, this.circle.radius, 100);
                const tempPolygon = CoordinatesUtils.reprojectGeoJson({type: "Feature", geometry: {type: "Polygon", coordinates: tempCoordinates}}, METRIC, this.props.geometry.projection);
                coordinates = tempPolygon.geometry.coordinates;
            }
            geometry = {
                type: this.props.geometry.type,
                extent: extent,
                center: center,
                coordinates,
                radius: this.circle.radius,
                projection: this.props.geometry.projection
            };
        }

        this.props.onEndDrawing(geometry, "queryform");
        this.props.onShowPanel(false);
    };

    onClosePanel = () => {
        this.resetGeom();
        this.props.onShowPanel(false);
    };
    getStep = (zoom = 1) => Math.min(1 / Math.pow(10, Math.ceil(Math.min(zoom, 21) / 3) - 2), 1);
    getStepCircle = (zoom, name) => {
        const step = this.getStep(zoom);
        return name === 'radius' && step * 10000 || step;
    };
    getBBOXDimensions = (geometry) => {
        const extent = geometry.projection !== 'EPSG:4326' && !this.props.useMapProjection ?
            CoordinatesUtils.reprojectBbox(geometry.extent, geometry.projection, 'EPSG:4326') : geometry.extent;

        return {
            // minx
            west: extent[0],
            // miny
            sud: extent[1],
            // maxx
            est: extent[2],
            // maxy
            north: extent[3]
        };
    };
    getCircleDimensions = (geometry) => {
        // Show the center coordinates in 4326
        let center = geometry.projection !== 'EPSG:4326' && !this.props.useMapProjection ?
            CoordinatesUtils.reproject(geometry.center, geometry.projection, 'EPSG:4326') : geometry.center;

        // If point isn't reprojected, it's an array cast to object.
        center = (center.x === undefined) ? {x: center[0], y: center[1]} : center;

        return {
            x: center.x,
            y: center.y,
            radius: geometry.radius
        };
    };
    renderCoordinateField = (value, name) => {
        return (
            <div>
                <div className="detail-field-title">{name}</div>
                <FormControl
                    style={{minWidth: '105px', margin: 'auto'}}
                    type="number"
                    id={"queryform_bbox_" + name}
                    step={!this.isWGS84() ? 1 : this.getStep(this.props.zoom)}
                    defaultValue={this.roundValue(value, !this.isWGS84() ? 100 : 1000000)}
                    onChange={(evt) => this.onUpdateBBOX(evt.target.value, name)}/>
            </div>
        );
    };
    renderCircleField = (value, name) => {
        return (
            <FormControl
                type="number"
                id={"queryform_circle_" + name}
                defaultValue={this.roundValue(value, !this.isWGS84() || name === 'radius' ? 100 : 1000000)}
                step={!this.isWGS84() ? 1 : this.getStepCircle(this.props.zoom, name)}
                onChange={(evt) => this.onUpdateCircle(evt.target.value, name)}/>
        );
    };

    renderDetailsContent = () => {
        let detailsContent;
        let geometry = this.props.geometry;

        if (this.props.type === "BBOX") {

            const extent = this.getBBOXDimensions(geometry);

            detailsContent =
                (<div>
                    <div className="container-fluid">
                        <Row>
                            <Col xs={4}>
                                <span/>
                            </Col>
                            <Col xs={4}>
                                {this.renderCoordinateField(extent.north, "north")}
                            </Col>
                            <Col xs={4}>
                                <span/>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={4}>
                                {this.renderCoordinateField(extent.west, "west")}
                            </Col>
                            <Col xs={4}>
                                <span/>
                            </Col>
                            <Col xs={4}>
                                {this.renderCoordinateField(extent.est, "est")}
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={4}>
                                <span/>
                            </Col>
                            <Col xs={4}>
                                {this.renderCoordinateField(extent.sud, "sud")}
                            </Col>
                            <Col xs={4}>
                                <span/>
                            </Col>
                        </Row>
                    </div>
                    <span>
                        <hr width="90%"/>
                        <div ><h5><I18N.Message msgId={"queryform.spatialfilter.details.details_bbox_label"}/></h5></div>
                    </span>
                </div>)
            ;
        } else if (this.props.type === "Circle") {
            const circle = this.getCircleDimensions(geometry);

            detailsContent =
                (<div>
                    <div className="container-fluid">
                        <Row>
                            <Col xs={2}>
                                <span/>
                            </Col>
                            <Col xs={2}>
                                <span className="details-circle-attribute-name">{'x:'}</span>
                            </Col>
                            <Col xs={4}>
                                {this.renderCircleField(circle.x, "x")}
                            </Col>
                            <Col xs={4}>
                                <span/>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={2}>
                                <span/>
                            </Col>
                            <Col xs={2}>
                                <span className="details-circle-attribute-name">{'y:'}</span>
                            </Col>
                            <Col xs={4}>
                                {this.renderCircleField(circle.y, "y")}
                            </Col>
                            <Col xs={4}>
                                <span/>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={2}>
                                <span/>
                            </Col>
                            <Col xs={2}>
                                <span className="details-circle-attribute-name"><I18N.Message msgId={"queryform.spatialfilter.details.radius"}/>{':'}</span>
                            </Col>
                            <Col xs={4}>
                                {this.renderCircleField(circle.radius, "radius")}
                            </Col>
                            <Col xs={4}>
                                <span/>
                            </Col>
                        </Row>
                    </div>
                    <span>
                        <hr width="90%"/>
                        <div><h5><I18N.Message msgId={"queryform.spatialfilter.details.details_circle_label"}/></h5></div>
                    </span>
                </div>)
            ;
        }

        return detailsContent;
    };

    render() {
        return (
            <SwitchPanel buttons={[{
                key: 'confirm',
                glyph: 'ok',
                tooltipId: 'confirm',
                onClick: () => this.onModifyGeometry()
            }, {
                key: 'reset',
                tooltipId: 'queryform.reset',
                glyph: 'clear-filter',
                onClick: () => this.resetGeom()
            }, {
                key: 'close',
                glyph: '1-close',
                onClick: () => this.onClosePanel(false)
            }]} title={<I18N.Message msgId={"queryform.spatialfilter.details.details_header"}/>} locked expanded className="details-panel" bsStyle="primary">
                {this.renderDetailsContent()}
            </SwitchPanel>
        );
    }
    isWGS84 = () => (this.props.geometry || {}).projection === 'EPSG:4326' || !this.props.useMapProjection;
    roundValue = (val, prec = 1000000) => Math.round(val * prec) / prec;
    resetGeom = () => {
        if (this.props.type === "BBOX") {
            this.resetBBOX();
        } else if (this.props.type === "Circle") {
            this.resetCircle();
        }
    };
    resetBBOX = () => {
        for (let prop in this.extent) {
            if (prop) {
                let coordinateInput = document.getElementById("queryform_bbox_" + prop);
                coordinateInput.value = this.roundValue(this.extent[prop], !this.isWGS84() ? 100 : 1000000);
                this.onUpdateBBOX(this.extent[prop], prop);
            }
        }
    };

    resetCircle = () => {
        let radiusInput = document.getElementById("queryform_circle_radius");
        radiusInput.value = this.roundValue(this.circle.radius, 100);
        this.onUpdateCircle(this.circle.radius, "radius");

        let coordinateXInput = document.getElementById("queryform_circle_x");
        coordinateXInput.value = this.roundValue(this.circle.x, !this.isWGS84() ? 100 : 1000000);
        this.onUpdateCircle(this.circle.x, "x");

        let coordinateYInput = document.getElementById("queryform_circle_y");
        coordinateYInput.value = this.roundValue(this.circle.y, !this.isWGS84() ? 100 : 1000000);
        this.onUpdateCircle(this.circle.y, "y");
    };
}

module.exports = GeometryDetails;
