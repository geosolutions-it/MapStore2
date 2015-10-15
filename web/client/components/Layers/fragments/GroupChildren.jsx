/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');

var GroupChildren = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
        filter: React.PropTypes.func
    },
    statics: {
        inheritedPropTypes: ['node', 'filter']
    },
    getDefaultProps() {
        return {
            node: null,
            filter: () => true
        };
    },
    render() {
        let content = [];
        if (this.props.children) {
            let nodes = (this.props.node.nodes || [])
                .filter((node) => this.props.filter(node, this.props.node));
            content = nodes.map((node) => (React.cloneElement(this.props.children, {
                    node: node
            })));
        }
        return (
            <div style={{marginLeft: "15px"}}>{content}</div>
        );
    }
});

module.exports = GroupChildren;
