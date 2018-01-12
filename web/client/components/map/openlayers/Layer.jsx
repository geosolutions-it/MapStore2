const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var Layers = require('../../../utils/openlayers/Layers');
var CoordinatesUtils = require('../../../utils/CoordinatesUtils');
var assign = require('object-assign');
const _ = require('lodash');
const Rx = require('rxjs');

class OpenlayersLayer extends React.Component {
    static propTypes = {
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
        securityToken: PropTypes.string
    };

    static defaultProps = {
        observables: [],
        onLayerLoading: () => {},
        onLayerLoad: () => {},
        onLayerError: () => {},
        onCreationError: () => {}
    };

    componentDidMount() {
        this.valid = true;
        this.tilestoload = 0;
        this.imagestoload = 0;
        this.createLayer(this.props.type, this.props.options, this.props.position, this.props.securityToken);
    }

    componentWillReceiveProps(newProps) {
        const newVisibility = newProps.options && newProps.options.visibility !== false;
        this.setLayerVisibility(newVisibility);

        const newOpacity = newProps.options && newProps.options.opacity !== undefined ? newProps.options.opacity : 1.0;
        this.setLayerOpacity(newOpacity);

        if (newProps.position !== this.props.position && this.layer.setZIndex) {
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
                <noscript>
                    {children}
                </noscript>
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

    generateOpts = (options, position, srs, securityToken) => {
        return assign({}, options, _.isNumber(position) ? {zIndex: position} : null, {
            srs,
            onError: () => {
                this.props.onCreationError(options);
            },
            securityToken
        });
    };

    createLayer = (type, options, position, securityToken) => {
        if (type) {
            const layerOptions = this.generateOpts(options, position, CoordinatesUtils.normalizeSRS(this.props.srs), securityToken);
            this.layer = Layers.createLayer(type, layerOptions, this.props.map, this.props.mapId);
            if (this.layer && !this.layer.detached) {
                this.addLayer(options);
            }
            this.forceUpdate();
        }
    };

    updateLayer = (newProps, oldProps) => {
        // optimization to avoid to update the layer if not necessary
        if (newProps.position === oldProps.position && newProps.srs === oldProps.srs && newProps.securityToken === oldProps.securityToken ) {
            // check if options are the same, except loading
            if (newProps.options === oldProps.options) return;
            if (_.isEqual( _.omit(newProps.options, ["loading"]), _.omit(oldProps.options, ["loading"]) ) ) {
                return;
            }
        }
        const newLayer = Layers.updateLayer(
            this.props.type,
            this.layer,
            this.generateOpts(newProps.options, newProps.position, newProps.projection, newProps.securityToken),
            this.generateOpts(oldProps.options, oldProps.position, oldProps.projection, oldProps.securityToken),
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
                        if (errors.length > 0) {
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
                            this.props.onLayerError(options.id, imageEvents.length, errors.length);
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

module.exports = OpenlayersLayer;
