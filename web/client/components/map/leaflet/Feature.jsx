/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import PropTypes from 'prop-types';
import React from 'react';
import {isEqual, isArray, castArray} from 'lodash';
import axios from 'axios';

import {geometryToLayer} from '../../../utils/leaflet/Vector';
import {createStylesAsync} from '../../../utils/VectorStyleUtils';

class FeatureComponent extends React.Component {
    static propTypes = {
        msId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        type: PropTypes.string,
        styleName: PropTypes.string,
        properties: PropTypes.object,
        container: PropTypes.object, // TODO it must be a L.GeoJSON
        geometry: PropTypes.object, // TODO check for geojson format for geometry
        features: PropTypes.array,
        style: PropTypes.object,
        onClick: PropTypes.func,
        options: PropTypes.object
    };

    componentDidMount() {
        this._layers = [];
        if (this.props.container && this.props.geometry || this.props.features) {
            this.createLayer(this.props);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        // TODO check if shallow comparison is enough properties and geometry
        if (!isEqual(nextProps.properties, this.props.properties) ||
            !isEqual(nextProps.geometry, this.props.geometry) ||
            (nextProps.features !== this.props.features) ||
            (nextProps.style !== this.props.style) ||
            (nextProps.styleName !== this.props.styleName)) {
            this.removeLayer(nextProps);
            this.createLayer(nextProps);
        }
    }

    componentWillUnmount() {
        this.removeLayer(this.props);
    }

    render() {
        return null;
    }

    createLayer = (props) => {
        if (props.geometry) {
            this.addFeature({...props, style: props.style && castArray(props.style) || undefined});
        }
        if (props.features) {
            // supporting FeatureCollection
            props.features.forEach(f => {
                let newProps = Object.assign({}, props, {
                    type: f.type,
                    geometry: f.geometry,
                    style: f.style && castArray(f.style) || undefined,
                    properties: f.properties
                });
                this.addFeature(newProps);
            });
        }
    };

    addFeature(props) {
        if (isArray(props.style)) {
            let promises = createStylesAsync(props.style);
            axios.all(promises).then((styles) => {
                this.addLayer(props, styles);
            });
        } else {
            this.addLayer(props, props.style);
        }
    }

    addLayer(props, styles) {
        const layer = geometryToLayer({
            type: props.type,
            geometry: props.geometry,
            properties: props.properties,
            msId: props.msId
        }, {
            style: styles,
            styleName: props.styleName
        });
        props.container.addLayer(layer);
        // probably this event should be manage at Map level
        // if possible using the intersected features event
        layer.on('click', (event) => {
            if (props.onClick) {
                let rawPos = [event.latlng.lat, event.latlng.lng];
                /*
                 * Handle special case for vector features with handleClickOnLayer=true
                 * Modifies the clicked point coordinates to center the marker
                 */
                if (this.props.options.handleClickOnLayer && props.geometry?.type === "Point") {
                    const {_map: map} = event?.target || {};
                    const {lat, lng} =  map?.mouseEventToLatLng(event?.originalEvent) || {};
                    rawPos = [lat, lng];
                }
                props.onClick({
                    pixel: {
                        x: event.originalEvent && event.originalEvent.x,
                        y: event.originalEvent && event.originalEvent.y
                    },
                    latlng: event.latlng,
                    rawPos
                }, this.props.options.handleClickOnLayer ? this.props.options.id : null);
            }
        });
        if (!layer.setOpacity) {
            layer.setOpacity = function(layerOpacity = 1) {
                const originalStyle = this.originalStyle || this.options && this.options.style || this.options || {};
                this.originalStyle = {...originalStyle}; // Create a copy because the options ore mutable;
                const {
                    opacity = 1,
                    fillOpacity = 1,
                    color,
                    fillColor,
                    radius,
                    weight
                } = originalStyle;
                const style = {
                    color,
                    fillColor,
                    radius,
                    weight,
                    opacity: opacity * layerOpacity,
                    fillOpacity: fillOpacity * layerOpacity
                };
                if (layer.setStyle) {
                    layer.setStyle(style);
                }
            };
        }
        this._layers.push(layer);
    }
    /* it removes the layer from a container otherwise we would create and add more
     * layer with same features causing some unintended style override
    */
    removeLayer = (props) => {
        if (this._layers) {
            this._layers.forEach(l => {
                props.container.removeLayer(l);
            });
            this._layers = [];
        }
    }
}

// the _msLegacyGeoJSON flag has been added in case a vector layer is using the feature component to manage style and click action
// in case of this key is missing the layer will be in charge to manage the styling content of the features
// layers that are still using _msLegacyGeoJSON are annotations, highlights or vector layer with default legacy style
class Feature extends React.Component {
    static propTypes = {
        container: PropTypes.object
    }
    render() {
        return this.props.container._msLegacyGeoJSON
            ? <FeatureComponent
                {...this.props}
                ref={(cmp) => {
                    if (cmp) {
                        this._layers = cmp._layers;
                    }
                }}
            />
            : null;
    }
}

export default Feature;
