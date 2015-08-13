/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var BootstrapReact = require('react-bootstrap');
var ListGroupItem = BootstrapReact.ListGroupItem;

var MapItem = React.createClass({
    propTypes: {
        id: React.PropTypes.number,
        name: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        description: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        attributes: React.PropTypes.object,
        glyphicon: React.PropTypes.string
    },
    render: function() {
        return (
           <ListGroupItem header={this.props.name}>{this.props.description}</ListGroupItem>
        );
    }
});

module.exports = MapItem;
