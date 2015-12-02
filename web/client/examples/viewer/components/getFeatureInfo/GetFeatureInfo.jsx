/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var assign = require('object-assign');
var {Glyphicon, Panel} = require('react-bootstrap');
const Draggable = require('react-draggable');

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
        featureCount: React.PropTypes.number,
        htmlResponses: React.PropTypes.array,
        htmlRequests: React.PropTypes.object,
        btnConfig: React.PropTypes.object,
        enabled: React.PropTypes.bool,
        map: React.PropTypes.object,
        layers: React.PropTypes.array,
        layerFilter: React.PropTypes.func,
        actions: React.PropTypes.shape({
            getFeatureInfo: React.PropTypes.func,
            purgeMapInfoResults: React.PropTypes.func,
            changeMousePointer: React.PropTypes.func,
            showMapinfoMarker: React.PropTypes.func,
            hideMapinfoMarker: React.PropTypes.func
        }),
        clickedMapPoint: React.PropTypes.object,
        style: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            enabled: false,
            featureCount: 10,
            htmlResponses: [],
            htmlRequests: {length: 0},
            map: {},
            layers: [],
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
                changeMousePointer() {},
                showMapinfoMarker() {},
                hideMapinfoMarker() {}
            },
            infoFormat: MapInfoUtils.getDefaultInfoFormatValue(),
            clickedMapPoint: {},
            style: {
                position: "absolute",
                maxWidth: "500px",
                top: "56px",
                left: "45px",
                zIndex: 1010,
                boxShadow: "2px 2px 4px #A7A7A7"
            }
        };
    },
    getInitialState() {
        return { showModal: true };
    },
    componentWillReceiveProps(newProps) {
        // if there's a new clicked point on map and GetFeatureInfo is active
        // it composes and sends a getFeatureInfo action.
        if (newProps.enabled && newProps.clickedMapPoint && newProps.clickedMapPoint.pixel && (!this.props.clickedMapPoint.pixel || this.props.clickedMapPoint.pixel.x !== newProps.clickedMapPoint.pixel.x ||
                this.props.clickedMapPoint.pixel.y !== newProps.clickedMapPoint.pixel.y)) {
            this.props.actions.purgeMapInfoResults();
            const wmsVisibleLayers = newProps.layers.filter(newProps.layerFilter);
            const {bounds, crs} = this.reprojectBbox(newProps.map.bbox, newProps.map.projection);
            for (let l = 0; l < wmsVisibleLayers.length; l++) {
                const layer = wmsVisibleLayers[l];
                const requestConf = {
                    layers: layer.name,
                    query_layers: layer.name,
                    x: newProps.clickedMapPoint.pixel.x,
                    y: newProps.clickedMapPoint.pixel.y,
                    height: newProps.map.size.height,
                    width: newProps.map.size.width,
                    srs: crs,
                    bbox: bounds.minx + "," +
                          bounds.miny + "," +
                          bounds.maxx + "," +
                          bounds.maxy,
                    feature_count: this.props.featureCount,
                    info_format: this.props.infoFormat
                };
                const layerMetadata = {
                    title: layer.title
                };
                const url = layer.url.replace(/[?].*$/g, '');
                this.props.actions.getFeatureInfo(url, requestConf, layerMetadata);
            }
            this.props.actions.showMapinfoMarker();
        }

        if (newProps.enabled && !this.props.enabled) {
            this.props.actions.changeMousePointer('pointer');
        } else if (!newProps.enabled && this.props.enabled) {
            this.props.actions.changeMousePointer('auto');
            this.props.actions.hideMapinfoMarker();
            this.props.actions.purgeMapInfoResults();
        }
    },
    onModalHiding() {
        this.props.actions.hideMapinfoMarker();
        this.props.actions.purgeMapInfoResults();
    },
    renderInfo() {
        var retval = null;
        let missingRequests = this.props.htmlRequests.length - this.props.htmlResponses.length;
        var infoFormats = MapInfoUtils.getAvailableInfoFormat();
        switch (this.props.infoFormat) {
            case infoFormats.JSON:
                retval = (<JSONFeatureInfoViewer responses={this.props.htmlResponses} missingRequests={missingRequests}/>);
                break;
            case infoFormats.HTML:
                retval = (<HTMLFeatureInfoViewer responses={this.props.htmlResponses} />);
                break;
            case infoFormats.TEXT:
                retval = (<TEXTFeatureInfoViewer responses={this.props.htmlResponses} missingRequests={missingRequests}/>);
                break;
            default:
                retval = null;
        }
        return retval;
    },
    renderHeader(missingRequests) {
        return (
            <span>
                { (missingRequests !== 0 ) ? <Spinner value={missingRequests} sSize="sp-small" /> : null }
                <Glyphicon glyph="info-sign" />&nbsp;<I18N.Message msgId="getFeatureInfoTitle" />
                <button onClick={this.onModalHiding} className="close"><span>×</span></button>
            </span>
        );
    },
    render() {
        let missingRequests = this.props.htmlRequests.length - this.props.htmlResponses.length;
        return this.props.htmlRequests.length !== 0 ? (
            <Draggable handle=".panel-heading">
                <Panel id="mapstore-getfeatureinfo" header={this.renderHeader(missingRequests)} style={this.props.style}>
                    {this.renderInfo()}
                </Panel>
            </Draggable>
        ) : null;
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
