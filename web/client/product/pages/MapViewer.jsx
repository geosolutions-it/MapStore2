/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

require('../assets/css/viewer.css');

const {connect} = require('react-redux');
const {Button, Glyphicon} = require('react-bootstrap');

const url = require('url');

const ConfigUtils = require('../../utils/ConfigUtils');

const {loadMapConfig} = require('../../actions/config');


const {toggleControl} = require('../../actions/controls');

const ReactSwipe = require('react-swipe');
const SwipeHeader = require('../../components/data/identify/SwipeHeader');

const DrawerMenu = require('../containers/DrawerMenu');

const About = require('../components/viewer/about/About');

const MadeWithLove = require('../assets/img/mwlii.png');

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
        const pluginsCfg = {
            Map: {
                zoomControl: false,
                tools: ['measurement', 'locate']
            },
            Locate: {
                id: "locateMeButton"
            },
            MousePosition: {
                id: "mapstore-mouseposition-mobile"
            },
            Identify: {
                style: {position: "absolute",
                    width: "100%",
                    bottom: "0px",
                    zIndex: 1010,
                    maxHeight: "70%",
                    marginBottom: 0
                },
                draggable: false,
                collapsible: true,
                viewerOptions: {container: ReactSwipe, header: SwipeHeader, collapsible: false},
                bodyClass: "mobile-feature-info"
            }
        };
        return (
            <div key="viewer" className="viewer">
                {this.renderPlugins(pluginsCfg)}
                <DrawerMenu key ="drawermenu"/>
                <Button id="drawer-menu-button" key="menu-button" onClick={this.props.toggleMenu}><Glyphicon glyph="menu-hamburger"/></Button>
                <Home key="home"/>
            </div>
        );
    },
    renderDesktop() {
        return (
            <div key="viewer" className="viewer">
                {this.renderPlugins({})}
                <About
                    key="about"
                    style={{
                        position: "absolute",
                            zIndex: 1000,
                            bottom: "-8px",
                            right: "0px",
                            margin: "8px"
                        }} />
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
    },
    renderPlugins(cfg) {
        const plugins = (this.props.mobile ?
            ['Map', 'Identify', 'MousePosition', 'Search', 'Locate'] :
            ['Map', 'Identify', 'MousePosition', 'Search', 'Toolbar', 'ScaleBox', 'ZoomAll', 'MapLoading'])
            .map((pluginName) => ({
                impl: this.props.plugins[pluginName + 'Plugin'],
                cfg: cfg[pluginName] || {}
            }));
        return plugins.map((Plugin) => <Plugin.impl {...this.props.params} {...Plugin.cfg}/>);


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
