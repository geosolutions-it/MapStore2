/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');


const LayersUtils = require('../../utils/LayersUtils');
const FileUtils = require('../../utils/FileUtils');
let StyleUtils;
const {Grid, Row, Col, Button} = require('react-bootstrap');

const Combobox = require('react-widgets').Combobox;

const Message = require('../locale/Message');

const {SelectShape, StylePolygon, StylePolyline, StylePoint} = require('./index');
const {Glyphicon, Panel} = require('react-bootstrap');

const Dialog = require('../../components/misc/Dialog');

const ShapeFile = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        layers: React.PropTypes.array,
        selected: React.PropTypes.object,
        style: React.PropTypes.object,
        shapeStyle: React.PropTypes.object,
        onShapeError: React.PropTypes.func,
        onShapeChoosen: React.PropTypes.func,
        addShapeLayer: React.PropTypes.func,
        shapeLoading: React.PropTypes.func,
        onSelectLayer: React.PropTypes.func,
        onLayerAdded: React.PropTypes.func,
        error: React.PropTypes.string,
        mapType: React.PropTypes.string,
        wrap: React.PropTypes.bool,
        wrapWithPanel: React.PropTypes.bool,
        panelStyle: React.PropTypes.object,
        panelClassName: React.PropTypes.string,
        visible: React.PropTypes.bool,
        toggleControl: React.PropTypes.func,
        closeGlyph: React.PropTypes.string,
        buttonSize: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            id: "mapstore-shapefile-upload",
            wrap: false,
            wrapWithPanel: true,
            panelStyle: {
                minWidth: "360px",
                zIndex: 100,
                position: "absolute",
                overflow: "auto",
                top: "100px",
                left: "calc(50% - 150px)"
            },
            panelClassName: "toolbar-panel",
            visible: false,
            toggleControl: () => {},
            closeGlyph: "",
            buttonSize: "large"
        };
    },
    componentWillMount() {
        StyleUtils = require('../../utils/StyleUtils')(this.props.mapType);
    },
    getInitialState() {
        return {
            useDefaultStyle: false
        };
    },
    getGeomType(layer) {
        if (layer && layer.features && layer.features[0].geometry) {
            return layer.features[0].geometry.type;
        }
    },
    renderError() {
        return (<Row>
                   <div style={{textAlign: "center"}} className="alert alert-danger">{this.props.error}</div>
                </Row>);
    },
    renderStyle() {
        switch (this.getGeomType(this.props.selected)) {
            case 'Polygon':
            case 'MultiPolygon': {
                return (<StylePolygon/>);
            }
            case 'MultiLineString':
            case 'LineString':
            {
                return (<StylePolyline/>);
            }
            case 'Point':
            case 'MultiPoint': {
                return (<StylePoint/>);
            }
            default: {
                return null;
            }
        }
    },
    renderDefaultStyle() {
        return (this.props.selected) ? (
            <Row>
                <Col xs={1}>
                    <input aria-label="..." type="checkbox" defaultChecked={this.state.useDefaultStyle} onChange={(e) => {this.setState({useDefaultStyle: e.target.checked}); }}/>
                </Col>
                <Col style={{paddingLeft: 0, paddingTop: 1}} xs={5}>
                    <label>Default style</label>
                </Col>
            </Row>) : null;
    },
    render() {
        const panel = (
            <Grid role="body" style={{width: "300px"}} fluid>
                {(this.props.error) ? this.renderError() : null}
            <Row style={{textAlign: "center"}}>
                {
            (this.props.selected) ?
                <Combobox data={this.props.layers} value={this.props.selected} onChange={(value)=> this.props.onSelectLayer(value)}valueField={"id"} textField={"name"} /> :
                <SelectShape errorMessage="shapefile.error.select" text={<Message msgId="shapefile.placeholder"/>} onShapeChoosen={this.addShape}/>
            }
            </Row>
            <Row style={{marginBottom: 10}}>
                {(this.state.useDefaultStyle) ? null : this.renderStyle()}
            </Row>
            {this.renderDefaultStyle()}

                {(this.props.selected) ?
                (<Row >
                    <Col xsOffset={6} xs={3}> <Button bsSize={this.props.buttonSize} disabled={!this.props.selected} onClick={() => {this.props.onShapeChoosen(null); }}>{<Message msgId="shapefile.cancel"/>}</Button></Col>
                    <Col xs={3}> <Button bsStyle="primary" bsSize={this.props.buttonSize} disabled={!this.props.selected} onClick={this.addToMap}>{<Message msgId="shapefile.add"/>}</Button></Col>
                </Row>
                    ) : null }
            </Grid>
        );
        if (this.props.wrap) {
            if (this.props.visible) {
                if (this.props.wrapWithPanel) {
                    return (<Panel id={this.props.id} header={<span><span className="shapefile-panel-title"><Message msgId="shapefile.title"/></span><span className="shapefile-panel-close panel-close" onClick={this.props.toggleControl}></span></span>} style={this.props.panelStyle} className={this.props.panelClassName}>
                        {panel}
                    </Panel>);
                }
                return (<Dialog id={this.props.id} style={this.props.panelStyle} className={this.props.panelClassName}>
                    <span role="header">
                        <span className="shapefile-panel-title"><Message msgId="shapefile.title"/></span>
                        <button onClick={this.props.toggleControl} className="shapefile-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button>
                    </span>
                    {panel}
                </Dialog>);
            }
            return null;
        }
        return panel;
    },
    addShape(files) {
        this.props.shapeLoading(true);
        let queue = files.map((file) => {
            return FileUtils.readZip(file).then((buffer) => {
                return FileUtils.shpToGeoJSON(buffer);
            });
        }, this);
        Promise.all(queue).then((geoJsons) => {
            let ls = geoJsons.reduce((layers, geoJson) => {
                if (geoJson) {
                    return layers.concat(geoJson.map((layer) => {
                        return LayersUtils.geoJSONToLayer(layer);
                    }));
                }
            }, []);
            this.props.onShapeChoosen(ls);
            this.props.shapeLoading(false);
        }).catch((e) => {
            this.props.shapeLoading(false);
            this.props.onShapeError(e.message || e);
        });
    },
    addToMap() {
        this.props.shapeLoading(true);
        let styledLayer = this.props.selected;
        if (!this.state.useDefaultStyle) {
            styledLayer = StyleUtils.toVectorStyle(styledLayer, this.props.shapeStyle);
        }
        Promise.resolve(this.props.addShapeLayer( styledLayer )).then(() => {
            this.props.shapeLoading(false);
            this.props.onLayerAdded(this.props.selected);
        }).catch((e) => {
            this.props.shapeLoading(false);
            this.props.onShapeError(e.message || e);
        });
    }
});


module.exports = ShapeFile;
