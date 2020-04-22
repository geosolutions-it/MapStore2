/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';
import Layers from '../../../utils/openlayers/Layers';
import CoordinatesUtils from '../../../utils/CoordinatesUtils';
import assign from 'object-assign';
import Rx from 'rxjs';
import isNumber from 'lodash/isNumber';
import isArray from 'lodash/isArray';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';

export default class OpenlayersLayer extends React.Component {
    static propTypes = {
        onWarning: PropTypes.func,
        maxExtent: PropTypes.array,
        map: PropTypes.object,
        mapId: PropTypes.string,
        srs: PropTypes.string,
        type: PropTypes.string,
        options: PropTypes.object,
        onLayerLoading: PropTypes.func,
        onLayerError: PropTypes.func,
        onCreationError: PropTypes.func,
        onLayerLoad: PropTypes.func,
        position: PropTypes.number,
        observables: PropTypes.array,
        securityToken: PropTypes.string,
        env: PropTypes.array
    };

    static defaultProps = {
        observables: [],
        onLayerLoading: () => {},
        onLayerLoad: () => {},
        onLayerError: () => {},
        onCreationError: () => {},
        onWarning: () => {},
        srs: "EPSG:3857"
    };

    componentDidMount() {
        this.valid = true;
        this.tilestoload = 0;
        this.imagestoload = 0;
        this.createLayer(
            this.props.type,
            this.props.options,
            this.props.position,
            this.props.securityToken,
            this.props.env
        );
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        const newVisibility = newProps.options && newProps.options.visibility !== false;
        this.setLayerVisibility(newVisibility);

        const newOpacity = newProps.options && newProps.options.opacity !== undefined ? newProps.options.opacity : 1.0;
        this.setLayerOpacity(newOpacity);

        if (newProps.position !== this.props.position && this.layer && this.layer.setZIndex) {
            this.layer.setZIndex(newProps.position);
        }
        if (this.props.options) {
            this.updateLayer(newProps, this.props);
        }
    }

    componentWillUnmount() {
        if (this.layer && this.props.map) {
            if (this.tileLoadEndStream$) {
                this.tileLoadEndStream$.complete();
                this.tileStopStream$.complete();
                this.imageLoadEndStream$.complete();
                this.imageStopStream$.complete();
            }
            if (this.layer.detached) {
                this.layer.remove();
            } else {
                this.props.map.removeLayer(this.layer);
            }
        }
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        Layers.removeLayer(this.props.type, this.props.options, this.props.map, this.props.mapId, this.layer);
    }

    render() {
        if (this.props.children) {
            const layer = this.layer;
            const children = layer ? React.Children.map(this.props.children, child => {
                return child ? React.cloneElement(child, {container: layer, styleName: this.props.options && this.props.options.styleName}) : null;
            }) : null;
            return (
                <React.Fragment>
                    {children}
                </React.Fragment>
            );
        }

        return Layers.renderLayer(this.props.type, this.props.options, this.props.map, this.props.mapId, this.layer);
    }

    setLayerVisibility = (visibility) => {
        var oldVisibility = this.props.options && this.props.options.visibility !== false;
        if (visibility !== oldVisibility && this.layer && this.isValid()) {
            this.layer.setVisible(visibility);
        }
    };

    setLayerOpacity = (opacity) => {
        var oldOpacity = this.props.options && this.props.options.opacity !== undefined ? this.props.options.opacity : 1.0;
        if (opacity !== oldOpacity && this.layer) {
            this.layer.setOpacity(opacity);
        }
    };

    generateOpts = (options, position, srs, securityToken, env) => {
        return assign({}, options, isNumber(position) ? {zIndex: position} : null, {
            srs,
            onError: () => {
                this.props.onCreationError(options);
            },
            securityToken,
            env
        });
    };

    createLayer = (type, options, position, securityToken, env) => {
        if (type) {
            const layerOptions = this.generateOpts(options, position, CoordinatesUtils.normalizeSRS(this.props.srs), securityToken, env);
            this.layer = Layers.createLayer(type, layerOptions, this.props.map, this.props.mapId);
            const compatible = Layers.isCompatible(type, layerOptions);
            if (this.layer && !this.layer.detached) {
                const parentMap = this.props.map;
                const mapExtent = parentMap && parentMap.getView().getProjection().getExtent();
                const layerExtent = options && options.bbox && options.bbox.bounds;
                const mapBboxPolygon = mapExtent && CoordinatesUtils.reprojectBbox(mapExtent, this.props.srs, 'EPSG:4326');
                let layerBboxPolygon = layerExtent && CoordinatesUtils.reprojectBbox(
                    CoordinatesUtils.getExtentFromNormalized(layerExtent, this.props.srs).extent,
                    'EPSG:4326'
                );
                if (layerBboxPolygon && layerBboxPolygon.length === 2 && isArray(layerBboxPolygon[1])) {
                    layerBboxPolygon = layerBboxPolygon[1];
                }

                if (mapBboxPolygon && layerBboxPolygon &&
                    !CoordinatesUtils.isBboxCompatible(CoordinatesUtils.getPolygonFromExtent(mapBboxPolygon), CoordinatesUtils.getPolygonFromExtent(layerBboxPolygon)) ||
                    !compatible) {
                    this.props.onWarning({
                        title: "warning",
                        message: "notification.incompatibleDataAndProjection",
                        action: {
                            label: "close"
                        },
                        position: "tc",
                        uid: "1"
                    });
                }
                this.addLayer(options);
            }

            if (this.layer && this.layer.get && this.layer.get('getElevation')) {
                this.props.map.set('elevationLayer', this.layer);
            }
            this.forceUpdate();
        }
    };

