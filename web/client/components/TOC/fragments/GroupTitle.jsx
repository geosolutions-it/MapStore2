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
        style: React.PropTypes.object
    },
    statics: {
        inheritedPropTypes: ['node']
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
        let expanded = (this.props.node.expanded !== undefined) ? this.props.node.expanded : true;
        let groupTitle = this.props.node && this.props.node.title || 'Default';
        return (
            <div onClick={() => this.props.onClick(this.props.node.name, expanded)} style={this.props.style}>
                <StatusIcon expanded={expanded} node={this.props.node}/>{groupTitle}
            </div>
        );
    }
});

module.exports = GroupTitle;
