/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ol = require('openlayers');
var React = require('react');
var CoordinatesUtils = require('../../utils/CoordinatesUtils');
var ConfigUtils = require('../../utils/ConfigUtils');

var OpenlayersMap = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        center: ConfigUtils.PropTypes.center,
        zoom: React.PropTypes.number.isRequired,
        projection: React.PropTypes.string,
        onMapViewChanges: React.PropTypes.func,
        onClick: React.PropTypes.func,
        mapOptions: React.PropTypes.object
    },
    getDefaultProps() {
        return {
          id: 'map',
          onMapViewChanges: React.PropTypes.func,
          onClick: React.PropTypes.func,
          mapOptions: {},
          projection: 'EPSG:3857'
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
              collapsible: false,
              className: "hidden"
            })
        });
        var map = new ol.Map({
          layers: [],
          controls: controls,
          interactions: interactions,
          target: this.props.id,
          view: new ol.View({
            center: [center.x, center.y],
            zoom: this.props.zoom
          })
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
            }, size);
        });
        map.on('click', (event) => {
            this.props.onClick({
                x: event.pixel[0],
                y: event.pixel[1]
            });
        });

        this.map = map;
        // NOTE: this re-call render function after div creation to have the map initialized.
        this.forceUpdate();
    },
    componentWillReceiveProps(newProps) {
        var view = this.map.getView();
        const currentCenter = this.normalizeCenter(view.getCenter());
        const centerIsUpdated = newProps.center.y === currentCenter[1] &&
                               newProps.center.x === currentCenter[0];

        if (!centerIsUpdated) {
            view.setCenter([newProps.center.x, newProps.center.y]);
        }
        if (newProps.zoom !== view.getZoom()) {
            view.setZoom(newProps.zoom);
        }
    },
    componentWillUnmount() {
        this.map.setTarget(null);
    },
    render() {
        const map = this.map;
        const children = map ? React.Children.map(this.props.children, child => {
            return child ? React.cloneElement(child, {map: map, mapId: this.props.id}) : null;
        }) : null;

        return (
            <div id={this.props.id}>
                {children}
            </div>
        );
    },
    normalizeCenter: function(center) {
        return ol.proj.transform(center, this.props.projection, 'EPSG:4326');
    }
});

module.exports = OpenlayersMap;
