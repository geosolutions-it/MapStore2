/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {bindActionCreators} = require('redux');
const {connect} = require('react-redux');

require('../assets/css/viewer.css');

const ConfigUtils = require('../../utils/ConfigUtils');

const {loadMapConfig} = require('../../actions/config');

const {getFeatureInfo, purgeMapInfoResults, showMapinfoMarker, hideMapinfoMarker} = require('../../actions/mapInfo');
const {changeMousePointer, changeZoomLevel, changeMapView} = require('../../actions/map');

const {textSearch, resultsPurge} = require("../../actions/search");

const MousePosition = connect((state) => ({
    enabled: state.mousePosition.enabled,
    mousePosition: state.mousePosition.position,
    crs: state.mousePosition.crs || state.map && state.map.present && state.map.present.projection || 'EPSG:3857'
}))(require("../../components/mapcontrols/mouseposition/MousePosition"));

const HelpTextPanel = connect((state) => ({
    isVisible: state.help && state.help.helpwinViz || false,
    helpText: state.help && state.help.helpText
}))(require('../../components/help/HelpTextPanel'));

const Toolbar = require('../containers/Toolbar');
const GetFeatureInfo = connect((state) => ({
    enabled: state.mapInfo && state.mapInfo.enabled || false,
    htmlResponses: state.mapInfo && state.mapInfo.responses || [],
    htmlRequests: state.mapInfo && state.mapInfo.requests || {length: 0},
    infoFormat: state.mapInfo && state.mapInfo.infoFormat,
    map: state.map && state.map.present,
    layers: state.layers && state.layers.flat || [],
    clickedMapPoint: state.mapInfo && state.mapInfo.clickPoint
}), (dispatch) => {
    return {
        actions: bindActionCreators({
            getFeatureInfo,
            purgeMapInfoResults,
            changeMousePointer,
            showMapinfoMarker,
            hideMapinfoMarker
        }, dispatch)
    };
})(require('../components/viewer/mapInfo/GetFeatureInfo'));

const About = require('../components/viewer/about/About');

const GlobalSpinner = connect((state) => {
    return {
        loading: state.layers && state.layers.flat.some((layer) => layer.loading)
    };
})(require('../../components/misc/spinners/GlobalSpinner/GlobalSpinner'));

const {changeHelpwinVisibility, changeHelpText} = require('../../actions/help');

const Message = require('../../components/I18N/Message');

const HelpWrapper = connect((state) => ({
    helpEnabled: state.controls.help.enabled
}), {
    changeHelpText,
    changeHelpwinVisibility
})(require('../../components/help/HelpWrapper'));

const ScaleBox = connect((state) => ({
    currentZoomLvl: state.map && state.map.present && state.map.present.zoom
}), {
    onChange: changeZoomLevel
})(require("../../components/mapcontrols/scale/ScaleBox"));

const ZoomToMaxExtentButton = connect((state) => ({
    mapConfig: state.map && state.map.present || {}
}), (dispatch) => {
    return {
        actions: bindActionCreators({
            changeMapView
        }, dispatch)
    };
})(require("../../components/buttons/ZoomToMaxExtentButton"));

const MadeWithLove = require('../assets/img/mwlii.png');

const SearchBar = connect(() => ({}), {
     onSearch: textSearch,
     onSearchReset: resultsPurge
})(require('../../components/mapcontrols/search/SearchBar'));

const NominatimResultList = connect((state) => ({
    results: state.search || null,
    mapConfig: state.map && state.map.present || {}
}), {
    onItemClick: changeMapView,
    afterItemClick: resultsPurge
})(require('../../components/mapcontrols/search/geocoding/NominatimResultList'));

let VMap;
const MapViewer = React.createClass({
    propTypes: {
        params: React.PropTypes.object,
        loadMapConfig: React.PropTypes.func
    },
    componentWillMount() {
        if (this.props.params.mapType && this.props.params.mapId) {
            VMap = require('../components/viewer/Map')(this.props.params.mapType);
            const mapId = (this.props.params.mapId === '0') ? null : this.props.params.mapId;
            const {configUrl} = ConfigUtils.getConfigurationOptions({mapId: mapId});
            this.props.loadMapConfig(configUrl, mapId !== null);
        }
    },
    componentWillReceiveProps(newProps) {
        if (newProps.params.mapType !== this.props.params.mapType) {
            VMap = require('../components/viewer/Map')(this.props.params.mapType);
        }
    },
    render() {
        return (
            <div key="viewer" className="viewer">
                <VMap key="map" overview={true} zoomControl={true} scaleBar={true}/>
                <Toolbar/>

                <HelpWrapper
                    key="seachBar-help"
                    helpText={<Message msgId="helptexts.searchBar"/>}>
                    <SearchBar key="seachBar" />
                </HelpWrapper>
                <NominatimResultList key="nominatimresults"/>

                <MousePosition key="mousePosition"/>
                <HelpTextPanel
                    key="helpTextPanel"/>
                <GetFeatureInfo key="getFeatureInfo"/>
                <About
                    key="about"
                    style={{
                        position: "absolute",
                            zIndex: 1000,
                            bottom: "-8px",
                            right: "0px",
                            margin: "8px"
                        }} />
                <GlobalSpinner key="globalSpinner"/>
                <HelpWrapper
                    key="scalebox-help"
                    helpText={<Message msgId="helptexts.scaleBox"/>}>
                    <ScaleBox key="scaleBox"/>
                </HelpWrapper>
                <HelpWrapper
                    key="zoomall-help"
                    helpText={<Message msgId="helptexts.zoomToMaxExtentButton"/>}>
                    <ZoomToMaxExtentButton
                        key="zoomToMaxExtent"/>
                </HelpWrapper>
                <div style={{
                        position: "absolute",
                        bottom: "50px",
                        left: "0",
                        height: 0,
                        width: "100%",
                        overflow: "visible",
                        textAlign: "center"
                    }} ><img src={MadeWithLove} /></div>
            </div>
        );
    }
});

module.exports = connect(() => ({}),
{
    loadMapConfig
})(MapViewer);
