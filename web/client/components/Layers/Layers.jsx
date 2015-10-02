/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var assign = require('object-assign');

var Layers = React.createClass({
    propTypes: {
        filter: React.PropTypes.func,
        layers: React.PropTypes.array,
        useGroups: React.PropTypes.bool,
        id: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            filter() {return true; },
            useGroups: false,
            id: 'mapstore-layers'
        };
    },
    getFilteredLayers() {
        let retval = [];
        this.props.layers.forEach((layer, index) => {
            if (this.props.filter(layer)) {
                retval.push(assign({}, layer, {storeIndex: index}));
            }
        }, this);
        return retval;
    },
    render() {
        var content = [];
        var filteredLayers = this.getFilteredLayers();

        if (this.props.useGroups) {
            let groups = new Set();
            for (let i = 0; i < filteredLayers.length; i++) {
                let grpName = filteredLayers[i].group;
                if (!groups.has(grpName)) {
                    groups.add(grpName);
                    content.push(React.cloneElement(this.props.children, {
                        layers: filteredLayers,
                        group: grpName
                    }));
                }
            }
        } else {
            for (let i = 0; i < filteredLayers.length; i++) {
                content.push(React.cloneElement(this.props.children, {
                    layer: filteredLayers[i]
                }));
            }
        }
        return <div>{content}</div>;
    }
});

module.exports = Layers;
