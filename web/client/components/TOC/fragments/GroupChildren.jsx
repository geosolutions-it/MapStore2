/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var Sortable = require('react-sortable-items');

var GroupChildren = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
        filter: React.PropTypes.func,
        onSort: React.PropTypes.func
    },
    statics: {
        inheritedPropTypes: ['node', 'filter', 'onSort']
    },
    getDefaultProps() {
        return {
            node: null,
            filter: () => true,
            onSort: null
        };
    },
    render() {
        let content = [];
        if (this.props.children) {
            let nodes = (this.props.node.nodes || [])
                .filter((node) => this.props.filter(node, this.props.node));
            let i = 0;
            content = nodes.map((node) => (React.cloneElement(this.props.children, {
                node: node,
                key: node.id,
                sortData: i++,
                isDraggable: !!this.props.onSort
            })));
        }
        if (this.props.onSort) {
            return (
                <div style={{marginLeft: "15px"}}>
                    <Sortable minDragDistance={5} onSort={this.handleSort}>
                        {content}
                    </Sortable>
                </div>
            );
        }
        return (
            <div style={{marginLeft: "15px"}}>{content}</div>
        );
    },
    handleSort: function(reorder) {
        this.props.onSort(this.props.node.id, reorder);
    }
});

module.exports = GroupChildren;
