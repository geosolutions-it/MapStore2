/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';
import { Glyphicon } from 'react-bootstrap';

import { getResolutionMultiplier } from '../../utils/PrintUtils';
import ScaleBox from '../mapcontrols/scale/ScaleBox';
import Button from '../misc/Button';
import isNil from 'lodash/isNil';
import isEmpty from 'lodash/isEmpty';
import { MapLibraries } from '../../utils/MapTypeUtils';
import { get } from 'ol/proj';

let PMap;
let Layer;
let Feature;

class MapPreview extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        layers: PropTypes.array,
        style: PropTypes.object,
        scales: PropTypes.array,
        onChangeZoomLevel: PropTypes.func,
        onMapViewChanges: PropTypes.func,
        onMapRefresh: PropTypes.func,
        height: PropTypes.number,
        width: PropTypes.number,
        mapType: PropTypes.string,
        enableRefresh: PropTypes.bool,
        enableScalebox: PropTypes.bool,
        resolutions: PropTypes.array,
        printRatio: PropTypes.number,
        layout: PropTypes.string,
        layoutSize: PropTypes.object,
        useFixedScales: PropTypes.bool,
        rotation: PropTypes.number,
        env: PropTypes.object,
        onLoadingMapPlugins: PropTypes.func
    };

    static defaultProps = {
        map: null,
        layers: [],
        mapType: MapLibraries.OPENLAYERS,
        style: {display: "block", border: "1px solid black", position: "relative"},
        onChangeZoomLevel: () => {},
        onMapViewChanges: () => {},
        onMapRefresh: () => {},
        width: 370,
        height: 270,
        enableRefresh: true,
        enableScalebox: true,
        useFixedScales: false,
        onLoadingMapPlugins: () => {}
    };

    state = {
        mapTypeLoaded: false
    }

    UNSAFE_componentWillMount() {
        this._isMounted = true;
        this.props.onLoadingMapPlugins(true);
        Promise.all([
            import('../map/' + this.props.mapType + '/index'),
            import('../map/' + this.props.mapType + '/plugins/index')
        ]).then(([mod]) => {
            if (this._isMounted) {
                const mapComponents = mod.default;
                PMap = mapComponents.LMap;
                Layer = mapComponents.LLayer;
                Feature = mapComponents.Feature;
                this.setState({ mapTypeLoaded: true });
                this.props.onLoadingMapPlugins(false, this.props.mapType);
            }
        });
    }
    componentWillUnmount() {
        this._isMounted = false;
    }

    getRatio = () => {
        if (this.props.width && this.props.layoutSize ) {
            return getResolutionMultiplier(this.props.layoutSize.width, this.props.width, this.props.printRatio);
        }
        return 1;
    };

    getResolutions = (srs) => {
        // cache resolutions
        const projection = get(srs);
        const metersPerUnit = projection.getMetersPerUnit();
        const scaleToResolution = s => s * 0.28E-3 / metersPerUnit;
        const previewResolutions = this.props.useFixedScales && this.props.scales
            ? this.props.scales.map(s => scaleToResolution(s)) : this.props.resolutions;
        if (this.props.width && this.props.layoutSize && previewResolutions) {
            return previewResolutions.map((resolution) => resolution * this.getRatio());
        }
        return previewResolutions;
    };

    renderLayerContent = (layer, projection) => {
        if (layer.features && layer.type === "vector") {
            return layer.features.map( (feature) => {
                return (
                    <Feature
                        crs={projection}
                        key={feature.id}
                        type={feature.type}
                        geometry={feature.geometry}
                        features={feature.features}
                        msId={feature.id}
                        featuresCrs={ layer.featuresCrs || 'EPSG:4326' }
                        layerStyle={layer.style}
                        style={ feature.style || layer.style || null }
                        properties={feature.properties}
                    />
                );
            });
        }
        return null;
    };

    render() {

        if (!this.state.mapTypeLoaded) {
            return null;
        }

        const style = assign({}, this.props.style, {
            width: this.props.width + "px",
            height: this.props.height + "px"
        });
        const projection = this.props.map && this.props.map.projection || 'EPSG:3857';
        const resolutions = this.getResolutions(projection);
        let mapOptions = !isEmpty(resolutions) || !isNil(this.props.rotation) ? {
            view: {
                ...(!isEmpty(resolutions) && {resolutions}),
                rotation: !isNil(this.props.rotation) ? Number(this.props.rotation) : 0
            }
        } : {};

        return this.props.map && this.props.map.center ?

            <div className="print-map-preview"><PMap
                ref="mappa"
                {...this.props.map}
                resize={this.props.height}
                style={style}
                interactive     // to enable zoom/use wheel in print preview map
                onMapViewChanges={this.props.onMapViewChanges}
                zoomControl={false}
                zoom={this.props.useFixedScales ? this.props.map.scaleZoom : this.props.map.zoom}
                center={this.props.map.center}
                id="print_preview"
                registerHooks={false}
                mapOptions={mapOptions}
            >
                {this.props.layers.map((layer, index) =>
                    (<Layer key={layer.id || layer.name} position={index} type={layer.type} srs={projection}
                        options={assign({}, this.adjustResolution(layer), {srs: projection})}
                        env={this.props.env}
                    >
                        {this.renderLayerContent(layer, projection)}
                    </Layer>)

                )}
            </PMap>
            {this.props.enableScalebox ? <ScaleBox id="mappreview-scalebox"
                currentZoomLvl={this.props.map.scaleZoom}
                scales={this.props.scales}
                onChange={this.props.onChangeZoomLevel}
            /> : null}
            {this.props.enableRefresh ? <Button bsStyle="primary" onClick={this.props.onMapRefresh} className="print-mappreview-refresh"><Glyphicon glyph="refresh"/></Button> : null}
            </div>
            : null;
    }

    adjustResolution = (layer) => {
        const ratio = this.getRatio();
        const dpi = Math.round(96.0 / ratio);
        return assign({}, layer, {
            ...(!isNil(layer?.minResolution) && { minResolution: layer.minResolution * ratio }),
            ...(!isNil(layer?.maxResolution) && { maxResolution: layer.maxResolution * ratio }),
            params: assign({}, layer.params, {
                "format_options": "dpi:" + dpi,
                "MAP.RESOLUTION": dpi
            })
        });
    };
}

export default MapPreview;
