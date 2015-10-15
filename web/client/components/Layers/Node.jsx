/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var assign = require('object-assign');

var Node = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
        expanded: React.PropTypes.bool,
        style: React.PropTypes.object,
        type: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            node: null,
            expanded: true,
            style: {},
            type: 'node'
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
        return (
            <div key={this.props.node.name} className={expanded ? prefix + "-expanded" : prefix + "-collapsed"} style={this.props.style} >
                {this.renderChildren((child) => child.props.position !== 'collapsible')}
                {expanded ? this.renderChildren((child) => child.props.position === 'collapsible') : []}
            </div>
        );
    }
});

module.exports = Node;
