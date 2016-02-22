/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ConfigUtils = require('../../../utils/ConfigUtils');
const {isEqual} = require('lodash');
require('../../../libs/html2canvas/build/html2canvas');

let GrabLMap = React.createClass({
    propTypes: {
            config: ConfigUtils.PropTypes.config,
            layers: React.PropTypes.array,
            snapstate: React.PropTypes.object,
            active: React.PropTypes.bool,
            onSnapshotReady: React.PropTypes.func,
            onStatusChange: React.PropTypes.func,
            onSnapshotError: React.PropTypes.func,
            browser: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            config: null,
            layers: [],
            snapstate: {state: "DISABLED"},
            active: false,
            onSnapshotReady: () => {},
            onStatusChange: () => {},
            onSnapshotError: () => {},
            browser: {}
        };
    },
    componentDidMount() {
        this.mapDiv = document.getElementById("map");
        this.proxy = null;
        let proxyUrl = ConfigUtils.getProxyUrl({});
        if (proxyUrl) {
            if ( typeof proxyUrl === 'object') {
                proxyUrl = proxyUrl.url;
            }
            this.proxy = proxyUrl;
        }
    },
    shouldComponentUpdate(nextProps) {
        return (nextProps.active && !isEqual(nextProps.layers, this.props.layers)) || (nextProps.active !== this.props.active);
    },
    componentDidUpdate() {
        if (!this.props.active) {
            this.props.onStatusChange("DISABLED");
            if (this.props.snapstate.error) {
                this.props.onSnapshotError(null);
            }
        }else if (!this.mapIsLoading(this.props.layers)) {
            if (this.props.snapstate.state !== "SHOTING") {
                this.props.onStatusChange("SHOTING");
            }
            let cSnap = this.createSnapshot;
            let mapPanel = this.mapDiv.getElementsByClassName("leaflet-map-pane");
            window.html2canvas( mapPanel, {
                            proxy: this.proxy,
                            // allowTaint:true,
                            // CORS errors not managed with ie11, so disable
                            useCORS: true && !this.props.browser.ie,
                            // logging:true,
                            onrendered: function(c) {
                                cSnap(c);
                            }
                        });
        }
    },
    render() {
        return null;
    },
    createSnapshot(canvas) {
        let imgData = canvas.toDataURL('image/png');
        if ( imgData ) {
            let size = (atob(imgData.substr(22)).length) / 1024;
            this.props.onSnapshotReady(imgData, canvas.width, canvas.height, size);
            this.props.onStatusChange("READY");
        }
    },
    mapIsLoading(layers) {
        return layers.some((layer) => layer.loading);
    }
});

module.exports = GrabLMap;
