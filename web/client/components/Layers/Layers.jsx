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
        id: React.PropTypes.string,
        loadingList: React.PropTypes.array
    },
    getDefaultProps() {
        return {
            filter() {return true; },
            useGroups: false,
            id: 'mapstore-layers',
            loadingList: []
        };
    },
    getFilteredLayers() {
        let retval = [];
        this.props.layers.forEach((layer, index) => {
            if (this.props.filter(layer)) {
                let loading = (this.props.loadingList.indexOf(layer.name) !== -1);
                retval.push(assign({}, layer, {storeIndex: index, loading: loading}));
            }
        }, this);
        return retval;
    },
    render() {
        let now = new Date().getTime();
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
                        group: grpName,
                        key: 'layers-child-' + now + '-' + i
                    }));
                }
            }
        } else {
            for (let i = 0; i < filteredLayers.length; i++) {
                content.push(React.cloneElement(this.props.children, {
                    layer: filteredLayers[i],
                    key: 'layers-child-' + now + '-' + i
                }));
            }
        }
        return <div>{content}</div>;
    }
});

module.exports = Layers;
