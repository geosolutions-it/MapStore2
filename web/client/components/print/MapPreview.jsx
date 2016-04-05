/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const assign = require('object-assign');

const ScaleBox = require("../mapcontrols/scale/ScaleBox");
const {Button, Glyphicon} = require('react-bootstrap');

let PMap;
let Layer;

const MapPreview = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
        layers: React.PropTypes.array,
        style: React.PropTypes.object,
        scales: React.PropTypes.array,
        onChangeZoomLevel: React.PropTypes.func,
        onMapViewChanges: React.PropTypes.func,
        onMapRefresh: React.PropTypes.func,
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        mapType: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            map: null,
            layers: [],
            mapType: "leaflet",
            style: {display: "block", border: "1px solid black"},
            onChangeZoomLevel: () => {},
            onMapViewChanges: () => {},
            onMapRefresh: () => {},
            width: 370,
            height: 270
        };
    },
    componentWillMount() {
        PMap = require('../map/' + this.props.mapType + '/Map');
        Layer = require('../map/' + this.props.mapType + '/Layer');
        require('../map/' + this.props.mapType + '/plugins/index');
    },
    render() {
        const style = assign({}, this.props.style, {
            width: this.props.width + "px",
            height: this.props.height + "px"
        });

        return this.props.map && this.props.map.center ?
        (
                <div><PMap
                ref="mappa"
                {...this.props.map}
                resize={this.props.height}
                style={style}
                interactive={false}
                onMapViewChanges={this.props.onMapViewChanges}
                zoomControl={false}
                zoom={this.props.map.zoom}
                center={this.props.map.center}
                id="print_preview"
                registerHooks={false}
                >
                {this.props.layers.map((layer, index) =>
                    <Layer key={layer.name} position={index} type={layer.type}
                        options={assign({}, layer)}/>
                )}
                </PMap>
                <ScaleBox id="mappreview-scalebox"
                    currentZoomLvl={this.props.map.scaleZoom}
                    scales={this.props.scales}
                    onChange={this.props.onChangeZoomLevel}
                    />
                <Button onClick={this.props.onMapRefresh} className="print-mappreview-refresh"><Glyphicon glyph="refresh"/></Button>
                </div>
        ) : <span/>;
    }
});

module.exports = MapPreview;
