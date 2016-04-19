/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

require('../assets/css/viewer.css');

const {bindActionCreators} = require('redux');
const {connect} = require('react-redux');
const {Button, Glyphicon} = require('react-bootstrap');

const url = require('url');

const ConfigUtils = require('../../utils/ConfigUtils');

const {loadMapConfig} = require('../../actions/config');

const {changeMapView} = require('../../actions/map');

const {textSearch, resultsPurge} = require("../../actions/search");
const {toggleControl} = require('../../actions/controls');

const MousePositionMobile = connect((state) => ({
    enabled: state.mousePosition.enabled,
    mousePosition: state.map && state.map.present && state.map.present.center,
    crs: state.mousePosition.crs || state.map && state.map.present && state.map.present.projection || 'EPSG:3857'
}))(require("../../components/mapcontrols/mouseposition/MousePosition"));

const HelpTextPanel = require('../../plugins/HelpTextPanel');

const DrawerMenu = require('../containers/DrawerMenu');

const About = require('../components/viewer/about/About');

const GlobalSpinner = connect((state) => {
    return {
        loading: state.layers && state.layers.flat.some((layer) => layer.loading)
    };
})(require('../../components/misc/spinners/GlobalSpinner/GlobalSpinner'));

const Message = require('../../components/I18N/Message');

const HelpWrapper = require('../../plugins/HelpWrapper');

const {ScaleBoxPlugin} = require('../../plugins/ScaleBox');

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

const {changeLocateState} = require('../../actions/locate');

const LocateBtn = connect((state) => ({
    locate: state.locate && state.locate.state || 'DISABLED'
}), {
    onClick: changeLocateState
})(require('../../components/mapcontrols/locate/LocateBtn'));

const Home = require('../components/viewer/Home');

const {saveImage, onRemoveSnapshot} = require('../../actions/snapshot');

const SnapshotQueue = connect((state) => ({
    queue: state.snapshot && state.snapshot.queue || []
}), {
    downloadImg: saveImage,
    onRemoveSnapshot
})(require("../../components/mapcontrols/Snapshot/SnapshotQueue"));

const urlQuery = url.parse(window.location.href, true).query;


// let VMap;
const MapViewer = React.createClass({
    propTypes: {
        mobile: React.PropTypes.bool,
        params: React.PropTypes.object,
        map: React.PropTypes.object,
        layers: React.PropTypes.array,
        printCapabilities: React.PropTypes.object,
        loadMapConfig: React.PropTypes.func,
        toggleMenu: React.PropTypes.func,
        plugins: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            mobile: false
        };
    },
    componentWillMount() {
        if (this.props.params.mapType && this.props.params.mapId) {
            if (this.props.mobile) {
                require('../assets/css/mobile.css');
            }

            // VMap = require('../components/viewer/Map')(this.props.params.mapType);
            const mapId = (this.props.params.mapId === '0') ? null : this.props.params.mapId;
            const config = urlQuery && urlQuery.config || null;
            const {configUrl} = ConfigUtils.getConfigurationOptions({mapId, config});
            this.props.loadMapConfig(configUrl, mapId !== null);
        }
    },
    /*componentWillReceiveProps(newProps) {
        if (newProps.params.mapType !== this.props.params.mapType) {
            VMap = require('../components/viewer/Map')(this.props.params.mapType);
        }
    },*/
    render() {
        return this.props.mobile ? this.renderMobile() : this.renderDesktop();
    },
    renderMobile() {
        const {MapPlugin, IdentifyPlugin} = this.props.plugins;
        return (
            <div key="viewer" className="viewer">
                <MapPlugin mapType={this.props.params.mapType} zoomControl={false} key="map" tools={['measurement', 'locate']}/>
                <SearchBar key="seachBar"/>
                <NominatimResultList key="nominatim-result-list"/>
                <DrawerMenu key ="drawermenu"/>
                <Button id="drawer-menu-button" key="menu-button" onClick={this.props.toggleMenu}><Glyphicon glyph="menu-hamburger"/></Button>
                <Home key="home"/>
                <LocateBtn
                   id="locateMeButton"
                   key="locate-me-button"
                   style={{width: "auto"}}
                   tooltip={<Message msgId="locate.tooltip"/>}/>
               <MousePositionMobile
                   id="mapstore-mouseposition-mobile"
                   key="mousePosition"/>
               <IdentifyPlugin
                   key="getFeatureInfo"
                   style={{position: "absolute",
                       width: "100%",
                       bottom: "0px",
                       zIndex: 1010,
                       maxHeight: "70%",
                       marginBottom: 0
                   }}
                   draggable={false}
                   collapsible={true}
                   display="swipe"
                   bodyClass="mobile-feature-info" />
            </div>
        );
    },
    renderDesktop() {
        const {MapPlugin, ToolbarPlugin, MousePositionPlugin, IdentifyPlugin} = this.props.plugins;
        return (
            <div key="viewer" className="viewer">
                <MapPlugin mapType={this.props.params.mapType} key="map"/>
                <ToolbarPlugin mapType={this.props.params.mapType} key="toolbar"/>

                <HelpWrapper
                    key="seachBar-help"
                    helpText={<Message msgId="helptexts.searchBar"/>}>
                    <SearchBar key="seachBar" />
                </HelpWrapper>
                <NominatimResultList key="nominatimresults"/>

                <MousePositionPlugin key="mousePosition"/>
                <HelpTextPanel
                    key="helpTextPanel"/>
                <IdentifyPlugin key="getFeatureInfo"/>
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
                <ScaleBoxPlugin key="scaleBox"/>
                <HelpWrapper
                    key="zoomall-help"
                    helpText={<Message msgId="helptexts.zoomToMaxExtentButton"/>}>
                    <ZoomToMaxExtentButton
                        key="zoomToMaxExtent"/>
                </HelpWrapper>
                <SnapshotQueue key="snapshotqueue" mapType={this.props.params.mapType}/>
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

module.exports = connect((state) => ({
    mobile: urlQuery.mobile || (state.browser && state.browser.touch),
    map: state.map && state.map.present,
    layers: state.layers && state.layers.flat || [],
    printCapabilities: state.print && state.print.capabilities
}),
{
    loadMapConfig,
    toggleMenu: toggleControl.bind(null, 'drawer', null)
})(MapViewer);
