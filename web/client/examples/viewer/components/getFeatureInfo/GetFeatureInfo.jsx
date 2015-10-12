/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var assign = require('object-assign');
var {Modal} = require('react-bootstrap');

var I18N = require('../../../../components/I18N/I18N');
var Spinner = require('../../../../components/spinners/BasicSpinner/BasicSpinner');
var JSONFeatureInfoViewer = require('./infoViewers/JSONFeatureInfoViewer');
var HTMLFeatureInfoViewer = require('./infoViewers/HTMLFeatureInfoViewer');
var TEXTFeatureInfoViewer = require('./infoViewers/TEXTFeatureInfoViewer');

var CoordinatesUtils = require('../../../../utils/CoordinatesUtils');
var MapInfoUtils = require('../../../../utils/MapInfoUtils');

var GetFeatureInfo = React.createClass({
    propTypes: {
        infoFormat: React.PropTypes.oneOf(
            MapInfoUtils.getAvailableInfoFormatValues()
        ),
        htmlResponses: React.PropTypes.array,
        htmlRequests: React.PropTypes.object,
        btnConfig: React.PropTypes.object,
        enabled: React.PropTypes.bool,
        mapConfig: React.PropTypes.object,
        layerFilter: React.PropTypes.func,
        actions: React.PropTypes.shape({
            getFeatureInfo: React.PropTypes.func,
            purgeMapInfoResults: React.PropTypes.func,
            changeMousePointer: React.PropTypes.func
        }),
        clickedMapPoint: React.PropTypes.shape({
            x: React.PropTypes.number,
            y: React.PropTypes.number
        })
    },
    getDefaultProps() {
        return {
            enabled: false,
            htmlResponses: [],
            htmlRequests: {length: 0},
            mapConfig: {layers: []},
            layerFilter(l) {
                return l.visibility &&
                    l.type === 'wms' &&
                    (l.queryable === undefined || l.queryable) &&
                    l.group !== "background"
                ;
            },
            actions: {
                getFeatureInfo() {},
                purgeMapInfoResults() {},
                changeMousePointer() {}
            },
            infoFormat: MapInfoUtils.getDefaultInfoFormatValue()
        };
    },
    getInitialState() {
        return { showModal: true };
    },
    componentWillReceiveProps(newProps) {
        // if there's a new clicked point on map and GetFeatureInfo is active
        // it composes and sends a getFeatureInfo action.
        if (newProps.enabled && newProps.clickedMapPoint && (!this.props.clickedMapPoint || this.props.clickedMapPoint.x !== newProps.clickedMapPoint.x ||
                this.props.clickedMapPoint.y !== newProps.clickedMapPoint.y)) {
            const wmsVisibleLayers = newProps.mapConfig.layers.filter(newProps.layerFilter);
            const {bounds, crs} = this.reprojectBbox(newProps.mapConfig.bbox, newProps.mapConfig.projection);
            for (let l = 0; l < wmsVisibleLayers.length; l++) {
                const layer = wmsVisibleLayers[l];
                const requestConf = {
                    layers: layer.name,
                    query_layers: layer.name,
                    x: newProps.clickedMapPoint.x,
                    y: newProps.clickedMapPoint.y,
                    height: newProps.mapConfig.size.height,
                    width: newProps.mapConfig.size.width,
                    srs: crs,
                    bbox: bounds.minx + "," +
                          bounds.miny + "," +
                          bounds.maxx + "," +
                          bounds.maxy,
                    info_format: this.props.infoFormat
                };
                const layerMetadata = {
                    title: layer.title
                };
                const url = layer.url.replace(/[?].*$/g, '');
                this.props.actions.getFeatureInfo(url, requestConf, layerMetadata);
            }
        }

        if (newProps.enabled && !this.props.enabled) {
            this.props.actions.changeMousePointer('pointer');
        } else if (!newProps.enabled && this.props.enabled) {
            this.props.actions.changeMousePointer('auto');
        }
    },
    onModalHiding() {
        this.props.actions.purgeMapInfoResults();
    },
    renderInfo() {
        var retval = null;
        var infoFormats = MapInfoUtils.getAvailableInfoFormat();
        switch (this.props.infoFormat) {
            case infoFormats.JSON:
                retval = (<JSONFeatureInfoViewer responses={this.props.htmlResponses} />);
                break;
            case infoFormats.HTML:
                retval = (<HTMLFeatureInfoViewer responses={this.props.htmlResponses} />);
                break;
            case infoFormats.TEXT:
                retval = (<TEXTFeatureInfoViewer responses={this.props.htmlResponses} />);
                break;
            default:
                retval = null;
        }
        return retval;
    },
    render() {
        let missingRequests = this.props.htmlRequests.length - this.props.htmlResponses.length;
        return (
                <Modal
                    show={this.props.htmlRequests.length !== 0}
                    onHide={this.onModalHiding}
                    bsStyle="info"
                    dialogClassName="getFeatureInfo">
                    <Modal.Header closeButton>
                        <Modal.Title>
                        { (missingRequests !== 0 ) ? <Spinner value={missingRequests} sSize="sp-small" /> : null }
                        <I18N.Message msgId="getFeatureInfoTitle" />
                       </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.renderInfo()}
                    </Modal.Body>
                </Modal>
        );
    },
    reprojectBbox(bbox, destSRS) {
        let newBbox = CoordinatesUtils.reprojectBbox([
            bbox.bounds.minx,
            bbox.bounds.miny,
            bbox.bounds.maxx,
            bbox.bounds.maxy
        ], bbox.crs, destSRS);
        return assign({}, {
            crs: destSRS,
            bounds: {
                minx: newBbox[0],
                miny: newBbox[1],
                maxx: newBbox[2],
                maxy: newBbox[3]
            }
        });
    }
});

module.exports = GetFeatureInfo;
