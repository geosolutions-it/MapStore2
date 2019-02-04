/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const ol = require('openlayers');
const PropTypes = require('prop-types');
const React = require('react');
const assign = require('object-assign');

const CoordinatesUtils = require('../../../utils/CoordinatesUtils');
const ConfigUtils = require('../../../utils/ConfigUtils');
const mapUtils = require('../../../utils/MapUtils');
const projUtils = require('../../../utils/openlayers/projUtils');

const {isEqual, throttle, head, isArray} = require('lodash');

class OpenlayersMap extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        style: PropTypes.object,
        center: ConfigUtils.PropTypes.center,
        zoom: PropTypes.number.isRequired,
        mapStateSource: ConfigUtils.PropTypes.mapStateSource,
        projection: PropTypes.string,
        projectionDefs: PropTypes.array,
        onMapViewChanges: PropTypes.func,
        onClick: PropTypes.func,
        mapOptions: PropTypes.object,
        zoomControl: PropTypes.bool,
        mousePointer: PropTypes.string,
        onMouseMove: PropTypes.func,
        onLayerLoading: PropTypes.func,
        onLayerLoad: PropTypes.func,
        onLayerError: PropTypes.func,
        resize: PropTypes.number,
        measurement: PropTypes.object,
        changeMeasurementState: PropTypes.func,
        registerHooks: PropTypes.bool,
        interactive: PropTypes.bool,
        onCreationError: PropTypes.func,
        bbox: PropTypes.object,
        onWarning: PropTypes.func,
        maxExtent: PropTypes.array
    };

    static defaultProps = {
        id: 'map',
        onMapViewChanges: () => {},
        onCreationError: () => {},
        onClick: null,
        onMouseMove: () => {},
        mapOptions: {},
        projection: 'EPSG:3857',
        projectionDefs: [],
        onLayerLoading: () => {},
        onLayerLoad: () => {},
        onLayerError: () => {},
        resize: 0,
        registerHooks: true,
        interactive: true
    };

    componentDidMount() {
        this.props.projectionDefs.forEach(p => {
            projUtils.addProjections(ol, p.code, p.extent, p.worldExtent);
        });
        // It may be a good idea to check if CoordinateUtils also registered the projectionDefs
        // normally it happens ad application level.
        let center = CoordinatesUtils.reproject([this.props.center.x, this.props.center.y], 'EPSG:4326', this.props.projection);
        let interactionsOptions = assign(this.props.interactive ? {} : {
            doubleClickZoom: false,
            dragPan: false,
            altShiftDragRotate: false,
            keyboard: false,
            mouseWheelZoom: false,
            shiftDragZoom: false,
            pinchRotate: false,
            pinchZoom: false
        }, this.props.mapOptions.interactions);

        let interactions = ol.interaction.defaults(assign({
            dragPan: false,
            mouseWheelZoom: false
        }, interactionsOptions, {}));
        if (interactionsOptions === undefined || interactionsOptions.dragPan === undefined || interactionsOptions.dragPan) {
            interactions.extend([
                new ol.interaction.DragPan({kinetic: false})
            ]);
        }
        if (interactionsOptions === undefined || interactionsOptions.mouseWheelZoom === undefined || interactionsOptions.mouseWheelZoom) {
            interactions.extend([
                new ol.interaction.MouseWheelZoom({duration: 0})
            ]);
        }
        let controls = ol.control.defaults(assign({
            zoom: this.props.zoomControl,
            attributionOptions: assign({
                collapsible: false
            }, this.props.mapOptions.attribution && this.props.mapOptions.attribution.container ? {
                target: document.querySelector(this.props.mapOptions.attribution.container)
            } : {})
        }, this.props.mapOptions.controls));
        let map = new ol.Map({
            layers: [],
            controls: controls,
            interactions: interactions,
            target: this.props.id,
            view: this.createView(center, Math.round(this.props.zoom), this.props.projection, this.props.mapOptions && this.props.mapOptions.view)
        });

        this.map = map;
        this.map.disabledListeners = {};
        this.map.disableEventListener = (event) => {
            this.map.disabledListeners[event] = true;
        };
        this.map.enableEventListener = (event) => {
            delete this.map.disabledListeners[event];
        };
        // TODO support disableEventListener
        map.on('moveend', this.updateMapInfoState);
        map.on('singleclick', (event) => {
            if (this.props.onClick && !this.map.disabledListeners.singleclick) {
                let view = this.map.getView();
                let pos = event.coordinate.slice();
                let projectionExtent = view.getProjection().getExtent();
                if (this.props.projection === 'EPSG:4326') {
                    pos[0] = CoordinatesUtils.normalizeLng(pos[0]);
                }
                if (this.props.projection === 'EPSG:900913' || this.props.projection === 'EPSG:3857') {
                    pos = ol.proj.toLonLat(pos, this.props.projection);
                    projectionExtent = CoordinatesUtils.reprojectBbox(projectionExtent, this.props.projection, "EPSG:4326");
                }
                // prevent user from clicking outside the projection extent
                if (pos[0] >= projectionExtent[0] && pos[0] <= projectionExtent[2] &&
                    pos[1] >= projectionExtent[1] && pos[1] <= projectionExtent[3]) {
                    let coords;
                    if (this.props.projection !== 'EPSG:900913' && this.props.projection !== 'EPSG:3857') {
                        coords = CoordinatesUtils.reproject(pos, this.props.projection, "EPSG:4326");
                    } else {
                        coords = {x: pos[0], y: pos[1]};
                    }
                    let tLng = CoordinatesUtils.normalizeLng(coords.x);
                    let layerInfo;
                    map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
                        if (layer && layer.get('handleClickOnLayer')) {
                            layerInfo = layer.get('msId');
                            const geom = feature.getGeometry();
                            // TODO getFirstCoordinate makes sense only for points, maybe centroid is more appropriate
                            const getCoord = geom.getType() === "GeometryCollection" ? geom.getGeometries()[0].getFirstCoordinate() : geom.getFirstCoordinate();
                            coords = CoordinatesUtils.reproject(getCoord, this.props.projection, "EPSG:4326");
                        }
                        tLng = CoordinatesUtils.normalizeLng(coords.x);
                    });
                    const getElevation = this.map.get('elevationLayer') && this.map.get('elevationLayer').get('getElevation');
                    this.props.onClick({
                        pixel: {
                            x: event.pixel[0],
                            y: event.pixel[1]
                        },
                        latlng: {
                            lat: coords.y,
                            lng: tLng,
                            z: getElevation && getElevation(pos, event.pixel) || undefined
                        },
                        modifiers: {
                            alt: event.originalEvent.altKey,
                            ctrl: event.originalEvent.ctrlKey,
                            shift: event.originalEvent.shiftKey
                        }
                    }, layerInfo);
                }
            }
        });
        const mouseMove = throttle(this.mouseMoveEvent, 100);
        // TODO support disableEventListener
        map.on('pointermove', mouseMove);

        this.updateMapInfoState();
        this.setMousePointer(this.props.mousePointer);
        // NOTE: this re-call render function after div creation to have the map initialized.
        this.forceUpdate();

        if (this.props.registerHooks) {
            this.registerHooks();
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.mousePointer !== this.props.mousePointer) {
            this.setMousePointer(newProps.mousePointer);
        }

        if (newProps.zoomControl !== this.props.zoomControl) {
            if (newProps.zoomControl) {
                this.map.addControl(new ol.control.Zoom());
            } else {
                this.map.removeControl(this.map.getControls().getArray().filter((ctl) => ctl instanceof ol.control.Zoom)[0]);
            }
        }

        if (this.map && this.props.id !== newProps.mapStateSource) {
            this._updateMapPositionFromNewProps(newProps);
        }

        if (this.map && newProps.resize !== this.props.resize) {
            setTimeout(() => {
                this.map.updateSize();
            }, 0);
        }

        if (this.map && ((this.props.projection !== newProps.projection) || this.haveResolutionsChanged(newProps))) {
            if (this.props.projection !== newProps.projection) {
                let mapProjection = newProps.projection;
                const center = CoordinatesUtils.reproject([
                    newProps.center.x,
                    newProps.center.y
                ], 'EPSG:4326', mapProjection);
                const ViewExtent = CoordinatesUtils.reprojectBbox(this.map.getView().calculateExtent(this.map.getSize()), this.props.projection, newProps.projection);
                this.map.setView(this.createView(center, newProps.zoom, newProps.projection, newProps.mapOptions && newProps.mapOptions.view, ViewExtent));
                const mapExtent = mapProjection && newProps.maxExtent && CoordinatesUtils.reprojectBbox(newProps.maxExtent, mapProjection, 'EPSG:4326');
                // perform a check if the data and the projection are compatible
                if (newProps.children) {
                    head(newProps.children).map( layer => {
                        let boundingBox = layer.props.options.bbox;
                        if (boundingBox) {
                            let layerExtent = CoordinatesUtils.getExtentFromNormalized(boundingBox.bounds, boundingBox.crs).extent;
                            if (layerExtent.length === 2 && isArray(layerExtent[1])) {
                                layerExtent = layerExtent[1];
                            }

                            if ( mapProjection !== boundingBox.bounds.crs && (mapExtent && !CoordinatesUtils.isBboxCompatible(CoordinatesUtils.getPolygonFromExtent(mapExtent),
                            CoordinatesUtils.getPolygonFromExtent(layerExtent))) ||
                            (layer.props.options.type === "wmts" && !head(CoordinatesUtils.getEquivalentSRS(mapProjection).filter(proj => layer.props.options.matrixIds.hasOwnProperty(proj))))) {
                                this.props.onWarning({
                                    title: "warning",
                                    message: "notification.incompatibleDataAndProjection",
                                    action: {
                                        label: "close"
                                    },
                                    position: "tc",
                                    uid: "2"
                                });
                            }
                        }
                    });
                }
            }
            // We have to force ol to drop tile and reload
            this.map.getLayers().forEach((l) => {
                let source = l.getSource();
                if (source.getTileLoadFunction) {
                    source.setTileLoadFunction(source.getTileLoadFunction());
                }

            });

            this.map.render();
        }
    }

    componentWillUnmount() {
        const attributionContainer = this.props.mapOptions.attribution && this.props.mapOptions.attribution.container
        && document.querySelector(this.props.mapOptions.attribution.container);
        if (attributionContainer && attributionContainer.querySelector('.ol-attribution')) {
            attributionContainer.removeChild(attributionContainer.querySelector('.ol-attribution'));
        }
        if (this.map) {
            this.map.setTarget(null);
        }
    }

    getResolutions = () => {
        if (this.props.mapOptions && this.props.mapOptions.view && this.props.mapOptions.view.resolutions) {
            return this.props.mapOptions.view.resolutions;
        }
        const defaultMaxZoom = 28;
        const defaultZoomFactor = 2;

        let minZoom = this.props.mapOptions.minZoom !== undefined ?
            this.props.mapOptions.minZoom : 0;

        let maxZoom = this.props.mapOptions.maxZoom !== undefined ?
            this.props.mapOptions.maxZoom : defaultMaxZoom;

        let zoomFactor = this.props.mapOptions.zoomFactor !== undefined ?
            this.props.mapOptions.zoomFactor : defaultZoomFactor;

        const projection = this.map.getView().getProjection();
        const extent = projection.getExtent();
        const size = !extent ?
            // use the max width
            360 * ol.proj.METERS_PER_UNIT[ol.proj.Units.DEGREES] /
                ol.proj.METERS_PER_UNIT[projection.getUnits()] :
            ol.extent.getWidth(extent);

        const defaultMaxResolution = size / 256 / Math.pow(
            defaultZoomFactor, 0);

        const defaultMinResolution = defaultMaxResolution / Math.pow(
            defaultZoomFactor, defaultMaxZoom - 0);

        // user provided maxResolution takes precedence
        let maxResolution = this.props.mapOptions.maxResolution;
        if (maxResolution !== undefined) {
            minZoom = 0;
        } else {
            maxResolution = defaultMaxResolution / Math.pow(zoomFactor, minZoom);
        }

        // user provided minResolution takes precedence
        let minResolution = this.props.mapOptions.minResolution;
        if (minResolution === undefined) {
            if (this.props.mapOptions.maxZoom !== undefined) {
                if (this.props.mapOptions.maxResolution !== undefined) {
                    minResolution = maxResolution / Math.pow(zoomFactor, maxZoom);
                } else {
                    minResolution = defaultMaxResolution / Math.pow(zoomFactor, maxZoom);
                }
            } else {
                minResolution = defaultMinResolution;
            }
        }

        // given discrete zoom levels, minResolution may be different than provided
        maxZoom = minZoom + Math.floor(
            Math.log(maxResolution / minResolution) / Math.log(zoomFactor));
        return Array.apply(0, Array(maxZoom - minZoom + 1)).map((x, y) => maxResolution / Math.pow(zoomFactor, y));
    };

    render() {
        const map = this.map;
        const children = map ? React.Children.map(this.props.children, child => {
            return child ? React.cloneElement(child, {
                map: map,
                mapId: this.props.id,
                onLayerLoading: this.props.onLayerLoading,
                onLayerError: this.props.onLayerError,
                onLayerLoad: this.props.onLayerLoad,
                projection: this.props.projection,
                onCreationError: this.props.onCreationError
            }) : null;
        }) : null;

        return (
            <div id={this.props.id} style={this.props.style}>
                {children}
            </div>
        );
    }

    mouseMoveEvent = (event) => {
        if (!event.dragging && event.coordinate) {
            let pos = event.coordinate.slice();
            let coords = ol.proj.toLonLat(pos, this.props.projection);
            let tLng = coords[0] / 360 % 1 * 360;
            if (tLng < -180) {
                tLng = tLng + 360;
            } else if (tLng > 180) {
                tLng = tLng - 360;
            }
            this.props.onMouseMove({
                y: coords[1] || 0.0,
                x: tLng || 0.0,
                z: this.map.get('elevationLayer') && this.map.get('elevationLayer').get('getElevation')(pos, event.pixel) || undefined,
                crs: "EPSG:4326",
                pixel: {
                    x: event.pixel[0],
                    y: event.pixel[1]
                }
            });
        }
    };

    updateMapInfoState = () => {
        let view = this.map.getView();
        let tempCenter = view.getCenter();
        let projectionExtent = view.getProjection().getExtent();
        // prevent user from dragging outside the projection extent
        if (tempCenter && tempCenter[0] >= projectionExtent[0] && tempCenter[0] <= projectionExtent[2] &&
            tempCenter[1] >= projectionExtent[1] && tempCenter[1] <= projectionExtent[3]) {
            let c = this.normalizeCenter(view.getCenter());
            let bbox = view.calculateExtent(this.map.getSize());
            let size = {
                width: this.map.getSize()[0],
                height: this.map.getSize()[1]
            };
            this.props.onMapViewChanges({x: c[0] || 0.0, y: c[1] || 0.0, crs: 'EPSG:4326'}, view.getZoom(), {
                bounds: {
                    minx: bbox[0],
                    miny: bbox[1],
                    maxx: bbox[2],
                    maxy: bbox[3]
                },
                crs: view.getProjection().getCode(),
                rotation: view.getRotation()
            }, size, this.props.id, this.props.projection);
        }
    };

    haveResolutionsChanged = (newProps) => {
        const resolutions = this.props.mapOptions && this.props.mapOptions.view ? this.props.mapOptions.view.resolutions : undefined;
        const newResolutions = newProps.mapOptions && newProps.mapOptions.view ? newProps.mapOptions.view.resolutions : undefined;
        return !isEqual(resolutions, newResolutions);
    };

    createView = (center, zoom, projection, options, newExtent) => {

        const newOptions = newExtent ? assign({}, options, {extent: newExtent}) : assign({}, options);
        /*
        * setting the zoom level in the localConfig file is co-related to the projection extent(size)
        * it is recommended to use projections with the same coverage area (extent). If you want to have the same restricted zoom level (minZoom)
        */
        const viewOptions = assign({}, {
            projection: CoordinatesUtils.normalizeSRS(projection),
            center: [center.x, center.y],
            zoom: zoom
        }, newOptions || {});
        return new ol.View(viewOptions);
    };

    _updateMapPositionFromNewProps = (newProps) => {
        var view = this.map.getView();
        const currentCenter = this.props.center;
        const centerIsUpdated = newProps.center.y === currentCenter.y &&
                                newProps.center.x === currentCenter.x;

        if (!centerIsUpdated) {
            // let center = ol.proj.transform([newProps.center.x, newProps.center.y], 'EPSG:4326', newProps.projection);
            let center = CoordinatesUtils.reproject({x: newProps.center.x, y: newProps.center.y}, 'EPSG:4326', newProps.projection, true);
            view.setCenter([center.x, center.y]);
        }
        if (Math.round(newProps.zoom) !== this.props.zoom) {
            view.setZoom(Math.round(newProps.zoom));
        }
        if (newProps.bbox && newProps.bbox.rotation !== undefined || this.bbox && this.bbox.rotation !== undefined && newProps.bbox.rotation !== this.props.bbox.rotation) {
            view.setRotation(newProps.bbox.rotation);
        }
    };

    normalizeCenter = (center) => {
        let c = CoordinatesUtils.reproject({x: center[0], y: center[1]}, this.props.projection, 'EPSG:4326', true);
        return [c.x, c.y];
    };

    setMousePointer = (pointer) => {
        if (this.map) {
            const mapDiv = this.map.getViewport();
            mapDiv.style.cursor = pointer || 'auto';
        }
    };

    registerHooks = () => {
        mapUtils.registerHook(mapUtils.RESOLUTIONS_HOOK, () => {
            return this.getResolutions();
        });
        mapUtils.registerHook(mapUtils.RESOLUTION_HOOK, () => {
            return this.map.getView().getResolution();
        });
        mapUtils.registerHook(mapUtils.COMPUTE_BBOX_HOOK, (center, zoom) => {
            var olCenter = CoordinatesUtils.reproject([center.x, center.y], 'EPSG:4326', this.props.projection);
            let view = this.createView(olCenter, zoom, this.props.projection, this.props.mapOptions && this.props.mapOptions.view);
            let size = this.map.getSize();
            let bbox = view.calculateExtent(size);
            return {
                bounds: {
                    minx: bbox[0],
                    miny: bbox[1],
                    maxx: bbox[2],
                    maxy: bbox[3]
                },
                crs: this.props.projection,
                rotation: this.map.getView().getRotation()
            };
        });
        mapUtils.registerHook(mapUtils.GET_PIXEL_FROM_COORDINATES_HOOK, (pos) => {
            return this.map.getPixelFromCoordinate(pos);
        });
        mapUtils.registerHook(mapUtils.GET_COORDINATES_FROM_PIXEL_HOOK, (pixel) => {
            return this.map.getCoordinateFromPixel(pixel);
        });
    };
}

// add overrides for css
require('./mapstore-ol-overrides.css');
module.exports = OpenlayersMap;
