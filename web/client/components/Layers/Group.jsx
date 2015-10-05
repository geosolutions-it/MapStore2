/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {Glyphicon} = require('react-bootstrap');

var Group = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
        filter: React.PropTypes.func,
        style: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            node: {},
            filter: () => {
                return true;
            },
            style: {marginBottom: "16px"}
        };
    },
    render() {
        let groupTitle = this.props.node && this.props.node.title || 'Default';
        let content = [];

        if (this.props.children) {
            let nodes = (this.props.node.nodes || []);
            content = nodes
                .filter((layer) => this.props.filter(layer, this.props.node))
                .map((node) => (React.cloneElement(this.props.children, {
                    node: node
                })));
        }
        return (
            <div key={groupTitle} style={this.props.style} >
                <div style={{
                    background: "rgb(240,240,240)",
                    padding: "4px",
                    borderRadius: "4px"}}
                >
                    <Glyphicon style={{marginRight: "8px"}} glyph="folder-open" />{groupTitle}
                </div>
                <div style={{marginLeft: "15px"}}>
                    {content}
                </div>
            </div>
        );
    }
});

module.exports = Group;
