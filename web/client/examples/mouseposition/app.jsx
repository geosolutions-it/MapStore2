/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var { createStore, combineReducers } = require('redux');
var { changeBrowserProperties} = require('../../actions/browser');
var ConfigUtils = require('../../utils/ConfigUtils');
var browser = require('../../reducers/browser');
var BootstrapReact = require('react-bootstrap');
var Grid = BootstrapReact.Grid;
var Row = BootstrapReact.Row;
var Col = BootstrapReact.Col;
var LMap = require('../../components/map/leaflet/Map');
var LLayer = require('../../components/map/leaflet/Layer');
var mouseposition = require('../../reducers/mousePosition');
var MousePosition = require("../../components/mapcontrols/mouseposition/MousePosition");
var {changeMousePosition} = require('../../actions/mousePosition');
var store = createStore(combineReducers({browser, mouseposition}));
var LabelDD = require("../../components/mapcontrols/mouseposition/MousePositionLabelDD");
var LabelDM = require("../../components/mapcontrols/mouseposition/MousePositionLabelDM");
var LabelDMSNW = require("../../components/mapcontrols/mouseposition/MousePositionLabelDMSNW");
var SearchGeoS = require("./components/FindGeoSolutions.jsx");
require('../../components/map/leaflet/plugins/OSMLayer');
require("./components/mouseposition.css");
    /**
    * Detect Browser's properties and save in app state.
    **/

store.dispatch(changeBrowserProperties(ConfigUtils.getBrowserProperties()));

let App = React.createClass({
    propTypes: {
        browser: React.PropTypes.object,
        mousePosition: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            browser: {touch: false}
        };
    },
    render() {
        if (this.props.browser.touch) {
            return <div className="error">This example does not work on mobile</div>;
        }
        return (<div id="viewer" >
                <Grid fluid={false} className="mousepositionsbar">
                <Row>
                    <Col lg={4} md={6} xs={12}>
                        <MousePosition id="sGeoS" key="sGeoS"
                            mousePosition={this.props.mousePosition} crs="EPSG:4326"
                            degreesTemplate={SearchGeoS}/>
                    </Col>
                    <Col lg={4} md={6} xs={12}>
                        <MousePosition id="wgs84" key="wgs84" mousePosition={this.props.mousePosition} crs="EPSG:4326"/>
                    </Col>
                    <Col lg={4} md={4} xs={6}>
                        <MousePosition id="degreedecimal" key="degreedecimal" enabled
                    mousePosition={this.props.mousePosition} crs="EPSG:4326"
                    degreesTemplate={LabelDD}/>
                    </Col>
                </Row></Grid>
                <MousePosition id="google" key="google_prj" mousePosition={this.props.mousePosition} crs="EPSG:900913"/>

                <MousePosition id="degreeminute" key="degreeminute"
                    mousePosition={this.props.mousePosition} crs="EPSG:4326"
                    degreesTemplate={LabelDM}/>
                <MousePosition id="dmsnw" key="dmsnw"
                    mousePosition={this.props.mousePosition} crs="EPSG:4326"
                    degreesTemplate={LabelDMSNW}/>
                <LMap key="map"
                    center={{
                        y: 43.878160,
                        x: 10.276508,
                        crs: "EPSG:4326"
                        }}
                    zoom={13}
                    projection="EPSG:900913"
                    onMouseMove={ (posi) => { store.dispatch(changeMousePosition(posi)); }}
                    mapStateSource="map"
                >
                    <LLayer type="osm" position={0} key="osm" options={{name: "osm"}} />
                </LMap>
          </div>
           );
    }
});

let cmp = React.render(React.createElement(App), document.getElementById('container'));
store.subscribe(() => cmp.setProps({mousePosition: store.getState().mouseposition.position}));
store.subscribe(() => cmp.setProps({browser: store.getState().browser}));
