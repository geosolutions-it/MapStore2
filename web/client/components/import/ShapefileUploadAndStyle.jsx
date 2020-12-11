/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import { Grid, Row, Col } from 'react-bootstrap';
import { isString } from 'lodash';
import { DropdownList as Combobox } from 'react-widgets';

import Message from '../../components/I18N/Message';
import { geoJSONToLayer } from '../../utils/LayersUtils';
import { getMessageById } from '../../utils/LocaleUtils';

import {
    recognizeExt,
    MIME_LOOKUPS,
    readKml,
    kmlToGeoJSON,
    gpxToGeoJSON,
    readKmz,
    readZip,
    checkShapePrj,
    shpToGeoJSON
} from '../../utils/FileUtils';
import Button from '../misc/Button';
import SelectShape from './SelectShape';
import { Promise } from 'es6-promise';

class ShapeFileUploadAndStyle extends React.Component {
    static propTypes = {
        bbox: PropTypes.array,
        layers: PropTypes.array,
        selected: PropTypes.object,
        style: PropTypes.object,
        shapeStyle: PropTypes.object,
        readFiles: PropTypes.func,
        onShapeError: PropTypes.func,
        onShapeSuccess: PropTypes.func,
        onShapeChoosen: PropTypes.func,
        addShapeLayer: PropTypes.func,
        shapeLoading: PropTypes.func,
        onSelectLayer: PropTypes.func,
        onLayerAdded: PropTypes.func,
        onZoomSelected: PropTypes.func,
        updateShapeBBox: PropTypes.func,
        error: PropTypes.string,
        success: PropTypes.string,
        mapType: PropTypes.string,
        buttonSize: PropTypes.string,
        uploadMessage: PropTypes.object,
        cancelMessage: PropTypes.object,
        addMessage: PropTypes.object,
        stylers: PropTypes.object,
        uploadOptions: PropTypes.object,
        createId: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        shapeLoading: () => {},
        readFiles: (files, onWarnings) => files.map((file) => {
            const ext = recognizeExt(file.name);
            const type = file.type || MIME_LOOKUPS[ext];
            if (type === 'application/vnd.google-earth.kml+xml') {
                return readKml(file).then((xml) => {
                    return kmlToGeoJSON(xml);
                });
            }
            if (type === 'application/gpx+xml') {
                return readKml(file).then((xml) => {
                    return gpxToGeoJSON(xml);
                });
            }
            if (type === 'application/vnd.google-earth.kmz') {
                return readKmz(file).then((xml) => {
                    return kmlToGeoJSON(xml);
                });
            }
            if (type === 'application/x-zip-compressed' ||
                type === 'application/zip' ) {
                return readZip(file).then((buffer) => {
                    return checkShapePrj(buffer).then((warnings) => {
                        if (warnings.length > 0) {
                            onWarnings('shapefile.error.missingPrj');
                        }
                        return shpToGeoJSON(buffer);
                    });
                });
            }
            return null;
        }),
        mapType: "leaflet",
        stylers: {},
        buttonSize: "small",
        uploadOptions: {},
        createId: () => undefined,
        bbox: null
    };

