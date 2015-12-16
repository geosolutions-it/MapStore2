/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

var React = require('react');
var OlLocate = require('../../../utils/openlayers/OlLocate');


var Locate = React.createClass({
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
            this.locate = new OlLocate(this.props.map, this.defaultOpt);
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
        }
    },
    render() {
        return null;
    },
    defaultOpt: {
            follow: true,// follow with zoom and pan the user's location
            remainActive: true,
            metric: true,
            stopFollowingOnDrag: true,
            keepCurrentZoomLevel: false,
            locateOptions: {
                maximumAge: 2000,
                enableHighAccuracy: false,
                timeout: 10000,
                maxZoom: 18
                }
            }
});

module.exports = Locate;
