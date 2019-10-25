const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var createReactClass = require('create-react-class');
var assign = require('object-assign');
const {CSSTransitionGroup} = require('react-transition-group');

var Node = createReactClass({
    displayName: 'Node',

    propTypes: {
        node: PropTypes.object,
        style: PropTypes.object,
        styler: PropTypes.func,
        className: PropTypes.string,
        type: PropTypes.string,
        onSort: PropTypes.func,
        isDraggable: PropTypes.bool,
        animateCollapse: PropTypes.bool
    },

    getDefaultProps() {
        return {
            node: null,
            style: {},
            styler: () => {},
            className: "",
            type: 'node',
            onSort: null,
            animateCollapse: true
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
            return null;
        });
    },

    render() {
        let expanded = this.props.node.expanded !== undefined ? this.props.node.expanded : true;
        let prefix = this.props.type;
        const nodeStyle = assign({}, this.props.style, this.props.styler(this.props.node));
        let collapsible = expanded && this.props.node.loadingError !== 'Error' ? this.renderChildren((child) => child && child.props.position === 'collapsible') : [];
        if (this.props.animateCollapse) {
            collapsible = <CSSTransitionGroup transitionName="TOC-Node" transitionEnterTimeout={250} transitionLeaveTimeout={250}>{collapsible}</CSSTransitionGroup>;
        }
        let content = (<div key={this.props.node.name} className={(expanded ? prefix + "-expanded" : prefix + "-collapsed") + " " + this.props.className} style={this.props.node.dummy ? {padding: 0} : nodeStyle} >
            {this.renderChildren((child) => child && child.props.position !== 'collapsible')}
            {collapsible}
        </div>);
        return content;
    }
});

module.exports = Node;
