/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { defaults, DragPan, MouseWheelZoom } from 'ol/interaction';
import { defaults as defaultControls } from 'ol/control';
import Map from 'ol/Map';
import View from 'ol/View';
import { toLonLat } from 'ol/proj';
import Zoom from 'ol/control/Zoom';
import Units from 'ol/proj/Units';

import { getWidth, getHeight } from 'ol/extent';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4.js';
import PropTypes from 'prop-types';
import React from 'react';
import assign from 'object-assign';

import CoordinatesUtils from '../../../utils/CoordinatesUtils';
import ConfigUtils from '../../../utils/ConfigUtils';
import mapUtils from '../../../utils/MapUtils';
import projUtils from '../../../utils/openlayers/projUtils';
import { DEFAULT_INTERACTION_OPTIONS } from '../../../utils/openlayers/DrawUtils';

import {isEqual, find, throttle, isArray, isNil} from 'lodash';


import 'ol/ol.css';

// add overrides for css
import './mapstore-ol-overrides.css';

class OpenlayersMap extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        document: PropTypes.object,
        style: PropTypes.object,
        center: ConfigUtils.PropTypes.center,
        zoom: PropTypes.number.isRequired,
        mapStateSource: ConfigUtils.PropTypes.mapStateSource,
        projection: PropTypes.string,
        projectionDefs: PropTypes.array,
        onMapViewChanges: PropTypes.func,
        onResolutionsChange: PropTypes.func,
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
        hookRegister: PropTypes.object,
        interactive: PropTypes.bool,
        onCreationError: PropTypes.func,
        bbox: PropTypes.object,
        wpsBounds: PropTypes.object,
        onWarning: PropTypes.func,
        maxExtent: PropTypes.array,
        limits: PropTypes.object,
        onMouseOut: PropTypes.func
    };

    static defaultProps = {
        id: 'map',
        onMapViewChanges: () => { },
        onResolutionsChange: () => { },
        onCreationError: () => { },
        onClick: null,
        onMouseMove: () => { },
        mapOptions: {},
        projection: 'EPSG:3857',
        projectionDefs: [],
        onLayerLoading: () => { },
        onLayerLoad: () => { },
        onLayerError: () => { },
        resize: 0,
        registerHooks: true,
        hookRegister: mapUtils,
        interactive: true,
        onMouseOut: () => {}
    };

    componentDidMount() {
        this.props.projectionDefs.forEach(p => {
            const projDef = proj4.defs(p.code);
            projUtils.addProjections(p.code, p.extent, p.worldExtent, p.axisOrientation || projDef.axis || 'enu', projDef.units || 'm');
        });
        // It may be a good idea to check if CoordinateUtils also registered the projectionDefs
        // normally it happens ad application level.
        let center = CoordinatesUtils.reproject([this.props.center.x, this.props.center.y], 'EPSG:4326', this.props.projection);
        register(proj4);
        // interactive flag is used only for initializations,
        // TODO manage it also when it changes status (ComponentWillReceiveProps)
        let interactionsOptions = assign(
            this.props.interactive ?
                {} :
                {
                    doubleClickZoom: false,
                    dragPan: false,
                    altShiftDragRotate: false,
                    keyboard: false,
                    mouseWheelZoom: false,
                    shiftDragZoom: false,
                    pinchRotate: false,
                    pinchZoom: false
                },
            this.props.mapOptions.interactions);

        let interactions = defaults(assign({
            dragPan: false,
            mouseWheelZoom: false
        }, interactionsOptions, {}));
        if (interactionsOptions === undefined || interactionsOptions.dragPan === undefined) {
            this.dragPanInteraction = new DragPan({ kinetic: false });
            interactions.extend([
                this.dragPanInteraction
            ]);
        }
        if (interactionsOptions === undefined || interactionsOptions.mouseWheelZoom === undefined) {
            this.mouseWheelInteraction = new MouseWheelZoom({ duration: 0 });
            interactions.extend([
                this.mouseWheelInteraction
            ]);
        }
        let controls = defaultControls(assign({
            zoom: this.props.zoomControl,
            attributionOptions: assign({
                collapsible: false
            }, this.props.mapOptions.attribution && this.props.mapOptions.attribution.container ? {
                target: this.getDocument().querySelector(this.props.mapOptions.attribution.container)
            } : {})
        }, this.props.mapOptions.controls));

        let map = new Map({
            layers: [],
            controls: controls,
            interactions: interactions,
            maxTilesLoading: Infinity,
            target: this.getDocument().getElementById(this.props.id) || `${this.props.id}`,
            view: this.createView(center, Math.round(this.props.zoom), this.props.projection, this.props.mapOptions && this.props.mapOptions.view, this.props.limits)
        });

        this.map = map;
        this.map.disabledListeners = {};
        this.map.disableEventListener = (event) => {
            this.map.disabledListeners[event] = true;
        };
        this.map.enableEventListener = (event) => {
            delete this.map.disabledListeners[event];
        };
        // The timeout is needed to cover the delay we have for the throttled mouseMove event.
        this.map.getViewport().addEventListener('mouseout', () => {
            setTimeout(() => this.props.onMouseOut(), 150);
        });
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
                    pos = toLonLat(pos, this.props.projection);
                    projectionExtent = CoordinatesUtils.reprojectBbox(projectionExtent, this.props.projection, "EPSG:4326");
                }
                // prevent user from clicking outside the projection extent
                if (pos[0] >= projectionExtent[0] && pos[0] <= projectionExtent[2] &&
                    pos[1] >= projectionExtent[1] && pos[1] <= projectionExtent[3]) {
                    let coords;
                    if (this.props.projection !== 'EPSG:900913' && this.props.projection !== 'EPSG:3857') {
                        coords = CoordinatesUtils.reproject(pos, this.props.projection, "EPSG:4326");
                    } else {
                        coords = { x: pos[0], y: pos[1] };
                    }

                    let layerInfo;
                    this.markerPresent = false;
                    /*
                     * Handle special case for vector features with handleClickOnLayer=true
                     * Modifies the clicked point coordinates to center the marker and sets the layerInfo for
                     * the clickPoint event (used as flag to show or hide marker)
                     */
                    map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
                        if (layer && layer.get('handleClickOnLayer')) {
                            const geom = feature.getGeometry();
                            // TODO: We should find out a better way to identify it then checking geometry type
                            if (!this.markerPresent && geom.getType() === "Point") {
                                this.markerPresent = true;
                                layerInfo = layer.get('msId');
                                const arr = toLonLat(geom.getFirstCoordinate(), this.props.projection);
                                coords = { x: arr[0], y: arr[1] };
                            }
                        }
                    });
                    const tLng = CoordinatesUtils.normalizeLng(coords.x);
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
                        rawPos: event.coordinate.slice(),
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

        this.props.onResolutionsChange(this.getResolutions());
        if (this.props.registerHooks) {
            this.registerHooks();
        }
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.mousePointer !== this.props.mousePointer) {
            this.setMousePointer(newProps.mousePointer);
        }
        if (newProps.zoomControl !== this.props.zoomControl) {
            if (newProps.zoomControl) {
                this.map.addControl(new Zoom());
            } else {
                this.map.removeControl(this.map.getControls().getArray().filter((ctl) => ctl instanceof Zoom)[0]);
            }
        }

        /*
         * Manage interactions programmatically.
         * map interactions may change, i.e. becoming enabled or disabled
         * TODO: with re-generation of mapOptions the application could do this operation
         * on every render. We should prevent it with something like isEqual if this becomes
         * a performance problem
         */
        if (this.map && (this.props.mapOptions && this.props.mapOptions.interactions) !== (newProps.mapOptions && newProps.mapOptions.interactions)) {
            const newInteractions = newProps.mapOptions.interactions || {};
            const mapInteractions = this.map.getInteractions().getArray();
            Object.keys(newInteractions).forEach(newInteraction => {
                const {Instance, options} = DEFAULT_INTERACTION_OPTIONS[newInteraction] || {};
                let interaction = find(mapInteractions, inter => DEFAULT_INTERACTION_OPTIONS[newInteraction] && inter instanceof Instance);
                if (!interaction) {
                    /* if the interaction
                     *   does not exist in the map && now is enabled
                     * then
                     *   add it
                    */
                    newInteractions[newInteraction] && Instance && this.map.addInteraction(new Instance(options));
                } else {
                    // otherwise use existing interaction and enable or disable it based on newProps values
                    interaction.setActive(newInteractions[newInteraction]);
                }
            });
        }

        if (this.map && this.props.id !== newProps.mapStateSource) {
            this._updateMapPositionFromNewProps(newProps);
        }

        if (this.map && newProps.resize !== this.props.resize) {
            setTimeout(() => {
                this.map.updateSize();
            }, 0);
        }

        if (this.map && ((this.props.projection !== newProps.projection) || this.haveResolutionsChanged(newProps)) || this.props.limits !== newProps.limits) {
            if (this.props.projection !== newProps.projection || this.props.limits !== newProps.limits) {
                let mapProjection = newProps.projection;
                const center = CoordinatesUtils.reproject([
                    newProps.center.x,
                    newProps.center.y
                ], 'EPSG:4326', mapProjection);
                this.map.setView(this.createView(center, newProps.zoom, newProps.projection, newProps.mapOptions && newProps.mapOptions.view, newProps.limits));
                this.props.onResolutionsChange(this.getResolutions());
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
            && this.getDocument().querySelector(this.props.mapOptions.attribution.container);
        if (attributionContainer && attributionContainer.querySelector('.ol-attribution')) {
            try {
                attributionContainer.removeChild(attributionContainer.querySelector('.ol-attribution'));
            } catch (e) {
                // do nothing... probably an old configuration
            }

        }
        if (this.map) {
            this.map.setTarget(null);
        }
    }
    getDocument = () => {
        return this.props.document || document;
    };
    /**
     * Calculates resolutions accordingly with default algorithm in GeoWebCache.
     * See this: https://github.com/GeoWebCache/geowebcache/blob/5e913193ff50a61ef9dd63a87887189352fa6b21/geowebcache/core/src/main/java/org/geowebcache/grid/GridSetFactory.java#L196
     * It allows to have the resolutions aligned to the default generated grid sets on server side.
     * **NOTES**: this solution doesn't support:
     * - custom grid sets with `alignTopLeft=true` (e.g. GlobalCRS84Pixel). Custom resolutions will need to be configured as `mapOptions.view.resolutions`
     * - custom grid set with custom extent. You need to customize the projection definition extent to make it work.
     * - custom grid set is partially supported by mapOptions.view.resolutions but this is not managed by projection change yet
     * - custom tile sizes
     *
     */
    getResolutions = () => {
        const tileWidth = 256; // TODO: pass as parameters
        const tileHeight = 256; // TODO: pass as parameters - allow different from tileWidth
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

        const extentWidth = !extent ? 360 * Units.METERS_PER_UNIT[Units.DEGREES] /
            Units.METERS_PER_UNIT[projection.getUnits()] :
            getWidth(extent);
        const extentHeight = !extent ? 360 * Units.METERS_PER_UNIT[Units.DEGREES] /
            Units.METERS_PER_UNIT[projection.getUnits()] :
            getHeight(extent);

        let resX = extentWidth / tileWidth;
        let resY = extentHeight / tileHeight;
        let tilesWide;
        let tilesHigh;
        if (resX <= resY) {
            // use one tile wide by N tiles high
            tilesWide = 1;
            tilesHigh = Math.round(resY / resX);
            // previous resY was assuming 1 tile high, recompute with the actual number of tiles
            // high
            resY = resY / tilesHigh;
        } else {
            // use one tile high by N tiles wide
            tilesHigh = 1;
            tilesWide = Math.round(resX / resY);
            // previous resX was assuming 1 tile wide, recompute with the actual number of tiles
            // wide
            resX = resX / tilesWide;
        }
        // the maximum of resX and resY is the one that adjusts better
        const res = Math.max(resX, resY);

        /*
            // TODO: this is how GWC creates the bbox adjusted.
            // We should calculate it to have the correct extent for a grid set
            const adjustedExtentWidth = tilesWide * tileWidth * res;
            const adjustedExtentHeight = tilesHigh * tileHeight * res;
            BoundingBox adjExtent = new BoundingBox(extent);
            adjExtent.setMaxX(adjExtent.getMinX() + adjustedExtentWidth);
            // Do we keep the top or the bottom fixed?
            if (alignTopLeft) {
                adjExtent.setMinY(adjExtent.getMaxY() - adjustedExtentHeight);
            } else {
                adjExtent.setMaxY(adjExtent.getMinY() + adjustedExtentHeight);

         */

        const defaultMaxResolution = res;

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
            const getElevation = this.map.get('elevationLayer') && this.map.get('elevationLayer').get('getElevation');
            let pos = event.coordinate.slice();
            let coords = toLonLat(pos, this.props.projection);
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
                },
                latlng: {
                    lat: coords[1],
                    lng: tLng,
                    z: getElevation && getElevation(pos, event.pixel) || undefined
                },
                lat: coords[1],
                lng: tLng,
                rawPos: event.coordinate.slice()
            });
        }
    };

    updateMapInfoState = () => {
        let view = this.map.getView();
        let tempCenter = view.getCenter();
        let projectionExtent = view.getProjection().getExtent();
        const crs = view.getProjection().getCode();
        // some projections are repeated on the x axis
        // and they need to be updated also if the center is outside of the projection extent
        const wrappedProjections = ['EPSG:3857', 'EPSG:900913', 'EPSG:4326'];
        // prevent user from dragging outside the projection extent
        if (wrappedProjections.indexOf(crs) !== -1
            || (tempCenter && tempCenter[0] >= projectionExtent[0] && tempCenter[0] <= projectionExtent[2] &&
                tempCenter[1] >= projectionExtent[1] && tempCenter[1] <= projectionExtent[3])) {
            let c = this.normalizeCenter(view.getCenter());
            let bbox = view.calculateExtent(this.map.getSize());
            let size = {
                width: this.map.getSize()[0],
                height: this.map.getSize()[1]
            };
            this.props.onMapViewChanges({ x: c[0] || 0.0, y: c[1] || 0.0, crs: 'EPSG:4326' }, view.getZoom(), {
                bounds: {
                    minx: bbox[0],
                    miny: bbox[1],
                    maxx: bbox[2],
                    maxy: bbox[3]
                },
                crs,
                rotation: view.getRotation()
            }, size, this.props.id, this.props.projection);
        }
    };

    haveResolutionsChanged = (newProps) => {
        const resolutions = this.props.mapOptions && this.props.mapOptions.view ? this.props.mapOptions.view.resolutions : undefined;
        const newResolutions = newProps.mapOptions && newProps.mapOptions.view ? newProps.mapOptions.view.resolutions : undefined;
        return !isEqual(resolutions, newResolutions);
    };

    createView = (center, zoom, projection, options, limits = {}) => {
        // limit has a crs defined
        const extent = limits.restrictedExtent && limits.crs && CoordinatesUtils.reprojectBbox(limits.restrictedExtent, limits.crs, CoordinatesUtils.normalizeSRS(projection));
        const newOptions = !options || (options && !options.view) ? assign({}, options, { extent }) : assign({}, options);
        /*
        * setting the zoom level in the localConfig file is co-related to the projection extent(size)
        * it is recommended to use projections with the same coverage area (extent). If you want to have the same restricted zoom level (minZoom)
        */
        const viewOptions = assign({}, {
            projection: CoordinatesUtils.normalizeSRS(projection),
            center: [center.x, center.y],
            zoom: zoom,
            minZoom: limits.minZoom
        }, newOptions || {});
        return new View(viewOptions);
    };

    _updateMapPositionFromNewProps = (newProps) => {
        var view = this.map.getView();
        const currentCenter = this.props.center;
        const centerIsUpdated = newProps.center.y === currentCenter.y &&
            newProps.center.x === currentCenter.x;

        if (!centerIsUpdated) {
            // let center = ol.proj.transform([newProps.center.x, newProps.center.y], 'EPSG:4326', newProps.projection);
            let center = CoordinatesUtils.reproject({ x: newProps.center.x, y: newProps.center.y }, 'EPSG:4326', newProps.projection, true);
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
        let c = CoordinatesUtils.reproject({ x: center[0], y: center[1] }, this.props.projection, 'EPSG:4326', true);
        return [c.x, c.y];
    };

    setMousePointer = (pointer) => {
        if (this.map) {
            const mapDiv = this.map.getViewport();
            mapDiv.style.cursor = pointer || 'auto';
        }
    };

    registerHooks = () => {
        this.props.hookRegister.registerHook(mapUtils.RESOLUTIONS_HOOK, () => {
            return this.getResolutions();
        });
        this.props.hookRegister.registerHook(mapUtils.RESOLUTION_HOOK, () => {
            return this.map.getView().getResolution();
        });
        this.props.hookRegister.registerHook(mapUtils.COMPUTE_BBOX_HOOK, (center, zoom) => {
            var olCenter = CoordinatesUtils.reproject([center.x, center.y], 'EPSG:4326', this.props.projection);
            let view = this.createView(olCenter, zoom, this.props.projection, this.props.mapOptions && this.props.mapOptions.view, this.props.limits);
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
        this.props.hookRegister.registerHook(mapUtils.GET_PIXEL_FROM_COORDINATES_HOOK, (pos) => {
            return this.map.getPixelFromCoordinate(pos);
        });
        this.props.hookRegister.registerHook(mapUtils.GET_COORDINATES_FROM_PIXEL_HOOK, (pixel) => {
            return this.map.getCoordinateFromPixel(pixel);
        });
        this.props.hookRegister.registerHook(mapUtils.ZOOM_TO_EXTENT_HOOK, (extent, { padding, crs, maxZoom: zoomLevel, duration} = {}) => {
            let bounds = CoordinatesUtils.reprojectBbox(extent, crs, this.props.projection);
            // if EPSG:4326 with max extent (-180, -90, 180, 90) bounds are 0,0,0,0. In this case zoom to max extent
            // TODO: improve this to manage all degenerated bounding boxes.
            if (bounds && bounds[0] === bounds[2] && bounds[1] === bounds[3] &&
                crs === "EPSG:4326" && isArray(extent) && extent[0] === -180 && extent[1] === -90) {
                bounds = this.map.getView().getProjection().getExtent();
            }
            let maxZoom = zoomLevel;
            if (bounds && bounds[0] === bounds[2] && bounds[1] === bounds[3] && isNil(maxZoom)) {
                maxZoom = 21; // TODO: allow to this maxZoom to be customizable
            }

            this.map.getView().fit(bounds, {
                size: this.map.getSize(),
                padding: padding && [padding.top || 0, padding.right || 0, padding.bottom || 0, padding.left || 0],
                maxZoom,
                duration
            });
        });
    };
}

export default OpenlayersMap;
