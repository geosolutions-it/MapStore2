/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var {LMap,
    LLayer,
    Feature
} = require('../../map/openlayers/index');
var assign = require('object-assign');
var ConfigUtils = require('../../../utils/ConfigUtils');

var GrabOlMap = React.createClass({
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
    renderLayers(layers) {
        if (layers) {
            let projection = this.props.config.projection || 'EPSG:3857';
            let me = this; // TODO find the reason why the arrow function doesn't get this object
            return layers.map((layer, index) => {
                var options = assign({}, layer, {srs: projection}, (layer.type === "wms") ? {forceProxy: true} : {});
                return (<LLayer type={layer.type} position={index} key={layer.id || layer.name} options={options}>
                    {me.renderLayerContent(layer)}
                </LLayer>);
            });
        }
        return null;
    },
    renderLayerContent(layer) {
        if (layer.features && layer.type === "vector") {
            // TODO remove this DIV. What container can be used for this component.
            return layer.features.map( (feature) => {
                return (<Feature
                    key={feature.id}
                    type={feature.type}
                    geometry={feature.geometry}/>);
            });
        }
        return null;
    },
    shouldComponentUpdate(nextProps) {
        return nextProps.active || (nextProps.active !== this.props.active);
    },
    componentDidUpdate() {
        if (!this.props.active) {
            this.props.onStatusChange("DISABLED");
            if (this.props.snapstate.error) {
                this.props.onSnapshotError(null);
            }
        }
    },
    render() {
        return (this.props.active) ? (
            <LMap id="snapshot_map"
                center={this.props.config.center}
                zoom={this.props.config.zoom}
                mapStateSource={this.props.config.mapStateSource}
                projection={this.props.config.projection || 'EPSG:3857'}
                zoomControl={false}
                onLayerLoading={this.layerLoading}
                onLayerLoad={this.layerLoad}
                ref={"snapMap"}
            >
                {this.renderLayers(this.props.layers)}
            </LMap>
        ) : null;
    },
    layerLoading() {
        if (this.props.snapstate.state !== "SHOTING") {
            this.props.onStatusChange("SHOTING");

        }
        this.toLoad = (this.toLoad) ? this.toLoad : 0;
        this.toLoad++;
    },
    layerLoad() {
        this.toLoad--;
        if (this.toLoad === 0) {
            let map = (this.refs.snapMap) ? this.refs.snapMap.map : null;
            if (map) {
                map.once('postcompose', (e) => this.createSnapshot(e.context.canvas));
            }
        }
    },
    createSnapshot(canvas) {
        let imgData = canvas.toDataURL('image/png');
        if ( imgData ) {
            let size = (atob(imgData.substr(22)).length) / 1024;
            this.props.onSnapshotReady(imgData, canvas.width, canvas.height, size);
            this.props.onStatusChange("READY");
        }
    }
});

require('../../map/openlayers/plugins/index');

module.exports = GrabOlMap;
