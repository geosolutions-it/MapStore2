/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const {Row, Col} = require('react-bootstrap');
const SwitchPanel = require('../../misc/switch/SwitchPanel');
const I18N = require('../../I18N/I18N');

const assign = require('object-assign');

const CoordinatesUtils = require("../../../utils/CoordinatesUtils");
const IntlNumberFormControl = require("../../I18N/IntlNumberFormControl");


class GeometryDetails extends React.Component {
    static propTypes = {
        useMapProjection: PropTypes.bool,
        geometry: PropTypes.object,
        type: PropTypes.string,
        onShowPanel: PropTypes.func,
        onChangeDrawingStatus: PropTypes.func,
        zoom: PropTypes.number,
        projection: PropTypes.string,
        enableGeodesic: PropTypes.bool
    };

    static defaultProps = {
        useMapProjection: true,
        geometry: null,
        type: null,
        onShowPanel: () => {},
        onChangeDrawingStatus: () => {}
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

    onUpdateBBOX = (value, name, drawStatus = 'replace') => {
        if (drawStatus === 'replace') {
            this.tempExtent[name] = !isNaN(parseFloat(value)) && parseFloat(value) || 0;
        }
        let coordinates = [];
        for (let prop in this.tempExtent) {
            if (prop) {
                coordinates.push(this.tempExtent[prop]);
            }
        }

        let bbox = CoordinatesUtils.reprojectBbox(coordinates, 'EPSG:4326', this.props.projection);

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

        this.props.onChangeDrawingStatus(drawStatus, undefined, "queryform", [geometry]);
    };

    onUpdateCircle = (value, name, drawStatus = 'replace') => {
        if (drawStatus === 'replace') {
            this.tempCircle[name] = parseFloat(value);
        }
        let center = !isNaN(parseFloat(this.tempCircle.x)) && !isNaN(parseFloat(this.tempCircle.y)) ?
            CoordinatesUtils.reproject([this.tempCircle.x, this.tempCircle.y], 'EPSG:4326', this.props.projection) : [this.tempCircle.x, this.tempCircle.y];

        center = center.x === undefined ? {x: center[0], y: center[1]} : center;
        const validateCenter = {x: !isNaN(center.x) ? center.x : 0, y: !isNaN(center.y) ? center.y : 0};

        let geometry = {
            type: this.props.geometry.type,
            center: validateCenter,
            coordinates: [validateCenter.x, validateCenter.y],
            radius: !isNaN(this.tempCircle.radius) ? this.tempCircle.radius : 0,
            projection: this.props.geometry.projection
        };


        this.props.onChangeDrawingStatus(drawStatus, undefined, "queryform", [geometry], {geodesic: this.props.enableGeodesic});
    };

    onModifyGeometry = () => {
        if (this.props.type === "BBOX") {
            this.onUpdateBBOX(null, null, 'endDrawing');
        } else if (this.props.type === "Circle") {
            this.onUpdateCircle(null, null, 'endDrawing');
        }
        this.props.onShowPanel(false);
    };

    onClosePanel = () => {
        this.resetGeom();
        this.props.onShowPanel(false);
    };
    getStep = (zoom = 1) => Math.min(1 / Math.pow(10, Math.ceil(Math.min(zoom, 21) / 3) - 2), 1);
    getStepCircle = (zoom, name) => {
        const step = this.getStep(zoom);
        return (name === 'radius' && !this.isWGS84() && step * 10000) || step;
    };
    getBBOXDimensions = (geometry) => {
        const extent =  CoordinatesUtils.reprojectBbox(geometry.extent, geometry.projection, 'EPSG:4326');

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
        const center = CoordinatesUtils.reproject(geometry.center, geometry.projection, 'EPSG:4326');
        const centerReproject = CoordinatesUtils.reproject(geometry.center, geometry.projection, this.props.projection);
        const radiusEnd = CoordinatesUtils.reproject([geometry.center[0] + geometry.radius, geometry.center[1]], geometry.projection, this.props.projection);
        const radius = Math.sqrt((radiusEnd.x - centerReproject.x) * (radiusEnd.x - centerReproject.x) +
            (radiusEnd.y - centerReproject.y) * (radiusEnd.y - centerReproject.y));

        return {
            x: center.x,
            y: center.y,
            radius: radius
        };
    };
    renderCoordinateField = (value, name) => {
        return (
            <div>
                <div className="detail-field-title">{name}</div>
                <IntlNumberFormControl
                    style={{minWidth: '105px', margin: 'auto'}}
                    type="number"
                    id={"queryform_bbox_" + name}
                    step={this.getStep(this.props.zoom)}
                    defaultValue={this.roundValue(value, 1000000)}
                    onChange={(val) => this.onUpdateBBOX(val, name)}/>
            </div>
        );
    };
    renderCircleField = (value, name) => {
        // radius should have 2 decimals if uom of projections is meter (EPSG:3857)
        // all other cases it must have at least 6 decimals because coords are converted to EPSG:4326
        return (
            <IntlNumberFormControl
                type="number"
                id={"queryform_circle_" + name}
                defaultValue={this.roundValue(value, name === 'radius' && !this.isWGS84() ? 100 : 1000000)}
                step={this.getStepCircle(this.props.zoom, name)}
                onChange={(val) => this.onUpdateCircle(val, name)}/>
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
            const uom = CoordinatesUtils.getUnits(this.props.projection);
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
                                <span className="details-circle-attribute-name">
                                    <I18N.Message
                                        msgId="queryform.spatialfilter.details.radius"
                                        msgParams={{unit: uom === "degrees" ? "°" : uom }}/>{':'}
                                </span>
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
    isWGS84 = () => this.props.projection === 'EPSG:4326';
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
                coordinateInput.value = this.roundValue(this.extent[prop], 1000000);
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
