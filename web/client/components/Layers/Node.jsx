/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var assign = require('object-assign');
var SortableMixin = require('react-sortable-items/SortableItemMixin');

var Node = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
        expanded: React.PropTypes.bool,
        style: React.PropTypes.object,
        type: React.PropTypes.string,
        onSort: React.PropTypes.func
    },
    mixins: [SortableMixin],
    getDefaultProps() {
        return {
            node: null,
            expanded: true,
            style: {},
            type: 'node',
            onSort: null
        };
    },
    renderChildren(filter = () => true) {
        return React.Children.map(this.props.children, (child) => {
            if (filter(child)) {
                let props = (child.type.inheritedPropTypes || ['node']).reduce((previous, propName) => {
                    return this.props[propName] ? assign(previous, {[propName]: this.props[propName]}) : previous;
                }, {});
                return React.cloneElement(child, props);
            }
        });
    },
    render() {
        let expanded = (this.props.node.expanded !== undefined) ? this.props.node.expanded : this.props.expanded;
        let prefix = this.props.type;
        let content = (<div key={this.props.node.name} className={expanded ? prefix + "-expanded" : prefix + "-collapsed"} style={this.props.style} >
            {this.renderChildren((child) => child.props.position !== 'collapsible')}
            {expanded ? this.renderChildren((child) => child.props.position === 'collapsible') : []}
        </div>);
        return this.props.isDraggable ? this.renderWithSortable(content) : content;
    }
});

module.exports = Node;
