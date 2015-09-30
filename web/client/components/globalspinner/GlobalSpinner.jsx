/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var GlobalSpinner = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        loadingLayers: React.PropTypes.object,
        showSpinner: React.PropTypes.func,
        hideSpinner: React.PropTypes.func,
        spinnersInfo: React.PropTypes.object,
        delayMs: React.PropTypes.number
    },
    getDefaultProps() {
        return {
            id: "mapstore-globalspinner",
            loadingLayers: {},
            showSpinner() {},
            hideSpinner() {},
            delayMs: 500
        };
    },
    /*componentWillReceiveProps(newProps) {
        var id = newProps.id;
        var delayMs = newProps.delayMs;
        var func = this.isSomeLayerLoading(newProps.loadingLayers) ? newProps.showSpinner : newProps.hideSpinner;
        setTimeout(() => func(id), delayMs);
    },*/
    render() {
        if (this.isSomeLayerLoading(this.props.loadingLayers)) {
            return (
                <div id={this.props.id}></div>
            );
        }
        return null;
    },
    isSomeLayerLoading(loadingLayers) {
        return Object.keys(loadingLayers).map(
            (key) => { return loadingLayers[key]; }).some(element => element === true);
    },
    show() {
        return (this.props.spinnersInfo || {})[this.props.id] || false;
    }
});

module.exports = GlobalSpinner;
