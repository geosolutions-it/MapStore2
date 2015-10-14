/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var assign = require('object-assign');

var Layer = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
        expanded: React.PropTypes.bool
    },
    getDefaultProps() {
        return {
            expanded: true
        };
    },
    renderChildren(filter = () => true) {
        return React.Children.map(this.props.children, (child) => {
            if (filter(child)) {
                let props = assign({}, this.props, {children: undefined});
                return React.cloneElement(child, props);
            }
        });
    },
    render() {
        let expanded = this.props.node.expanded || this.props.expanded;
        return (
            <div key={this.props.node.name}>
                <div style={{display: 'flex'}}>
                    {this.renderChildren((child) => child.props.position !== 'collapsible')}
                </div>
                {expanded ? this.renderChildren((child) => child.props.position === 'collapsible') : []}
            </div>
        );
    }
});

module.exports = Layer;
