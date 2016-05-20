/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ConfigUtils = require('../../../../utils/ConfigUtils');
const ProxyUtils = require('../../../../utils/ProxyUtils');
const {isEqual} = require('lodash');
/**
 * Preview for OpenLayers map generate is a fast system to get the image
 * directly from the original map canvas.
 * if it is not tainted, this can be used also to generate snapshot
 * (extracting the image URL from the canvas).
 */
let GrabLMap = React.createClass({
    propTypes: {
            config: ConfigUtils.PropTypes.config,
            layers: React.PropTypes.array,
            snapstate: React.PropTypes.object,
            active: React.PropTypes.bool,
            onSnapshotReady: React.PropTypes.func,
            onStatusChange: React.PropTypes.func,
            onSnapshotError: React.PropTypes.func,
            allowTaint: React.PropTypes.bool,
            browser: React.PropTypes.object,
            canvas: React.PropTypes.node,
            timeout: React.PropTypes.number,
            drawCanvas: React.PropTypes.bool,
            mapId: React.PropTypes.string
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
            browser: {},
            canvas: <canvas></canvas>,
            drawCanvas: true,
            mapId: "map",
            timeout: 1000
        };
    },
    componentDidMount() {

        this.proxy = null;
        let proxyUrl = ProxyUtils.getProxyUrl();
        if (proxyUrl) {
            if ( typeof proxyUrl === 'object') {
                proxyUrl = proxyUrl.url;
            }
            this.proxy = (proxyUrl.indexOf("?url=") !== -1) ? proxyUrl.replace("?url=", '') : proxyUrl;
        }
        // start SHOOTING
        let mapIsLoading = this.mapIsLoading(this.props.layers);
        if (!mapIsLoading && this.props.active) {
            this.props.onStatusChange("SHOTING");
            this.previousTimeout = setTimeout(() => {
                this.doSnapshot();
            },
            this.props.timeout);
        }
    },
    componentWillReceiveProps(nextProps) {
        let mapIsLoading = this.mapIsLoading(nextProps.layers);
        let mapChanged = this.mapChanged(nextProps);
        if (this.previousTimeout) {
            clearTimeout(this.previousTimeout);
        }
        if ( nextProps.active && !mapIsLoading && mapChanged ) {
            this.props.onStatusChange("SHOTING");
            this.previousTimeout = setTimeout(() => {
                this.doSnapshot();
            },
            nextProps.timeout);
        } else {
            if (!nextProps.active) {
                this.props.onStatusChange("DISABLED");
                if (this.props.snapstate.error) {
                    this.props.onSnapshotError(null);
                }
            }
        }
        if (!mapIsLoading && nextProps.active && (mapChanged || nextProps.snapstate.state === "SHOTING") ) {
            this.triggerShooting(nextProps.timeout);
        }
    },
    shouldComponentUpdate(nextProps) {
        return this.mapChanged(nextProps) && this.props.snapstate !== nextProps.snapstate;
    },
    componentWillUnmount() {
        if (this.previousTimeout) {
            clearTimeout(this.previousTimeout);
        }
    },
    getCanvas() {
        return this.refs.canvas;
    },
    render() {
        return (
            <canvas
                width={this.props.config && this.props.config.size ? this.props.config.size.width : "100%"}
                height={this.props.config && this.props.config.size ? this.props.config.size.height : "100%"}
                style={{
                    maxWidth: "400px",
                    maxHeight: "400px"
                }}
                ref="canvas" />
        );
    },
    mapChanged(nextProps) {
        return !isEqual(nextProps.layers, this.props.layers) || (nextProps.active !== this.props.active) || nextProps.config !== this.props.config;
    },
    mapIsLoading(layers) {
        return layers.some((layer) => { return layer.visibility && layer.loading; });
    },
    triggerShooting(delay) {
        this.previousTimeout = setTimeout(() => {
            this.doSnapshot();
        },
        delay);
    },
    doSnapshot() {
        var div = document.getElementById(this.props.mapId);
        let sourceCanvas = div.getElementsByTagName("canvas")[0];
        if (sourceCanvas) {
            let canvas = this.refs.canvas;
            let context = canvas.getContext("2d");
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(sourceCanvas, 0, 0);
            this.props.onStatusChange("READY");
            this.props.onSnapshotReady(sourceCanvas);
        }
    },
    isTainted() {
        let canvas = this.refs.canvas;
        let ctx = canvas.getContext("2d");
        try {
            ctx.getImageData(0, 0, 1, 1);
            return false;
        } catch(err) {
            return (err.code === 18);
        }
    },
    exportImage() {
        return this.refs.canvas.toDataURL();
    }
});

module.exports = GrabLMap;
