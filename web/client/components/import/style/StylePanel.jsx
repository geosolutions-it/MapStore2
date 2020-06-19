const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const Message = require('../../I18N/Message');
const LocaleUtils = require('../../../utils/LocaleUtils');
const {isAnnotation} = require('../../../utils/AnnotationsUtils');
let { toVectorStyle } = require('../../../utils/StyleUtils');
const { Grid, Row, Col, Button, Alert, ButtonToolbar} = require('react-bootstrap');

const {Promise} = require('es6-promise');

class StylePanel extends React.Component {
    static propTypes = {
        bbox: PropTypes.array,
        layers: PropTypes.array,
        selected: PropTypes.object,
        style: PropTypes.object,
        shapeStyle: PropTypes.object,
        onError: PropTypes.func,
        onSuccess: PropTypes.func,
        setLayers: PropTypes.func,
        addLayer: PropTypes.func,
        loadAnnotations: PropTypes.func,
        onSelectLayer: PropTypes.func,
        onLayerAdded: PropTypes.func,
        onLayerSkipped: PropTypes.func,
        onZoomSelected: PropTypes.func,
        updateBBox: PropTypes.func,
        errors: PropTypes.array,
        success: PropTypes.string,
        mapType: PropTypes.string,
        buttonSize: PropTypes.string,
        cancelMessage: PropTypes.object,
        addMessage: PropTypes.object,
        stylers: PropTypes.object,
        nextMessage: PropTypes.object,
        finishMessage: PropTypes.object,
        skipMessage: PropTypes.object
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        mapType: "leaflet",
        buttonSize: "small",
        setLayers: () => {},
        addLayer: () => {},
        loadAnnotations: () => {},
        updateBBox: () => {},
        onZoomSelected: () => {},
        stylers: {},
        bbox: null
    };

    state = {
        useDefaultStyle: false,
        zoomOnShapefiles: true,
        overrideAnnotation: false,
        initialLayers: []
    };

    componentDidMount() {
        this.setState({initialLayers: [...this.props.layers]});
    }

    getGeometryType = (geometry) => {
        if (geometry && geometry.type === 'GeometryCollection') {
            return geometry.geometries.reduce((previous, g) => {
                if (g && g.type === previous) {
                    return previous;
                }
                return g.type;
            }, null);
        }
        if (geometry) {
            switch (geometry.type) {
            case 'Polygon':
            case 'MultiPolygon': {
                return 'Polygon';
            }
            case 'MultiLineString':
            case 'LineString': {
                return 'LineString';
            }
            case 'Point':
            case 'MultiPoint': {
                return 'Point';
            }
            default: {
                return null;
            }
            }
        }
        return null;
    };

    getGeomType = (layer) => {
        if (layer && layer.features && layer.features[0].geometry) {
            return layer.features.reduce((previous, f) => {
                const currentType = this.getGeometryType(f.geometry);
                if (previous) {
                    return currentType === previous ? previous : 'GeometryCollection';
                }
                return currentType;
            }, null);
        }
        return null;
    };

    renderError = () => {
        return this.props.errors
            && this.props.errors
                .filter(e => (e.filename || e.name)
                && this.props.layers && this.props.layers[0]
                && (this.props.layers[0].filename === e.filename || this.props.layers[0].name === e.name)
                )
                .map( e =>
                    (<Row key={e && e.name + e.message}>
                        <Alert bsStyle={e.type} style={{ textAlign: "center" }}><Message msgId={e.message} /></Alert>
                    </Row>)
                );
    };

    renderSuccess = () => {
        return (<Row>
            <div style={{textAlign: "center", overflowWrap: "break-word"}} className="alert alert-success">{this.props.success}</div>
        </Row>);
    };