    updateLayer = (newProps, oldProps) => {
        // optimization to avoid to update the layer if not necessary
        if (newProps.position === oldProps.position && newProps.srs === oldProps.srs && newProps.securityToken === oldProps.securityToken ) {
            // check if options are the same, except loading
            if (newProps.options === oldProps.options) return;
            if (isEqual( omit(newProps.options, ["loading"]), omit(oldProps.options, ["loading"]) ) ) {
                return;
            }
        }
        const newLayer = Layers.updateLayer(
            this.props.type,
            this.layer,
            this.generateOpts(newProps.options, newProps.position, newProps.projection, newProps.securityToken, newProps.env),
            this.generateOpts(oldProps.options, oldProps.position, oldProps.projection, oldProps.securityToken, oldProps.env),
            this.props.map,
            this.props.mapId);
        if (newLayer) {
            this.props.map.removeLayer(this.layer);
            this.layer = newLayer;
            this.addLayer(newProps.options);
        }
    };

    addLayer = (options) => {
        if (this.isValid()) {
            this.props.map.addLayer(this.layer);

            const tileLoadEndStream$ = new Rx.Subject();
            const tileStopStream$ = new Rx.Subject();

            if (options.handleClickOnLayer) {
                this.layer.set("handleClickOnLayer", true);
            }
            this.layer.getSource().on('tileloadstart', () => {
                if (this.tilestoload === 0) {
                    this.props.onLayerLoading(options.id);
                    this.tilestoload++;
                } else {
                    this.tilestoload++;
                }
            });
            this.layer.getSource().on('tileloadend', () => {
                tileLoadEndStream$.next({type: 'tileloadend'});
                this.tilestoload--;
                if (this.tilestoload === 0) {
                    tileStopStream$.next();
                }
            });
            this.layer.getSource().on('tileloaderror', (event) => {
                tileLoadEndStream$.next({type: 'tileloaderror', event});
                this.tilestoload--;
                if (this.tilestoload === 0) {
                    tileStopStream$.next();
                }
            });

            tileLoadEndStream$
                .bufferWhen(() => tileStopStream$)
                .subscribe({
                    next: (tileEvents) => {
                        const errors = tileEvents.filter(e => e.type === 'tileloaderror');
                        if (errors.length > 0 && (options && !options.hideErrors || !options)) {
                            this.props.onLayerLoad(options.id, {error: true});
                            this.props.onLayerError(options.id, tileEvents.length, errors.length);
                        } else {
                            this.props.onLayerLoad(options.id);
                        }
                    }
                });

            this.tileLoadEndStream$ = tileLoadEndStream$;
            this.tileStopStream$ = tileStopStream$;

            const imageLoadEndStream$ = new Rx.Subject();
            const imageStopStream$ = new Rx.Subject();

            this.layer.getSource().on('imageloadstart', () => {
                if (this.imagestoload === 0) {
                    this.props.onLayerLoading(options.id);
                    this.imagestoload++;
                } else {
                    this.imagestoload++;
                }
            });
            this.layer.getSource().on('imageloadend', () => {
                this.imagestoload--;
                imageLoadEndStream$.next({type: 'imageloadend'});
                if (this.imagestoload === 0) {
                    imageStopStream$.next();
                }
            });
            this.layer.getSource().on('imageloaderror', (event) => {
                this.imagestoload--;
                imageLoadEndStream$.next({type: 'imageloaderror', event});
                if (this.imagestoload === 0) {
                    imageStopStream$.next();
                }
            });

            imageLoadEndStream$
                .bufferWhen(() => imageStopStream$)
                .subscribe({
                    next: (imageEvents) => {
                        const errors = imageEvents.filter(e => e.type === 'imageloaderror');
                        if (errors.length > 0) {
                            this.props.onLayerLoad(options.id, {error: true});
                            if (options && !options.hideErrors || !options) {
                                this.props.onLayerError(options.id, imageEvents.length, errors.length);
                            }
                        } else {
                            this.props.onLayerLoad(options.id);
                        }
                    }
                });

            this.imageLoadEndStream$ = imageLoadEndStream$;
            this.imageStopStream$ = imageStopStream$;

            if (options.refresh) {
                let counter = 0;
                this.refreshTimer = setInterval(() => {
                    this.layer.getSource().updateParams(assign({}, options.params, {_refreshCounter: counter++}));
                }, options.refresh);
            }
        }
    };

    isValid = () => {
        const valid = Layers.isValid(this.props.type, this.layer);
        this.valid = valid;
        return valid;
    };
}
