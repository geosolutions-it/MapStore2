/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var Node = require('./Node');
var GroupTitle = require('./fragments/GroupTitle');
var GroupChildren = require('./fragments/GroupChildren');

var DefaultGroup = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
        style: React.PropTypes.object,
        onToggle: React.PropTypes.func,
        onSort: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            node: {},
            onToggle: () => {},
            style: {
                marginBottom: "16px",
                cursor: "pointer"
            }
        };
    },
    render() {
        let {children, onToggle, ...other } = this.props;
        return (
            <Node type="group" {...other}>
                <GroupTitle onClick={this.props.onToggle}/>
                <GroupChildren onSort={this.props.onSort} position="collapsible">
                    {this.props.children}
                </GroupChildren>
            </Node>
        );
    }
});

module.exports = DefaultGroup;
