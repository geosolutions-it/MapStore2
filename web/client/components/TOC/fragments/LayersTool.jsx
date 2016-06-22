/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Glyphicon} = require('react-bootstrap');
require("./css/layertool.css");
const LayersTool = React.createClass({
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
