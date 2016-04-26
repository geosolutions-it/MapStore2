/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');

const LayersUtils = require('../utils/LayersUtils');
const FileUtils = require('../utils/FileUtils');

const {Grid, Row} = require('react-bootstrap');

const Message = require('../components/I18N/Message');

const {SelectShape} = require('./shapefile/index');
const {onShapeError, shapeLoading} = require('../actions/shapefile');
const {addLayer} = require('../actions/layers');


const ShapeFile = React.createClass({
    propTypes: {
        files: React.PropTypes.object,
        style: React.PropTypes.object,
        onShapeError: React.PropTypes.func,
        addShapeLayer: React.PropTypes.func,
        shapeLoading: React.PropTypes.func,
        error: React.PropTypes.string
    },
    renderError() {

        return (<Row>
                   <div style={{textAlign: "center"}} className="alert alert-danger">{this.props.error}</div>
                </Row>);

    },
    render() {
        return (
            <Grid style={{width: "300px"}} fluid>
                {(this.props.error) ? this.renderError() : null}
            <Row style={{textAlign: "center"}}>
                <SelectShape errorMessage="shapefile.error.select" text={<Message msgId="shapefile.placeholder"/>} onShapeChoosen={this.addShape}/>
            </Row>
            </Grid>
            );
    },
    addShape(files) {
        this.props.shapeLoading(true);
        let queue = files.map((file) => {
            return FileUtils.readZip(file).then((buffer) => {
                return FileUtils.shpToGeoJSON(buffer);
            });
        }, this);
        Promise.all(queue).then((geoJsons) => {
            geoJsons.forEach((geoJson) => {
                if (geoJson) {
                    geoJson.map((layer) => {
                        this.props.addShapeLayer(LayersUtils.geoJSONToLayer(layer));
                    });
                }
            }, this);
            this.props.shapeLoading(false);
        }).catch((e) => {
            this.props.shapeLoading(false);
            this.props.onShapeError(e.message || e);
        });
    }

});

module.exports = {
    ShapeFile: connect((state) => (
        {
            error: state.shapefile && state.shapefile.error || null
        }
        ), {
            onShapeError: onShapeError,
            addShapeLayer: addLayer,
            shapeLoading: shapeLoading
        })(ShapeFile),
    reducers: {shapefile: require('../reducers/shapefile')}
};
