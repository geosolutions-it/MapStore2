/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');

var Title = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
        onClick: React.PropTypes.func,
        expanded: React.PropTypes.bool
    },
    render() {
        let expanded = this.props.node.expanded || this.props.expanded;
        return (<span onClick={() => this.props.onClick(this.props.node.name, expanded)}>{this.props.node.title || this.props.node.name}</span>);
    }
});

module.exports = Title;
