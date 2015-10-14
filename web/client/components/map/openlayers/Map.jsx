/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ol = require('openlayers');
var React = require('react');
var assign = require('object-assign');

var CoordinatesUtils = require('../../../utils/CoordinatesUtils');
var ConfigUtils = require('../../../utils/ConfigUtils');

var OpenlayersMap = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        center: ConfigUtils.PropTypes.center,
        zoom: React.PropTypes.number.isRequired,
        mapStateSource: ConfigUtils.PropTypes.mapStateSource,
        projection: React.PropTypes.string,
        onMapViewChanges: React.PropTypes.func,
        onClick: React.PropTypes.func,
        mapOptions: React.PropTypes.object,
        mousePointer: React.PropTypes.string,
        onMouseMove: React.PropTypes.func,
        onLayerLoading: React.PropTypes.func,
        onLayerLoad: React.PropTypes.func,
        resize: React.PropTypes.number,
        measurement: React.PropTypes.object,
        changeMeasurementState: React.PropTypes.func
    },
    getDefaultProps() {
        return {
          id: 'map',
          onMapViewChanges: () => {},
          onClick: null,
          onMouseMove: () => {},
          mapOptions: {},
          projection: 'EPSG:3857',
          onLayerLoading: () => {},
          onLayerLoad: () => {},
          resize: 0
        };
    },
    getInitialState() {
        return { };
    },
    componentDidMount() {
        var center = CoordinatesUtils.reproject([this.props.center.x, this.props.center.y], 'EPSG:4326', this.props.projection);
        let interactions = this.props.mapOptions.interactions || ol.interaction.defaults({
            dragPan: false,
            mouseWheelZoom: false
        }).extend([
            new ol.interaction.DragPan({kinetic: false}),
            new ol.interaction.MouseWheelZoom({duration: 0})
        ]);
        let controls = this.props.mapOptions.controls || ol.control.defaults({
            attributionOptions: ({
              collapsible: false
            })
        });
        var viewOptions = assign({}, {
            projection: this.props.projection,
            center: [center.x, center.y],
            zoom: this.props.zoom
        }, this.props.mapOptions.view || {});
        var map = new ol.Map({
          layers: [],
          controls: controls,
          interactions: interactions,
          target: this.props.id,
          view: new ol.View(viewOptions)
        });
        map.on('moveend', () => {
            let view = map.getView();
            let c = this.normalizeCenter(view.getCenter());
            let bbox = view.calculateExtent(map.getSize());
            let size = {
                width: map.getSize()[0],
                height: map.getSize()[1]
            };
            this.props.onMapViewChanges({x: c[0], y: c[1]}, view.getZoom(), {
                bounds: {
                    minx: bbox[0],
                    miny: bbox[1],
                    maxx: bbox[2],
                    maxy: bbox[3]
                },
                crs: view.getProjection().getCode(),
                rotation: view.getRotation()
            }, size, this.props.id);
        });
        map.on('click', (event) => {
            if (this.props.onClick) {
                this.props.onClick({
                    x: event.pixel[0],
                    y: event.pixel[1]
                });
            }
        });
        map.on('pointermove', (event) => {
            if (!event.dragging && event.coordinate) {
                let pos = event.coordinate.slice();
                let coords = ol.proj.toLonLat(pos, this.props.projection);
                let tLng = (( coords[0] / 360) % 1) * 360;
                if (tLng < -180) {
                    tLng = tLng + 360;
                } else if (tLng > 180) {
                    tLng = tLng - 360;
                }
                this.props.onMouseMove({
                    y: coords[1],
                    x: tLng,
                    crs: "EPSG:4326"
                });
            }
        });

        this.map = map;
        this.setMousePointer(this.props.mousePointer);
        // NOTE: this re-call render function after div creation to have the map initialized.
        this.forceUpdate();
    },
    componentWillReceiveProps(newProps) {
        if (newProps.mousePointer !== this.props.mousePointer) {
            this.setMousePointer(newProps.mousePointer);
        }

        if (this.props.id !== newProps.mapStateSource) {
            this._updateMapPositionFromNewProps(newProps);
        }

        if (this.map && newProps.resize > this.props.resize) {
            setTimeout(() => {
                this.map.updateSize();
            }, 0);
        }

        if (this.props.measurement.geomType !== newProps.measurement.geomType &&
                newProps.measurement.geomType !== null) {
            this.addDrawInteraction(newProps);
        }

        if (newProps.measurement.geomType === null) {
            this.removeDrawInteraction();
        }
    },
    componentWillUnmount() {
        this.map.setTarget(null);
    },
    render() {
        const map = this.map;
        const children = map ? React.Children.map(this.props.children, child => {
            return child ? React.cloneElement(child, {map: map, mapId: this.props.id,
                onLayerLoading: this.props.onLayerLoading, onLayerLoad: this.props.onLayerLoad}) : null;
        }) : null;

        return (
            <div id={this.props.id}>
                {children}
            </div>
        );
    },
    _updateMapPositionFromNewProps(newProps) {
        var view = this.map.getView();
        const currentCenter = this.props.center;
        const centerIsUpdated = newProps.center.y === currentCenter.y &&
                               newProps.center.x === currentCenter.x;

        if (!centerIsUpdated) {
            let center = ol.proj.transform([newProps.center.x, newProps.center.y], 'EPSG:4326', this.props.projection);
            view.setCenter(center);
        }
        if (newProps.zoom !== this.props.zoom) {
            view.setZoom(newProps.zoom);
        }
    },
    normalizeCenter: function(center) {
        return ol.proj.transform(center, this.props.projection, 'EPSG:4326');
    },
    setMousePointer(pointer) {
        if (this.map) {
            const mapDiv = this.map.getViewport();
            mapDiv.style.cursor = pointer || 'auto';
        }
    },
    addDrawInteraction: function(newProps) {
        var source;
        var vector;
        var draw;
        // cleanup old interaction
        if (this.drawInteraction) {
            this.removeDrawInteraction();
        }
        // create a layer to draw on
        source = new ol.source.Vector();
        vector = new ol.layer.Vector({
            source: source,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                  width: 2
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: '#ffcc33'
                    })
                })
            })
        });
        this.map.addLayer(vector);
        // create an interaction to draw with
        draw = new ol.interaction.Draw({
            source: source,
            type: /** @type {ol.geom.GeometryType} */ newProps.measurement.geomType,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.7)'
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    })
                })
            })
        });

        // update measurement results for every new vertex drawn
        this.map.on('click', function() {
            var newMeasureState = {
                lineMeasureEnabled: this.props.measurement.lineMeasureEnabled,
                areaMeasureEnabled: this.props.measurement.areaMeasureEnabled,
                geomType: this.props.measurement.geomType,
                len: this.props.measurement.geomType === 'LineString' ? this.sketchFeature.getGeometry().getLength() : 0,
                area: this.props.measurement.geomType === 'Polygon' ? this.sketchFeature.getGeometry().getArea() : 0,
                bearing: 0
            };
            this.props.changeMeasurementState(newMeasureState);
        }, this);

        draw.on('drawstart', function(evt) {
            // preserv the sketch feature of the draw controller
            // to update length/area on drawing a new vertex
            this.sketchFeature = evt.feature;
            // clear previous measurements
            source.clear();
        }, this);

        this.map.addInteraction(draw);
        this.drawInteraction = draw;
        this.measureLayer = vector;
    },
    removeDrawInteraction: function() {
        if (this.drawInteraction !== null) {
            this.map.removeInteraction(this.drawInteraction);
            this.drawInteraction = null;
            this.map.removeLayer(this.measureLayer);
            this.sketchFeature = null;
        }
    }
});

module.exports = OpenlayersMap;
