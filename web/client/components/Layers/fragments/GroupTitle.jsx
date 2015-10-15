/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var StatusIcon = require('./StatusIcon');

var GroupTitle = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
        onClick: React.PropTypes.func,
        expanded: React.PropTypes.bool,
        style: React.PropTypes.object
    },
    statics: {
        inheritedPropTypes: ['node', 'expanded']
    },
    getDefaultProps() {
        return {
            onClick: () => {},
            style: {
                background: "rgb(240,240,240)",
                padding: "4px",
                borderRadius: "4px"
            }
        };
    },
    render() {
        let expanded = this.props.node.expanded || this.props.expanded;
        let groupTitle = this.props.node && this.props.node.title || 'Default';
        return (
            <div onClick={() => this.props.onClick(this.props.node.name, expanded)} style={this.props.style}>
                <StatusIcon expanded={this.props.expanded} node={this.props.node}/>{groupTitle}
            </div>
        );
    }
});

module.exports = GroupTitle;
