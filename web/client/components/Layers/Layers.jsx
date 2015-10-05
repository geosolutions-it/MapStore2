/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');

var Layers = React.createClass({
    propTypes: {
        filter: React.PropTypes.func,
        nodes: React.PropTypes.array,
        id: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            filter() {return true; },
            nodes: [],
            id: 'mapstore-layers'
        };
    },

    render() {
        var content = [];
        var filteredNodes = this.props.nodes.filter(this.props.filter);
        if (this.props.children) {
            content = filteredNodes.map((node) => React.cloneElement(this.props.children, {
                node: node
            }));
        }
        return <div id={this.props.id}>{content}</div>;
    }
});

module.exports = Layers;
