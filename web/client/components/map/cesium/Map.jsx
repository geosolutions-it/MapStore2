/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import '@znemz/cesium-navigation/dist/index.css';
import viewerCesiumNavigationMixin from '@znemz/cesium-navigation';

import PropTypes from 'prop-types';
import Rx from 'rxjs';
import React, { useState, forwardRef } from 'react';
import ReactDOM from 'react-dom';
import ConfigUtils from '../../../utils/ConfigUtils';
import ClickUtils from '../../../utils/cesium/ClickUtils';
import {
    ZOOM_TO_EXTENT_HOOK,
    registerHook,
    GET_PIXEL_FROM_COORDINATES_HOOK,
    GET_COORDINATES_FROM_PIXEL_HOOK,
    getResolutions
} from '../../../utils/MapUtils';
import { reprojectBbox } from '../../../utils/CoordinatesUtils';
import assign from 'object-assign';
import { throttle, isEqual } from 'lodash';

class CesiumMap extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        document: PropTypes.object,
        center: ConfigUtils.PropTypes.center,
        zoom: PropTypes.number.isRequired,
        mapStateSource: ConfigUtils.PropTypes.mapStateSource,
        projection: PropTypes.string,
        onMapViewChanges: PropTypes.func,
        onCreationError: PropTypes.func,
        onClick: PropTypes.func,
        onMouseMove: PropTypes.func,
        mapOptions: PropTypes.object,
        standardWidth: PropTypes.number,
        standardHeight: PropTypes.number,
        mousePointer: PropTypes.string,
        zoomToHeight: PropTypes.number,
        registerHooks: PropTypes.bool,
        hookRegister: PropTypes.object,
        viewerOptions: PropTypes.object,
        orientate: PropTypes.object,
        zoomControl: PropTypes.bool,
        errorPanel: PropTypes.func,
        onReload: PropTypes.func,
        style: PropTypes.object,
        interactive: PropTypes.bool
    };

    static defaultProps = {
        id: 'map',
        onMapViewChanges: () => {},
        onClick: () => {},
        onCreationError: () => {},
        projection: "EPSG:3857",
        mapOptions: {},
        standardWidth: 512,
        standardHeight: 512,
        zoomToHeight: 80000000,
        registerHooks: true,
        hookRegister: {
            registerHook
        },
        orientate: undefined,
        viewerOptions: {
            orientation: {
                heading: 0,
                pitch: -1 * Math.PI / 2,
                roll: 0
            }
        },
        onReload: () => {},
        interactive: true
    };

    state = {
        renderError: null
    };

    UNSAFE_componentWillMount() {
        /*
         this prevent the Safari browser to zoom and mess up with the view.
         added only for Safari's browsers (mobile and not) bescause from safari 10 it
         won't allow you to disable pinch to zoom with the user-scalable attribute.
         see https://stackoverflow.com/questions/4389932/how-do-you-disable-viewport-zooming-on-mobile-safari/39711930#39711930
         */
        this.getDocument().addEventListener('gesturestart', this.gestureStartListener );
    }

    componentDidMount() {
        const creditContainer = document.querySelector(this.props.mapOptions?.attribution?.container || '#footer-attribution-container');
        let map = new Cesium.Viewer(this.getDocument().getElementById(this.props.id), assign({
            imageryProvider: new Cesium.OpenStreetMapImageryProvider(), // redefining to avoid to use default bing (that queries the bing API without any reason, because baseLayerPicker is false, anyway)
            baseLayerPicker: false,
            animation: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false,
            // if creditContainer is null we should pass undefined
            // to avoid error on mount
            creditContainer: creditContainer
                ? creditContainer
                : undefined,
            requestRenderMode: true,
            maximumRenderTimeChange: Infinity,
            skyBox: false,
            scene3DOnly: true                       // we are using cesium for 3d scene and ol for 2d plus there is an error while converting and normalizing the ifc position when scene3DOnly is false
        }, this.getMapOptions(this.props.mapOptions)));

        // prevent default behavior
        // such as lock the camera on model after double click
        map.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        if (this.props.errorPanel) {
            // override the default error message overlay
            map.cesiumWidget.showErrorPanel = (title, message, error) => {
                this.setState({ renderError: { title, message, error } }); // eslint-disable-line -- TODO: need to be fixed
            };
        }

        if (this.props.registerHooks) {
            this.registerHooks();
        }
        if (this.props.mapOptions?.navigationTools !== false) {
            map.extend(viewerCesiumNavigationMixin, {
                enableCompass: this.props.mapOptions?.navigationTools,
                // the default zoom controls inside CesiumNavigation are not working
                // when the enableZoom is false
                enableZoomControls: false,
                enableDistanceLegend: false
            });
        }
        map.scene.globe.baseColor = Cesium.Color.WHITE;
        map.imageryLayers.removeAll();
        map.camera.moveEnd.addEventListener(this.updateMapInfoState);
        this.hand = new Cesium.ScreenSpaceEventHandler(map.scene.canvas);
        this.subscribeClickEvent(map);

        this.hand.setInputAction(throttle(this.onMouseMove.bind(this), 500), Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        const destination = [
            this.props.viewerOptions?.cameraPosition?.longitude ?? this.props.center?.x,
            this.props.viewerOptions?.cameraPosition?.latitude ?? this.props.center?.y,
            this.props.viewerOptions?.cameraPosition?.height ?? this.getHeightFromZoom(this.props.zoom)
        ];
        // sometimes the center is undefined on browser history navigation
        // we should not perform setView in these cases
        if (destination[0] !== undefined && destination[1] !== undefined) {
            map.camera.setView({
                destination: Cesium.Cartesian3.fromDegrees(...destination),
                orientation: this.props.viewerOptions?.orientation
            });
        }

        this.setMousePointer(this.props.mousePointer);

        this.map = map;
        const scene = this.map.scene;
        // update interactions after this.map is defined
        this.updateInteractions(this.props);

        // configure the sky environment
        scene.skyAtmosphere.show = this.props.mapOptions?.showSkyAtmosphere ?? true;
        scene.fog.enabled = this.props.mapOptions?.enableFog ?? false;
        scene.globe.showGroundAtmosphere = this.props.mapOptions?.showGroundAtmosphere ?? false;

        // this is needed to display correctly intersection between terrain and primitives
        scene.globe.depthTestAgainstTerrain = this.props.mapOptions?.depthTestAgainstTerrain ?? false;
        // set zoom limits if found
        if (this.props.mapOptions?.minimumZoomDistance || this.props.mapOptions?.maximumZoomDistance) {
            const minZoomLevel = this.props.mapOptions?.minimumZoomDistance;
            const maxZoomLevel = this.props.mapOptions?.maximumZoomDistance;
            if (minZoomLevel) {
                map.scene.screenSpaceCameraController.minimumZoomDistance = minZoomLevel;
            }
            if (maxZoomLevel) {
                map.scene.screenSpaceCameraController.maximumZoomDistance = maxZoomLevel;
            }
        }
        this.updateLighting({}, this.props);
        this.forceUpdate();
        map.scene.requestRender();
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.mousePointer !== this.props.mousePointer) {
            this.setMousePointer(newProps.mousePointer);
        }
        if (newProps.mapStateSource !== this.props.id) {
            this._updateMapPositionFromNewProps(newProps);
        }
        return false;
    }

    componentDidUpdate(prevProps) {
        if (this.props?.orientate && prevProps && (!isEqual(this.props.orientate, prevProps?.orientate))) {
            const position = {
                destination: Cesium.Cartesian3.fromDegrees(
                    parseFloat(this.props.orientate.x),
                    parseFloat(this.props.orientate.y),
                    this.getHeightFromZoom(parseFloat(this.props.orientate.z))
                ),
                orientation: {
                    heading: parseFloat(this.props.orientate.heading),
                    pitch: parseFloat(this.props.orientate.pitch),
                    roll: parseFloat(this.props.orientate.roll)
                }
            };
            this.map.camera.cancelFlight();
            this.map.camera.flyTo(position, this.props.mapOptions.defaultFlightOptions);
        }

        if (prevProps && (this.props.mapOptions.showSkyAtmosphere !== prevProps?.mapOptions?.showSkyAtmosphere)) {
            this.map.scene.skyAtmosphere.show = this.props.mapOptions.showSkyAtmosphere;
        }
        if (prevProps && (this.props.mapOptions.showGroundAtmosphere !== prevProps?.mapOptions?.showGroundAtmosphere)) {
            this.map.scene.globe.showGroundAtmosphere = this.props.mapOptions.showGroundAtmosphere;
        }
        if (prevProps && (this.props.mapOptions.enableFog !== prevProps?.mapOptions?.enableFog)) {
            this.map.scene.fog.enabled = this.props.mapOptions.enableFog;
        }
        if (prevProps && (this.props.mapOptions.depthTestAgainstTerrain !== prevProps?.mapOptions?.depthTestAgainstTerrain)) {
            this.map.scene.globe.depthTestAgainstTerrain = this.props.mapOptions.depthTestAgainstTerrain;
        }

        if (prevProps?.interactive !== this.props.interactive
        || !isEqual(prevProps?.mapOptions?.interactions, this.props?.mapOptions?.interactions)) {
            this.updateInteractions(this.props);
        }
        // for lighting theme
        this.updateLighting(prevProps, this.props);
    }

    componentWillUnmount() {
        this.clickStream$.complete();
        this.pauserStream$.complete();
        this.hand.destroy();
        // see comment in UNSAFE_componentWillMount
        this.getDocument().removeEventListener('gesturestart', this.gestureStartListener );
        if (this.map?.cesiumNavigation?.destroy) {
            this.map.cesiumNavigation.destroy();
        }
        this.map.destroy();
    }

    onClick = (map, movement) => {
        if (this.props.onClick && movement.position !== null) {
            const cartesian = map.camera.pickEllipsoid(movement.position, map.scene.globe.ellipsoid);
            const intersectedFeatures = this.getIntersectedFeatures(map, movement.position);
            let cartographic = ClickUtils.getMouseXYZ(map, movement) || cartesian && Cesium.Cartographic.fromCartesian(cartesian);
            if (cartographic) {
                const latitude = cartographic.latitude * 180.0 / Math.PI;
                const longitude = cartographic.longitude * 180.0 / Math.PI;

                let elevation = Math.round(cartographic.height);
                // cartographic height of terrain in cesium is ellipsoidal
                // if we want the elevation above the sea level from a DTM
                // we should use an elevation layer instead
                if (this.map?.msElevationLayers?.[0]) {
                    elevation = this.getElevation(
                        cartographic.longitude,
                        cartographic.latitude
                    );
                }

                const y = (90.0 - latitude) / 180.0 * this.props.standardHeight * (this.props.zoom + 1);
                const x = (180.0 + longitude) / 360.0 * this.props.standardWidth * (this.props.zoom + 1);
                this.props.onClick({
                    pixel: {
                        x: x,
                        y: y
                    },
                    height: (this.props.mapOptions && this.props.mapOptions.terrainProvider) || intersectedFeatures.length > 0
                        ? cartographic.height
                        : undefined,
                    cartographic,
                    latlng: {
                        lat: latitude,
                        lng: longitude,
                        z: elevation
                    },
                    crs: "EPSG:4326",
                    intersectedFeatures,
                    resolution: getResolutions()[Math.round(this.props.zoom)]
                });
            }
        }
    };

    onMouseMove = (movement) => {
        if (this.props.onMouseMove && movement.endPosition && this.map?.camera) {
            const cartesian = this.map.camera.pickEllipsoid(movement.endPosition, this.map.scene.globe.ellipsoid);
            let cartographic = ClickUtils.getMouseXYZ(this.map, movement) || cartesian && Cesium.Cartographic.fromCartesian(cartesian);
            if (cartographic) {
                const intersectedFeatures = this.getIntersectedFeatures(this.map, movement.endPosition);
                let elevation = Math.round(cartographic.height);
                // cartographic height of terrain in cesium is ellipsoidal
                // if we want the elevation above the sea level from a DTM
                // we should use an elevation layer instead
                if (this.map?.msElevationLayers?.[0]) {
                    elevation = this.getElevation(
                        cartographic.longitude,
                        cartographic.latitude
                    );
                }
                this.props.onMouseMove({
                    y: cartographic.latitude * 180.0 / Math.PI,
                    x: cartographic.longitude * 180.0 / Math.PI,
                    z: elevation,
                    crs: "EPSG:4326",
                    intersectedFeatures
                });
            }
        }
    };

    getDocument = () => {
        return this.props.document || document;
    };

    getMapOptions = (rawOptions) => {
        let overrides = {};
        if (rawOptions.terrainProvider) {
            let {type, ...tpOptions} = rawOptions.terrainProvider;
            switch (type) {
            case "cesium": {
                overrides.terrainProvider = new Cesium.CesiumTerrainProvider(tpOptions);
                break;
            }
            case "ellipsoid": {
                overrides.terrainProvider = new Cesium.EllipsoidTerrainProvider();
                break;
            }
            default:
                break;
            }
        }
        return assign({}, rawOptions, overrides);
    };

    getCenter = () => {
        // the center should be computed based on where the camera is looking at and not the current camera position

        // we can start to compute with the pick functionality on the globe
        let target = this.map.scene.globe.pick(new Cesium.Ray(this.map.camera.position, this.map.camera.direction), this.map.scene);
        if (!target) {
            // if the pick fails in case the camera is looking at the sky
            // we compute the center position at a 100000 meter distance following the camera direction vector
            target = Cesium.Cartesian3.add(
                Cesium.Cartesian3.clone(this.map.camera.position),
                Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.clone(this.map.camera.direction), 100000, new Cesium.Cartesian3() ),
                new Cesium.Cartesian3()
            );
        }
        const center = Cesium.Cartographic.fromCartesian(
            new Cesium.Cartesian3(target.x, target.y, target.z)
        );
        return {
            longitude: Cesium.Math.toDegrees(center.longitude),
            latitude: Cesium.Math.toDegrees(center.latitude),
            height: center.height
        };
    };

    getZoomFromHeight = (height) => {
        return Math.log2(this.props.zoomToHeight / height) + 1;
    };

    getHeightFromZoom = (zoom) => {
        return this.props.zoomToHeight / Math.pow(2, zoom - 1);
    };

    getIntersectedFeatures = (map, position) => {
        // for consistency with 2D view we allow to drill pick through the first feature
        // and intersect all the features behind
        const features = map.scene.drillPick(position).filter((aFeature) => {
            const isQueryable = aFeature?.id?._msIsQueryable || aFeature?.primitive?._msIsQueryable;
            if (isQueryable) {
                return isQueryable();
            }
            return !(aFeature?.id?.entityCollection?.owner?.queryable === false);
        });
        if (features) {
            const groupIntersectedFeatures = features.reduce((acc, feature) => {
                let msId;
                let properties;
                let geometry = null;
                let id;
                if (feature instanceof Cesium.Cesium3DTileFeature && feature?.tileset?.msId) {
                    msId = feature.tileset.msId;
                    // 3d tile feature does not contain a geometry in the Cesium3DTileFeature class
                    // it has content but refers to the whole tile model
                    const getPropertyIds = feature.getPropertyIds();
                    properties = Object.fromEntries(getPropertyIds.map(key => [key, feature.getProperty(key)]));
                } else if (feature?.id?._msGetFeatureById || feature?.primitive?._msGetFeatureById) {
                    const getFeatureById = feature?.id?._msGetFeatureById || feature?.primitive?._msGetFeatureById;
                    const value = getFeatureById(feature.id);
                    properties = value.feature.properties;
                    geometry = value.feature.geometry;
                    id = value.feature.id;
                    msId = value.msId;
                }
                if (!properties || !msId) {
                    return acc;
                }
                const newFeature = { type: 'Feature', properties, geometry, ...(id && { id }) };
                return {
                    ...acc,
                    [msId]: acc[msId]
                        ? [...acc[msId], newFeature]
                        : [newFeature]
                };
            }, []);
            return Object.keys(groupIntersectedFeatures).map(id => ({ id, features: groupIntersectedFeatures[id] }));
        }
        return [];
    }

    getElevation(longitude, latitude) {
        const elevationLayers = this.map.msElevationLayers || [];
        return elevationLayers?.[0]?.getElevation
            ? elevationLayers[0].getElevation({
                longitude,
                latitude
            })
            : undefined;
    }

    render() {
        const map = this.map;
        const mapProj = this.props.projection;
        const children = map ? React.Children.map(this.props.children, child => {
            return child ? React.cloneElement(child, {
                map: map,
                projection: mapProj,
                onCreationError: this.props.onCreationError,
                zoom: this.props.zoom
            }) : null;
        }) : null;
        const ErrorPanel = this.props.errorPanel;
        return (
            <div id={this.props.id} style={this.props.style}>
                {children}
                {ErrorPanel ? <ErrorPanel
                    show={!!this.state.renderError}
                    error={this.state.renderError?.error}
                    onReload={() => this.props.onReload()}
                /> : null}
            </div>
        );
    }

    gestureStartListener = (e) => {
        e.preventDefault();
    }

    setMousePointer = (pointer) => {
        if (this.map) {
            const mapDiv = ReactDOM.findDOMNode(this).getElementsByClassName("cesium-viewer")[0];
            mapDiv.style.cursor = pointer || 'auto';
        }
    };

    _updateMapPositionFromNewProps = (newProps) => {
        // Do the change at the same time, to avoid glitches
        const currentCenter = this.getCenter();
        const cameraPosition = this.map.camera.positionCartographic;
        const currentZoom = this.getZoomFromHeight(cameraPosition.height);
        // current implementation will update the map only if the movement
        // between 12 decimals in the reference system to avoid rounded value
        // changes due to float mathematic operations.
        const isNearlyEqual = function(a, b) {
            if (a === undefined || b === undefined) {
                return false;
            }
            // avoid errors like 44.40641479 !== 44.40641478999999
            // using abs because the difference can be negative, creating a false positive
            return Math.abs(a.toFixed(12) - b.toFixed(12)) <= 0.000000000001;
        };

        // there are some transition cases where the center is not defined
        // so we could avoid to compute the setView if the center value is missing
        if (newProps.center === undefined) {
            return;
        }

        const centerIsUpdate = !isNearlyEqual(newProps.center.x, currentCenter.longitude) ||
                               !isNearlyEqual(newProps.center.y, currentCenter.latitude);
        const zoomChanged = newProps.zoom !== currentZoom;

        // Do the change at the same time, to avoid glitches
        if (centerIsUpdate || zoomChanged) {
            const position = {
                destination: Cesium.Cartesian3.fromDegrees(
                    newProps.center.x,
                    newProps.center.y,
                    newProps.zoom !== undefined ? this.getHeightFromZoom(newProps.zoom) : cameraPosition.height
                ),
                orientation: newProps.viewerOptions?.orientation
            };
            this.setView(position);
        }
    };

    setView = (position) => {
        this.map.camera.cancelFlight();
        this.map.camera.setView(position);
    };

    subscribeClickEvent = (map) => {
        const samePosition = (m1, m2) => m1 && m2 && m1.x === m2.x && m1.y === m2.y;
        const types = {
            LEFT_UP: Cesium.ScreenSpaceEventType.LEFT_UP,
            LEFT_DOWN: Cesium.ScreenSpaceEventType.LEFT_DOWN,
            LEFT_CLICK: Cesium.ScreenSpaceEventType.LEFT_CLICK,
            PINCH_START: Cesium.ScreenSpaceEventType.PINCH_START,
            PINCH_END: Cesium.ScreenSpaceEventType.PINCH_END,
            PINCH_MOVE: Cesium.ScreenSpaceEventType.PINCH_MOVE
        };
        const clickStream$ = new Rx.Subject();
        const pauserStream$ = new Rx.Subject();
        Object.keys(types).forEach((type) => this.hand.setInputAction((movement) => {
            pauserStream$.next({type: types[type], movement});
            clickStream$.next({type: types[type], movement});
        }, types[type]));

        /*
         * trigger onClick only when LEFT_CLICK that follow a LEFT_DOWN at the same position.
         * Every other mouse event before the LEFT_CLICK will not trigger the onClick function (happens with multitouch devices from cesium).
         * If a pinch event is ended, wait to start listening left clicks. This to skip the LEFT_UP,LEFT_DOWN, LEFT_CLICK sequence that cesium triggers after a pinch end,
         * that othewise can not be distinguished from a normal click event.
         */
        pauserStream$
            .filter( ev => ev.type === types.PINCH_END )
            .switchMap( () => Rx.Observable.of(true).concat(Rx.Observable.of(false).delay(500)))
            .startWith(false)
            .switchMap(paused => {
                // pause is realized by mapping the click stream or an infinite stream
                return paused ? Rx.Observable.never() : clickStream$;
            })
            .filter( ev => ev.type === types.LEFT_DOWN )
            .switchMap(({movement}) =>
                clickStream$
                    .filter( ev => ev.type === types.LEFT_CLICK )
                    .takeUntil(
                        Rx.Observable.timer(500).merge(
                            clickStream$
                                .filter( ev =>
                                    ev.type !== types.LEFT_UP && ev.type !== types.LEFT_CLICK
                                || ev.type === types.LEFT_UP && !samePosition(movement && movement.position, ev.movement && ev.movement.position)
                                )
                        )
                    )
            ).subscribe(({movement}) => this.onClick(map, movement));
        this.clickStream$ = clickStream$;
        this.pauserStream$ = pauserStream$;
    };
    registerHooks = () => {
        // Unregister hooks as coming from a leaflet or openlayer map retains hooks
        // causing issue in feature info click
        this.props.hookRegister.registerHook(GET_PIXEL_FROM_COORDINATES_HOOK);
        this.props.hookRegister.registerHook(GET_COORDINATES_FROM_PIXEL_HOOK);

        // Register hook
        this.props.hookRegister.registerHook(ZOOM_TO_EXTENT_HOOK, (extent, { crs, duration } = {}) => {
            // TODO: manage padding and maxZoom
            const bounds = reprojectBbox(extent, crs, 'EPSG:4326');
            if (this.map.camera.flyTo) {
                const rectangle = Cesium.Rectangle.fromDegrees(
                    bounds[0], // west,
                    bounds[1], // south,
                    bounds[2], // east,
                    bounds[3] // north
                );
                this.map.camera.flyTo({
                    destination: rectangle,
                    duration,
                    /*
                     * updateMapInfoState is triggered by camera.moveEnd
                     * too late (seconds later).
                     * This handler on complete cause duplicated call of updateMapInfoState but
                     * guarantees the testability of the callback
                     */
                    complete: this.updateMapInfoState
                });
            }
        });
    }
    updateMapInfoState = () => {
        const center = this.getCenter();
        const cameraPosition = this.map.camera.positionCartographic;
        const zoom = this.getZoomFromHeight(cameraPosition.height);
        const size = {
            height: Math.round(this.props.standardWidth * (zoom + 1)),
            width: Math.round(this.props.standardHeight * (zoom + 1))
        };

        const viewRectangle = this.map.camera.computeViewRectangle();

        this.props.onMapViewChanges(
            {
                x: center.longitude,
                y: center.latitude,
                crs: "EPSG:4326"
            },
            zoom,
            {
                bounds: viewRectangle
                    ? {
                        minx: Cesium.Math.toDegrees(viewRectangle.west),
                        miny: Cesium.Math.toDegrees(viewRectangle.south),
                        maxx: Cesium.Math.toDegrees(viewRectangle.east),
                        maxy: Cesium.Math.toDegrees(viewRectangle.north)
                    }
                    : {
                        minx: -180.0,
                        miny: -90.0,
                        maxx: 180.0,
                        maxy: 90.0
                    },
                crs: 'EPSG:4326',
                rotation: 0
            },
            size,
            this.props.id,
            this.props.projection,
            {
                cameraPosition: {
                    longitude: Cesium.Math.toDegrees(cameraPosition.longitude),
                    latitude: Cesium.Math.toDegrees(cameraPosition.latitude),
                    height: cameraPosition.height
                },
                orientation: {
                    heading: this.map.camera.heading,
                    pitch: this.map.camera.pitch,
                    roll: this.map.camera.roll
                }
            },
            getResolutions()[Math.round(zoom)]
        );
    };

    updateInteractions = (props) => {
        const interactionsOptions = {
            ...props.mapOptions?.interactions,
            ...(!props.interactive && {
                dragPan: false,
                mouseWheelZoom: false
            })
        };
        this.map.scene.screenSpaceCameraController.enableZoom = !(interactionsOptions.mouseWheelZoom === false);
        this.map.scene.screenSpaceCameraController.enableRotate = !(interactionsOptions.dragPan === false);
        this.map.scene.screenSpaceCameraController.enableTranslate = !(interactionsOptions.dragPan === false);
        this.map.scene.screenSpaceCameraController.enableTilt = !(interactionsOptions.dragPan === false);
    }
    resetMapLighting = (map) => {
        const sunLight = new Cesium.SunLight();
        map.scene.light = sunLight;
    }
    updateLighting = (prevProps, props) => {
        const prevLighting = prevProps?.mapOptions?.lighting;
        const lighting = props?.mapOptions?.lighting;
        if (prevProps && !isEqual(prevLighting, lighting)) {
            // clear event of preRender listener of flashlight if the prev. is flashlight
            this.resetMapLighting(this.map);
            if (this._flashLightListener) {
                this.map.scene.preRender.removeEventListener(this._flashLightListener);
                this._flashLightListener = undefined;
            }
            const lightingValue = lighting?.value;
            if (lightingValue === 'flashlight') {
                const flashlight = new Cesium.DirectionalLight({
                    direction: this.map.scene.camera.directionWC, // Updated every frame
                    intensity: 3.0
                });
                this.map.scene.light = flashlight;
                this._flashLightListener = (scene) => {
                    scene.light.direction = Cesium.Cartesian3.clone(
                        scene.camera.directionWC,
                        scene.light.direction
                    );
                };
                this.map.scene.preRender.addEventListener(this._flashLightListener);
            } else if (lightingValue === 'dateTime') {
                const selectedDate = lighting?.dateTime || (new Date()).toISOString();
                const currentTime = Cesium.JulianDate.fromDate(new Date(selectedDate));
                this.map.clock.shouldAnimate = false;
                this.map.clock.currentTime = currentTime;
            } else {
                //  'sunlight' is the default one
                const currentTime = Cesium.JulianDate.now();
                this.map.clock.currentTime = currentTime;
                // Enable animation for dynamic lighting
                this.map.clock.shouldAnimate = true;
            }
        }
    }
}

const ReloadCesiumMap = forwardRef((props, ref) => {
    // once the cesium map crashes the internal render cycle is stopped
    // we allow a complete refresh of the map by changing the key based on a reload request
    // new key will unmount and mount again the component
    const [key, setKey] = useState(1);
    return (
        <CesiumMap
            key={key}
            ref={ref}
            {...props}
            onReload={() => setKey(key + 1)}
        />
    );
});

export default ReloadCesiumMap;
