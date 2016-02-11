/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var html2canvas = require('html2canvas');
var ConfigUtils = require('../../../utils/ConfigUtils');
const {isEqual} = require('lodash');

var GrabLMap = React.createClass({
    propTypes: {
            config: ConfigUtils.PropTypes.config,
            layers: React.PropTypes.array,
            snapstate: React.PropTypes.object,
            active: React.PropTypes.bool,
            onSnapshotReady: React.PropTypes.func,
            onStatusChange: React.PropTypes.func,
            onSnapshotError: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            config: null,
            layers: [],
            snapstate: {state: "DISABLED"},
            active: false,
            onSnapshotReady: () => {},
            onStatusChange: () => {},
            onSnapshotError: () => {}
        };
    },
    getInitialState() {
        return {shot: null};
    },
    componentDidMount() {
        this.mapDiv = document.getElementById("map");
        this.proxy = null;
        let proxyUrl = ConfigUtils.getProxyUrl({});
        if (proxyUrl) {
            if ( typeof proxyUrl === 'object') {
                proxyUrl = proxyUrl.url;
            }
            this.proxy = proxyUrl.replace("?url=", '');
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
            let layers = [].slice.call(this.mapDiv.getElementsByClassName("leaflet-tile-pane")[0].getElementsByClassName("leaflet-layer"), 0);
            let queue = layers.map(function(l) {
                return html2canvas(l, {
                        logging: false,
                        proxy: this.proxy,
                        useCORS: true,
                        type: "view" });
            }, this);
            let cSnap = this.createSnapshot;
            Promise.all(queue).then(function(canvases) {
                let c = canvases.reduce(function(pCanv, canv, idx) {
                    let l = layers[idx];
                    let cx = pCanv.getContext("2d");
                    if (l.style && !isNaN(Number.parseFloat(l.style.opacity))) {
                        cx.globalAlpha = Number.parseFloat(l.style.opacity);
                    }else {
                        cx.globalAlpha = 1;
                    }
                    cx.drawImage(canv, 0, 0);
                    return pCanv;
                });
                cSnap(c);
            });
            // layers.reduce((promise, layer, idx, array) => {
            //     return promise.then(function(canvas) {
            //         console.log(idx, canvas);
            //         return drawLayer(layer, globCanvas.width, globCanvas.height);
            //     });
            // }, Promise.resolve(this.canvas)).then(function(c) {console.log(c.toDataURL()); });
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
