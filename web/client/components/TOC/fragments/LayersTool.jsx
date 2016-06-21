/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {Glyphicon} = require('react-bootstrap');

var LayersTool = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
        onClick: React.PropTypes.func,
        style: React.PropTypes.object,
        glyph: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            style: {marginRight: "2px"},
            onClick: () => {}
        };
    },
    render() {
        return (
            <Glyphicon className="toc-layer-tool" style={this.props.style}
                       glyph={this.props.glyph}
                       onClick={(options) => this.props.onClick(this.props.node, options || {})}/>);
    }
});

module.exports = LayersTool;
