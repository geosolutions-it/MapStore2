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
        layers: React.PropTypes.array,
        group: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            layers: []
        };
    },
    getOwnLayers() {
        return this.props.layers.filter((layer) => {
            return layer.group === this.props.group;
        }, this);
    },
    render() {
        let groupTitle = this.props.group || 'Default';
        let content = [];

        let ownLayers = this.getOwnLayers();
        for (let i = 0; i < ownLayers.length; i++) {
            content.push(React.cloneElement(this.props.children, {
                layer: ownLayers[i]
            }));
        }
        return (
            <div key={groupTitle} style={{marginBottom: "16px"}} >
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
