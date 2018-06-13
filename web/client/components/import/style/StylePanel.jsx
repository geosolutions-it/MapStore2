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
let StyleUtils;
const { Grid, Row, Col, Button, Alert} = require('react-bootstrap');

const Combo = require('react-widgets').DropdownList;

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
        onSelectLayer: PropTypes.func,
        onLayerAdded: PropTypes.func,
        onZoomSelected: PropTypes.func,
        updateBBox: PropTypes.func,
        errors: PropTypes.array,
        success: PropTypes.string,
        mapType: PropTypes.string,
        buttonSize: PropTypes.string,
        cancelMessage: PropTypes.object,
        addMessage: PropTypes.object,
        stylers: PropTypes.object
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        mapType: "leaflet",
        buttonSize: "small",
        setLayers: () => {},
        addLayer: () => {},
        updateBBox: () => {},
        onZoomSelected: () => {},
        stylers: {},
        bbox: null
    };

    state = {
        useDefaultStyle: false,
        zoomOnShapefiles: true
    };

    componentWillMount() {
        StyleUtils = require('../../../utils/StyleUtils')(this.props.mapType);
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
            <Grid role="body" style={{width: "300px"}} fluid>
                {this.props.errors ? this.renderError() : null}
                {this.props.success ? this.renderSuccess() : null}
            <Row key="select" style={{textAlign: "center"}}>
                <Combo data={this.props.layers} value={this.props.selected} onSelect={(value)=> this.props.onSelectLayer(value)} valueField={"id"} textField={"name"} />
            </Row>
            <Row key="styler" style={{marginBottom: 10}}>
                    {this.state.useDefaultStyle ? null : this.props.stylers[this.getGeomType(this.props.selected)]}
            </Row>
                <Row key="options">
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
                </Row>
            <Row>
                <Col xsOffset={6} xs={3}> <Button bsSize={this.props.buttonSize} disabled={!this.props.selected} onClick={() => { this.props.setLayers(null); }}>{this.props.cancelMessage}</Button></Col>
                <Col xs={3}> <Button bsStyle="primary" bsSize={this.props.buttonSize} disabled={!this.props.selected} onClick={this.addToMap}>{this.props.addMessage}</Button></Col>
            </Row>
            </Grid>
        );
    }

    addToMap = () => {
        let styledLayer = this.props.selected;
        if (!this.state.useDefaultStyle) {
            styledLayer = StyleUtils.toVectorStyle(styledLayer, this.props.shapeStyle);
        }
        Promise.resolve(this.props.addLayer( styledLayer )).then(() => {
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

            this.props.onSuccess(this.props.layers.length > 1
                ? this.props.layers[0].name + LocaleUtils.getMessageById(this.context.messages, "shapefile.success")
                : undefined);

            this.props.onLayerAdded(this.props.selected);
        }).catch(e => {
            this.props.onError({ type: "error", name: this.props.layers[0].name, error: e, message: 'shapefile.error.genericLoadError'});
        });
    };
}


module.exports = StylePanel;