    state = {
        useDefaultStyle: false,
        zoomOnShapefiles: true
    };

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
        return (<Row>
            <div style={{textAlign: "center"}} className="alert alert-danger"><Message msgId={this.props.error}/></div>
        </Row>);
    };

    renderSuccess = () => {
        return (<Row>
            <div style={{textAlign: "center", overflowWrap: "break-word"}} className="alert alert-success">{this.props.success}</div>
        </Row>);
    };

    renderStyle = () => {
        return this.props.stylers[this.getGeomType(this.props.selected)];
    };

    renderDefaultStyle = () => {
        return this.props.selected ?
            <Row>
                <Col xs={2}>
                    <input aria-label="..." type="checkbox" defaultChecked={this.state.useDefaultStyle} onChange={(e) => {this.setState({useDefaultStyle: e.target.checked}); }}/>
                </Col>
                <Col style={{paddingLeft: 0, paddingTop: 1}} xs={10}>
                    <label><Message msgId="shapefile.defaultStyle"/></label>
                </Col>

                <Col xs={2}>
                    <input aria-label="..." type="checkbox" defaultChecked={this.state.zoomOnShapefiles} onChange={(e) => {this.setState({zoomOnShapefiles: e.target.checked}); }}/>
                </Col>
                <Col style={{paddingLeft: 0, paddingTop: 1}} xs={10}>
                    <label><Message msgId="shapefile.zoom"/></label>
                </Col>
            </Row>
            : null;
    };

    render() {
        return (
            <Grid role="body" style={{width: "300px"}} fluid>
                {this.props.error ? this.renderError() : null}
                {this.props.success ? this.renderSuccess() : null}
                <Row style={{textAlign: "center"}}>
                    {
                        this.props.selected
                            ? <Combobox data={this.props.layers} value={this.props.selected} onSelect={(value)=> this.props.onSelectLayer(value)} valueField={"id"} textField={"name"} />
                            : <SelectShape {...this.props.uploadOptions} errorMessage="shapefile.error.select" text={this.props.uploadMessage} onShapeChoosen={this.addShape} onShapeError={this.props.onShapeError}/>
                    }
                </Row>
                <Row style={{marginBottom: 10}}>
                    {this.state.useDefaultStyle ? null : this.renderStyle()}
                </Row>
                {this.renderDefaultStyle()}

                {this.props.selected ?
                    <Row>
                        <Col xsOffset={6} xs={3}> <Button bsSize={this.props.buttonSize} disabled={!this.props.selected} onClick={() => {this.props.onShapeChoosen(null); }}>{this.props.cancelMessage}</Button></Col>
                        <Col xs={3}> <Button bsStyle="primary" bsSize={this.props.buttonSize} disabled={!this.props.selected} onClick={this.addToMap}>{this.props.addMessage}</Button></Col>
                    </Row>
                    : null }
            </Grid>
        );
    }

    addShape = (files) => {
        this.props.shapeLoading(true);
        let queue = this.props.readFiles(files, this.props.onShapeError);
        // geoJsons is array of array
        Promise.all(queue).then((geoJsons) => {
            let ls = geoJsons.filter((element) => (element[0] && element[0].features && element[0].features.length !== 0) || element[0].type === "Feature");
            ls = ls.reduce((layers, geoJson) => {
                // geoJson is array
                if (geoJson) {
                    return layers.concat(geoJson.map((layer) => {
                        return geoJSONToLayer(layer, this.props.createId(layer, geoJson));
                    }));
                }
                return layers;
            }, []);
            this.props.onShapeChoosen(ls);
            this.props.shapeLoading(false);
        }).catch(e => {
            this.props.shapeLoading(false);
            const errorName = e && e.name || e || '';
            if (isString(errorName) && errorName === 'SyntaxError') {
                this.props.onShapeError('shapefile.error.shapeFileParsingError');
            } else {
                this.props.onShapeError('shapefile.error.genericLoadError');
            }
        });
    };

    addToMap = () => {
        this.props.shapeLoading(true);
        let styledLayer = this.props.selected;

        Promise.resolve(this.props.addShapeLayer( styledLayer )).then(() => {
            this.props.shapeLoading(false);
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
                this.props.updateShapeBBox(bbox && bbox.length ? bbox : this.props.bbox);
                this.props.onZoomSelected(bbox && bbox.length ? bbox : this.props.bbox, "EPSG:4326");
            }
            this.props.onShapeSuccess(this.props.layers[0].name + getMessageById(this.context.messages, "shapefile.success"));
            this.props.onLayerAdded(this.props.selected);
        }).catch(() => {
            this.props.shapeLoading(false);
            this.props.onShapeError('shapefile.error.genericLoadError');
        });
    };
}


export default ShapeFileUploadAndStyle;
