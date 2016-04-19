/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const assign = require('object-assign');
const {Glyphicon, Panel} = require('react-bootstrap');
const GetFeatureInfoViewer = require('./identity/GetFeatureInfoViewer');
const Draggable = require('react-draggable');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');

var I18N = require('../components/I18N/I18N');
var Spinner = require('../components/misc/spinners/BasicSpinner/BasicSpinner');

var CoordinatesUtils = require('../utils/CoordinatesUtils');

var MapInfoUtils = require('../utils/MapInfoUtils');

const {isArray} = require('lodash');

const {mapSelector} = require('../selectors/map');
const {layersSelector} = require('../selectors/layers');

const {getFeatureInfo, purgeMapInfoResults, showMapinfoMarker, hideMapinfoMarker} = require('../actions/mapInfo');
const {changeMousePointer} = require('../actions/map');

var Identify = React.createClass({
    propTypes: {
        params: React.PropTypes.object,
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
        getFeatureInfo: React.PropTypes.func,
        purgeMapInfoResults: React.PropTypes.func,
        changeMousePointer: React.PropTypes.func,
        showMapinfoMarker: React.PropTypes.func,
        hideMapinfoMarker: React.PropTypes.func,
        clickedMapPoint: React.PropTypes.object,
        display: React.PropTypes.string,
        draggable: React.PropTypes.bool,
        style: React.PropTypes.object,
        collapsible: React.PropTypes.bool
    },
    getDefaultProps() {
        return {
            enabled: false,
            featureCount: 10,
            draggable: true,
            display: "accordion",
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
            getFeatureInfo() {},
            purgeMapInfoResults() {},
            changeMousePointer() {},
            showMapinfoMarker() {},
            hideMapinfoMarker() {},
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
        var refreshInfo = () => {
            if (newProps.enabled && newProps.clickedMapPoint && newProps.clickedMapPoint.pixel) {
                if (!this.props.clickedMapPoint.pixel || this.props.clickedMapPoint.pixel.x !== newProps.clickedMapPoint.pixel.x ||
                        this.props.clickedMapPoint.pixel.y !== newProps.clickedMapPoint.pixel.y ) {
                    return true;
                }
                if (!this.props.clickedMapPoint.pixel || newProps.clickedMapPoint.pixel && this.props.infoFormat !== newProps.infoFormat) {
                    return true;
                }
            }
            return false;
        };
        if ( refreshInfo() ) {
            this.props.purgeMapInfoResults();
            const wmsVisibleLayers = newProps.layers.filter(newProps.layerFilter);
            const {bounds, crs} = this.reprojectBbox(newProps.map.bbox, newProps.map.projection);
            for (let l = 0; l < wmsVisibleLayers.length; l++) {
                const layer = wmsVisibleLayers[l];
                let requestConf = {
                    id: layer.id,
                    layers: layer.name,
                    query_layers: layer.name,
                    styles: layer.style,
                    x: parseInt(newProps.clickedMapPoint.pixel.x, 10),
                    y: parseInt(newProps.clickedMapPoint.pixel.y, 10),
                    height: parseInt(newProps.map.size.height, 10),
                    width: parseInt(newProps.map.size.width, 10),
                    srs: crs,
                    bbox: bounds.minx + "," +
                          bounds.miny + "," +
                          bounds.maxx + "," +
                          bounds.maxy,
                    feature_count: newProps.featureCount,
                    info_format: newProps.infoFormat
                };

                if (newProps.params) {
                    requestConf = assign({}, requestConf, newProps.params);
                }

                const layerMetadata = {
                    title: layer.title,
                    regex: layer.featureInfoRegex
                };
                const url = isArray(layer.url) ?
                    layer.url[0] :
                    layer.url.replace(/[?].*$/g, '');
                this.props.getFeatureInfo(url, requestConf, layerMetadata, layer.featureInfoParams);
            }
            this.props.showMapinfoMarker();
        }

        if (newProps.enabled && !this.props.enabled) {
            this.props.changeMousePointer('pointer');
        } else if (!newProps.enabled && this.props.enabled) {
            this.props.changeMousePointer('auto');
            this.props.hideMapinfoMarker();
            this.props.purgeMapInfoResults();
        }
    },
    onModalHiding() {
        this.props.hideMapinfoMarker();
        this.props.purgeMapInfoResults();
    },
    renderInfo(missingRequests) {
        return (<GetFeatureInfoViewer infoFormat={this.props.infoFormat} missingRequests={missingRequests} responses={this.props.htmlResponses} display={this.props.display}/>);
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

    renderContent() {
        let missingRequests = this.props.htmlRequests.length - this.props.htmlResponses.length;
        return (
            <Panel
                defaultExpanded={true}
                collapsible={this.props.collapsible}
                id="mapstore-getfeatureinfo"
                header={this.renderHeader(missingRequests)}
                style={this.props.style}>
                {this.renderInfo(missingRequests)}
            </Panel>
        );
    },
    render() {
        if (this.props.htmlRequests.length !== 0) {
            return this.props.draggable ? (
                    <Draggable>
                        {this.renderContent()}
                    </Draggable>
                ) : this.renderContent();
        }
        return null;
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

const selector = createSelector([
    (state) => (state.mapInfo && state.mapInfo.enabled) || (state.controls && state.controls.info && state.controls.info.enabled) || false,
    (state) => state.mapInfo && state.mapInfo.responses || [],
    (state) => state.mapInfo && state.mapInfo.requests || {length: 0},
    (state) => state.mapInfo && state.mapInfo.infoFormat,
    mapSelector,
    layersSelector,
    (state) => state.mapInfo && state.mapInfo.clickPoint

], (enabled, htmlResponses, htmlRequests, infoFormat, map, layers, clickedMapPoint) => ({
    enabled, htmlResponses, htmlRequests, infoFormat, map, layers, clickedMapPoint
}));

module.exports = {
    IdentifyPlugin: connect(selector, {
        getFeatureInfo,
        purgeMapInfoResults,
        changeMousePointer,
        showMapinfoMarker,
        hideMapinfoMarker
    })(Identify),
    reducers: {mapInfo: require('../reducers/mapInfo')}
};
