/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

var React = require('react');
var L = require('leaflet');
var assign = require('object-assign');
require('leaflet.locatecontrol')();
require('leaflet.locatecontrol/dist/L.Control.Locate.css');

L.Control.MSLocate = L.Control.Locate.extend({
    setMap: function(map) {
        this._map = map;
        this._layer = this.options.layer;
        this._layer.addTo(map);
        this._event = undefined;

            // extend the follow marker style and circle from the normal style
        let tmp = {};
        L.extend(tmp, this.options.markerStyle, this.options.followMarkerStyle);
        this.options.followMarkerStyle = tmp;
        tmp = {};
        L.extend(tmp, this.options.circleStyle, this.options.followCircleStyle);
        this.options.followCircleStyle = tmp;
        this._resetVariables();
        this.bindEvents(map);
    },
    _setClasses: function(state) {
        return state;
    },
    _cleanClasses: function() {
        return null;
    },
    setStrings: function(newStrings) {
        this.options.strings = assign({}, this.options.strings, newStrings);
    }
});

let Locate = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
        status: React.PropTypes.bool,
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            id: 'overview',
            status: false
        };
    },
    componentDidMount() {
        if (this.props.map ) {
            this.locate = new L.Control.MSLocate(this.defaultOpt);
            this.locate.setMap(this.props.map);
        }
        if (this.props.status) {
            this.locate.start();
        }
    },
    componentWillReceiveProps(newProps) {
        if (newProps.status !== this.props.status && newProps.status) {
            this.locate.start();
        }else if (newProps.status !== this.props.status && !newProps.status) {
            this.locate.stop();
        }
        if (newProps.messages !== this.props.messages) {
            this.locate.setStrings(newProps.messages);
            if (newProps.status) {
                this.locate.stop();
                this.locate.start();
            }
        }
    },
    render() {
        return null;
    },
    defaultOpt: { // For all configuration options refer to https://github.com/Norkart/Leaflet-MiniMap
            follow: true,  // follow with zoom and pan the user's location
            remainActive: true,
            locateOptions: {
                maximumAge: 2000,
                enableHighAccuracy: false,
                timeout: 10000,
                maxZoom: Infinity,
                watch: true  // if you overwrite this, visualization cannot be updated
                }
            }
});

module.exports = Locate;
