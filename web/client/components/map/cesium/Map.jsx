/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Cesium = require('../../../libs/cesium');
const PropTypes = require('prop-types');
const Rx = require('rxjs');
const React = require('react');
const ReactDOM = require('react-dom');
const ConfigUtils = require('../../../utils/ConfigUtils');
const ClickUtils = require('../../../utils/cesium/ClickUtils');
const mapUtils = require('../../../utils/MapUtils');
const CoordinatesUtils = require('../../../utils/CoordinatesUtils');

const assign = require('object-assign');
const {throttle} = require('lodash');

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
        viewerOptions: PropTypes.object
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
        hookRegister: mapUtils,
        viewerOptions: {
            orientation: {
                heading: 0,
                pitch: -1 * Math.PI / 2,
                roll: 0
            }
        }
    };

    state = { };

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
        var map = new Cesium.Viewer(this.getDocument().getElementById(this.props.id), assign({
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
            navigationInstructionsInitiallyVisible: false
        }, this.getMapOptions(this.props.mapOptions)));
        map.scene.globe.baseColor = Cesium.Color.WHITE;
        map.imageryLayers.removeAll();
        map.camera.moveEnd.addEventListener(this.updateMapInfoState);
        this.hand = new Cesium.ScreenSpaceEventHandler(map.scene.canvas);
        this.subscribeClickEvent(map);
        this.hand.setInputAction(throttle(this.onMouseMove.bind(this), 500), Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        map.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(
                this.props.center.x,
                this.props.center.y,
                this.getHeightFromZoom(this.props.zoom)
            )
        });

        this.setMousePointer(this.props.mousePointer);

        this.map = map;
        this.forceUpdate();
        if (this.props.mapOptions.navigationTools) {
            this.cesiumNavigation = window.CesiumNavigation;
            if (this.cesiumNavigation) {
                this.cesiumNavigation.navigationInitialization(this.props.id, map);
            }
        }
        if (this.props.registerHooks) {
            this.registerHooks();
        }
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

    componentWillUnmount() {
        this.clickStream$.complete();
        this.pauserStream$.complete();
        this.hand.destroy();
        // see comment in UNSAFE_componentWillMount
        this.getDocument().removeEventListener('gesturestart', this.gestureStartListener );
        this.map.destroy();
    }

    onClick = (map, movement) => {
        if (this.props.onClick && movement.position !== null) {
            const cartesian = map.camera.pickEllipsoid(movement.position, map.scene.globe.ellipsoid);
            let cartographic = ClickUtils.getMouseXYZ(map, movement) || cartesian && Cesium.Cartographic.fromCartesian(cartesian);
            if (cartographic) {
                const latitude = cartographic.latitude * 180.0 / Math.PI;
                const longitude = cartographic.longitude * 180.0 / Math.PI;

                const y = (90.0 - latitude) / 180.0 * this.props.standardHeight * (this.props.zoom + 1);
                const x = (180.0 + longitude) / 360.0 * this.props.standardWidth * (this.props.zoom + 1);
                this.props.onClick({
                    pixel: {
                        x: x,
                        y: y
                    },
                    height: this.props.mapOptions && this.props.mapOptions.terrainProvider ? cartographic.height : undefined,
                    cartographic,
                    latlng: {
                        lat: latitude,
                        lng: longitude
                    },
                    crs: "EPSG:4326"
                });
            }
        }
    };

    onMouseMove = (movement) => {
        if (this.props.onMouseMove && movement.endPosition) {
            const cartesian = this.map.camera.pickEllipsoid(movement.endPosition, this.map.scene.globe.ellipsoid);
            let cartographic = ClickUtils.getMouseXYZ(this.map, movement) || cartesian && Cesium.Cartographic.fromCartesian(cartesian);
            if (cartographic) {
                const elevation = Math.round(cartographic.height);
                this.props.onMouseMove({
                    y: cartographic.latitude * 180.0 / Math.PI,
                    x: cartographic.longitude * 180.0 / Math.PI,
                    z: elevation,
                    crs: "EPSG:4326"
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
        const center = this.map.camera.positionCartographic;
        return {
            longitude: center.longitude * 180 / Math.PI,
            latitude: center.latitude * 180 / Math.PI,
            height: center.height
        };
    };

    getZoomFromHeight = (height) => {
        return Math.log2(this.props.zoomToHeight / height) + 1;
    };

    getHeightFromZoom = (zoom) => {
        return this.props.zoomToHeight / Math.pow(2, zoom - 1);
    };

    render() {
        const map = this.map;
        const mapProj = this.props.projection;
        const children = map ? React.Children.map(this.props.children, child => {
            return child ? React.cloneElement(child, {map: map, projection: mapProj, onCreationError: this.props.onCreationError}) : null;
        }) : null;
        return (
            <div id={this.props.id}>
                {children}
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
        const currentZoom = this.getZoomFromHeight(currentCenter.height);
        // current implementation will update the map only if the movement
        // between 12 decimals in the reference system to avoid rounded value
        // changes due to float mathematic operations.
        const isNearlyEqual = function(a, b) {
            if (a === undefined || b === undefined) {
                return false;
            }
            // avoid errors like 44.40641479 !== 44.40641478999999
            return a.toFixed(12) - b.toFixed(12) <= 0.000000000001;
        };
        const centerIsUpdate = !isNearlyEqual(newProps.center.x, currentCenter.longitude) ||
                               !isNearlyEqual(newProps.center.y, currentCenter.latitude);
        const zoomChanged = newProps.zoom !== currentZoom;

        // Do the change at the same time, to avoid glitches
        if (centerIsUpdate || zoomChanged) {
            const position = {
                destination: Cesium.Cartesian3.fromDegrees(
                    newProps.center.x,
                    newProps.center.y,
                    this.getHeightFromZoom(newProps.zoom)
                ),
                orientation: newProps.viewerOptions.orientation
            };
            this.setView(position);
        }
    };

    setView = (position) => {
        if (this.props.mapOptions && this.props.mapOptions.flyTo) {
            this.map.camera.flyTo(position, this.props.mapOptions.defaultFlightOptions);
        } else {
            this.map.camera.setView(position);
        }
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
        this.props.hookRegister.registerHook(mapUtils.ZOOM_TO_EXTENT_HOOK, (extent, { crs, duration } = {}) => {
            // TODO: manage padding and maxZoom
            const bounds = CoordinatesUtils.reprojectBbox(extent, crs, 'EPSG:4326');
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
        const zoom = this.getZoomFromHeight(center.height);
        const size = {
            height: Math.round(this.props.standardWidth * (zoom + 1)),
            width: Math.round(this.props.standardHeight * (zoom + 1))
        };
        this.props.onMapViewChanges({
            x: center.longitude,
            y: center.latitude,
            crs: "EPSG:4326"
        }, zoom, {
            bounds: {
                minx: -180.0,
                miny: -90.0,
                maxx: 180.0,
                maxy: 90.0
            },
            crs: 'EPSG:4326',
            rotation: 0
        }, size, this.props.id, this.props.projection, {
            orientation: {
                heading: this.map.camera.heading,
                pitch: this.map.camera.pitch,
                roll: this.map.camera.roll
            }
        });
    };
}

module.exports = CesiumMap;
