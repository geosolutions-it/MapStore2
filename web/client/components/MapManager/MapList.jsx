/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
 var React = require('react');
var BootstrapReact = require('react-bootstrap');
var ListGroup = BootstrapReact.ListGroup;
var Panel = BootstrapReact.Panel;
var MapItem = require('./MapItem');

var MapList = React.createClass({
    propTypes: {
        panelProps: React.PropTypes.object,
        data: React.PropTypes.array
    },
    getInitialState: function() {
        return {maps: this.props.data};
    },
    renderMaps: function(maps) {
        if (maps) {
            return this.state.maps.map(function(map) {
                return <MapItem key={map.id} {...map} />;
            });
        }
    },
    render: function() {
        return (<Panel {...this.props.panelProps}><ListGroup>{this.renderMaps(this.state.maps)}</ListGroup></Panel>);
    }
});

module.exports = MapList;