    render() {
        return (
            <Grid role="body" style={{width: "400px"}} fluid>
                {this.props.errors ? this.renderError() : null}
                {this.props.success ? this.renderSuccess() : null}
                <Row>
                    <h4>
                        <span style={{fontWeight: 'bold'}}><Message msgId="shapefile.layerOf" msgParams={{ count: this.findLayerSerialNumber(this.props.selected), total: this.state.initialLayers.length}} /></span> {this.props.selected.name}
                    </h4>
                </Row>
                <Row key="styler" style={{marginBottom: 10}}>
                    {this.state.useDefaultStyle ? null : this.props.stylers[this.getGeomType(this.props.selected)]}
                </Row>
                <Row key="options">
                    {isAnnotation(this.props.selected) ?
                        this.annotationOptions()
                        :
                        <>
                            <Col xs={2}>
                                <input aria-label="..." type="checkbox" defaultChecked={this.state.useDefaultStyle} onChange={(e) => { this.setState({ useDefaultStyle: e.target.checked }); }} />
                            </Col>
                            <Col style={{ paddingLeft: 0, paddingTop: 1 }} xs={10}>
                                <label><Message msgId="shapefile.defaultStyle" /></label>
                            </Col>

                            <Col xs={2}>
                                <input aria-label="..." type="checkbox" defaultChecked={this.state.zoomOnShapefiles} onChange={(e) => { this.setState({ zoomOnShapefiles: e.target.checked }); }} />
                            </Col>
                            <Col style={{ paddingLeft: 0, paddingTop: 1 }} xs={10}>
                                <label><Message msgId="shapefile.zoom" /></label>
                            </Col>
                        </>
                    }

                </Row>
                <Row>
                    <ButtonToolbar style={{display: 'flex', justifyContent: 'flex-end'}}>
                        <Button bsSize={this.props.buttonSize} disabled={!this.props.selected} onClick={() => { this.props.setLayers(null); }}>{this.props.cancelMessage}</Button>
                        <Button bsStyle="primary" bsSize={this.props.buttonSize} disabled={!this.props.selected} onClick={() => this.props.onLayerSkipped(this.props.selected)}>{this.props.skipMessage}</Button>
                        <Button bsStyle="primary" bsSize={this.props.buttonSize} disabled={!this.props.selected} onClick={this.addToMap}>{this.props.layers.length === 1 ? this.props.finishMessage : this.props.nextMessage}</Button>
                    </ButtonToolbar>
                </Row>
            </Grid>
        );
    }

    findLayerSerialNumber = ({name}) => {
        const {initialLayers} = this.state;
        return initialLayers.findIndex(initLayer => initLayer.name === name) + 1;
    }

    addToMap = () => {
        let styledLayer = this.props.selected;
        if (!this.state.useDefaultStyle) {
            styledLayer = toVectorStyle(styledLayer, this.props.shapeStyle);
        }
        const isAnnotationLayer = isAnnotation(styledLayer);
        Promise.resolve(isAnnotationLayer ? this.props.loadAnnotations(styledLayer.features, this.state.overrideAnnotation) :
            this.props.addLayer( styledLayer )).then(() => {
            if (!isAnnotationLayer) {
                let bbox = [];
                if (this.props.layers[0].bbox && this.props.bbox) {
                    bbox = [
                        Math.min(this.props.bbox[0], this.props.layers[0].bbox.bounds.minx),
                        Math.min(this.props.bbox[1], this.props.layers[0].bbox.bounds.miny),
                        Math.max(this.props.bbox[2], this.props.layers[0].bbox.bounds.maxx),
                        Math.max(this.props.bbox[3], this.props.layers[0].bbox.bounds.maxy)
                    ];
                }
                if (this.state.zoomOnShapefiles) {
                    this.props.updateBBox(bbox && bbox.length ? bbox : this.props.bbox);
                    this.props.onZoomSelected(bbox && bbox.length ? bbox : this.props.bbox, "EPSG:4326");
                }
            }
            this.props.onSuccess(this.props.layers.length > 1
                ? isAnnotationLayer ? "Annotation" : this.props.layers[0].name + LocaleUtils.getMessageById(this.context.messages, "shapefile.success")
                : undefined);

            this.props.onLayerAdded(this.props.selected);
        }).catch(e => {
            this.props.onError({ type: "error", name: isAnnotationLayer ? "Annotation" : this.props.layers[0].name, error: e, message: 'shapefile.error.genericLoadError'});
        });
    };

    annotationOptions = () => (
        <>
            <Col xs={2}>
                <input type="radio" checked={!this.state.overrideAnnotation} onChange={() => { this.setState({ overrideAnnotation: false }); }} />
            </Col>
            <Col style={{ paddingLeft: 0, paddingTop: 1 }} xs={10}>
                <label><Message msgId="shapefile.merge" /></label>
            </Col>

            <Col xs={2}>
                <input type="radio" checked={this.state.overrideAnnotation} onChange={() => { this.setState({ overrideAnnotation: true }); }} />
            </Col>
            <Col style={{ paddingLeft: 0, paddingTop: 1 }} xs={10}>
                <label><Message msgId="shapefile.replace" /></label>
            </Col>
        </>
    );
}


module.exports = StylePanel;
