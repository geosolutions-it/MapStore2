/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Cesium from 'cesium';
import max from 'lodash/max';
import uuid from 'uuid';
import { createPolylinePrimitive } from './PrimitivesUtils';
import GeoJSONStyledFeatures from './GeoJSONStyledFeatures';
import { getStyle, layerToGeoStylerStyle } from '../VectorStyleUtils';
import { applyDefaultStyleToVectorLayer } from '../StyleUtils';

/**
 * Calculates the optimal tile level based on texel spacing
 * This function determines the appropriate tile subdivision level where billboard
 * density matches the terrain detail level.
 *
 * @param {Cesium.TilingScheme} tilingScheme - The tiling scheme (e.g., WebMercator)
 * @param {number} texelSpacing - The target texel spacing
 * @param {number} latitudeClosestToEquator - Latitude in radians
 * @param {number} tileWidth - The width of tiles in pixels (typically 512)
 * @returns {number} The calculated tile level (integer)
 *
 */
export function getLevelWithMaximumTexelSpacing(
    tilingScheme,
    texelSpacing,
    latitudeClosestToEquator,
    tileWidth
) {
    const ellipsoid = tilingScheme.ellipsoid;
    const latitudeFactor = !(tilingScheme.projection instanceof Cesium.GeographicProjection)
        ? Math.cos(latitudeClosestToEquator)
        : 1.0;
    const tilingSchemeRectangle = tilingScheme.rectangle;
    const levelZeroMaximumTexelSpacing =
        (ellipsoid.maximumRadius * tilingSchemeRectangle.width * latitudeFactor) /
        (tileWidth * tilingScheme.getNumberOfXTilesAtLevel(0));
    const twoToTheLevelPower = levelZeroMaximumTexelSpacing / texelSpacing;
    const level = Math.log(twoToTheLevelPower) / Math.log(2);
    const rounded = Math.round(level);
    return rounded | 0;
}

/**
 * Creates a tile object with coordinates and bounding rectangle.
 *
 * @param {Cesium.Cartographic} cartographic - The cartographic position (longitude, latitude, height)
 * @param {number} imageryLevel - The tile level
 * @param {Cesium.TilingScheme} tilingScheme - The tiling scheme to use
 * @returns {Object} Tile object with x, y, z coordinates, id, and rectangle
 */
export const makeTile = (cartographic, imageryLevel, tilingScheme) => {
    const coords = tilingScheme.positionToTileXY(cartographic, imageryLevel);
    if (!coords) return null;
    const id = `${coords.x}:${coords.y}:${imageryLevel}`;
    const radiansRectangle = tilingScheme.tileXYToRectangle(coords.x, coords.y, imageryLevel);
    return {
        x: coords.x,
        y: coords.y,
        z: imageryLevel,
        id,
        rectangle: Cesium.Rectangle.fromRadians(
            radiansRectangle.west,
            radiansRectangle.south,
            radiansRectangle.east,
            radiansRectangle.north
        )
    };
};

/**
 * Represents a collection of billboards for a specific tile.
 * Manages the lifecycle of billboards within a tile
 *
 * @class BillboardsTile
 */
class BillboardsTile {
    /**
     * Creates a new BillboardsTile instance.
     *
     * @param {Object} options - Configuration options
     * @param {string} options.id - Unique identifier for the tile
     * @param {Cesium.BillboardCollection} options.collection - The billboard collection to add to
     * @param {Object} options.style - Style configuration for the billboards
     * @param {string} options.msId - MapStore identifier
     * @param {number} [options.opacity=1.0] - Opacity for the billboards
     * @param {Cesium.Scene} options.map - The Cesium map instance
     * @param {boolean} [options.queryable=true] - Whether the features are queryable
     */
    constructor(options) {
        this._id = options.id;
        this._billboards = [];
        this._collection = options.collection;
        this._style = options.style;
        this._msId = options.msId;
        this._opacity = options.opacity;
        this._map = options.map;
        this._queryable = options.queryable === undefined || !!options.queryable;
    }

    /**
     * Adds features to this tile and creates billboards for them.
     * Filters for Point geometries and applies styling before creating billboards.
     *
     * @param {Array} features - Array of GeoJSON features to add
     * @returns {Promise} Promise that resolves when billboards are created
     */
    addFeatures(features) {
        return getStyle({ style: this._style }, 'cesium')
            .then((styleFunc) => styleFunc({
                map: this._map,
                opacity: this._opacity ?? 1.0,
                features: features.filter(feature => feature?.geometry?.type === 'Point').map((feature) => ({
                    ...feature,
                    positions: [[Cesium.Cartesian3.fromDegrees(feature.geometry.coordinates[0], feature.geometry.coordinates[1], feature.geometry.coordinates[2] || 0)]]
                })),
                getPreviousStyledFeature: () => {
                    return;
                }
            }).then((styledFeatures) => {
                this._billboards = styledFeatures.map(({ primitive, feature }) => {
                    const billboard = this._collection.add({
                        ...primitive?.entity?.billboard,
                        id: feature?.id,
                        position: primitive?.geometry,
                        show: false
                    });
                    billboard._msIsQueryable = () => this._queryable;
                    billboard._msGetFeatureById = () => {
                        return {
                            feature,
                            msId: this._msId
                        };
                    };
                    return billboard;
                });
            }));
    }

    /**
     * Shows all billboards in this tile.
     */
    show() {
        this._billboards.forEach(billboard => {
            billboard.show = true;
        });
    }

    /**
     * Hides all billboards in this tile.
     */
    hide() {
        this._billboards.forEach(billboard => {
            billboard.show = false;
        });
    }

    setOpacity(opacity) {
        this._opacity = opacity;
    }

    destroy() {
        // BillboardsTile billboards are owned by the shared BillboardCollection
        // which is cleaned up by the parent TiledBillboardCollection.destroy()
    }
}

/**
 * Represents a tile that renders features of any geometry type
 * using GeoJSONStyledFeatures. Each tile owns its own rendering
 * primitives so show/hide is achieved by toggling visibility.
 *
 * @class FeaturesTile
 */
class FeaturesTile {
    constructor(options) {
        this._id = options.id;
        this._map = options.map;
        this._msId = options.msId;
        this._opacity = options.opacity;
        this._queryable = options.queryable;
        this._style = options.style;
        this._visible = true;
        this._features = [];
        this._styledFeatures = null;
    }

    addFeatures(features, styleOptions) {
        this._features = features;
        if (!features || features.length === 0) {
            return Promise.resolve();
        }
        this._styledFeatures = new GeoJSONStyledFeatures({
            features,
            id: `${this._msId}:tile:${this._id}`,
            map: this._map,
            opacity: this._opacity,
            queryable: this._queryable
        });
        return layerToGeoStylerStyle(styleOptions)
            .then((style) => getStyle(applyDefaultStyleToVectorLayer({
                ...styleOptions,
                features,
                style
            }), 'cesium'))
            .then((styleFunc) => {
                if (this._styledFeatures) {
                    this._styledFeatures.setStyleFunction(styleFunc);
                }
            });
    }

    show() {
        if (!this._visible && this._styledFeatures) {
            this._styledFeatures._primitives.show = true;
            this._styledFeatures._dataSource.show = true;
            this._visible = true;
        }
    }

    hide() {
        if (this._visible && this._styledFeatures) {
            this._styledFeatures._primitives.show = false;
            this._styledFeatures._dataSource.show = false;
            this._visible = false;
        }
    }

    setOpacity(opacity) {
        this._opacity = opacity;
        if (this._styledFeatures) {
            this._styledFeatures.setOpacity(opacity);
        }
    }

    destroy() {
        if (this._styledFeatures) {
            this._styledFeatures.destroy();
            this._styledFeatures = null;
        }
        this._features = [];
    }
}

/**
 * A tiled billboard collection that manages billboards across multiple tile levels.
 * This class provides efficient loading and rendering of billboards by organizing
 * them into tiles and only loading tiles that are currently visible.
 * Supports both billboard-based rendering (points) via `tileType: 'billboard'`
 * and full-geometry rendering (polygons, polylines, points) via `tileType: 'feature'` (default).
 *
 * @class TiledBillboardCollection
 * @param {Object} options - Configuration options
 * @param {Cesium.Scene} options.map - The Cesium map instance
 * @param {string} [options.tileType='feature'] - Tile rendering strategy: 'billboard' for points-only
 *                                                using a shared BillboardCollection,
 *                                                or 'feature' for all geometry types using GeoJSONStyledFeatures per tile
 * @param {boolean} [options.debugTiles=false] - Whether to show tile boundaries for debugging
 * @param {number} [options.tileWidth=512] - Width of tiles in pixels
 * @param {number} [options.minimumLevel=0] - Minimum terrain tile level at which billboards are displayed.
 *                                             Billboards will only be shown when the current terrain tile level
 *                                             is greater than or equal to this value. Higher values mean
 *                                             billboards appear at higher terrain detail levels only.
 * @param {number} [options.maximumLevel=18] - Maximum terrain tile level at which billboards are displayed.
 *                                             Billboards will not be shown when the current terrain tile level
 *                                             exceeds this value. Lower values mean billboards stop appearing
 *                                             at lower terrain detail levels.
 * @param {Function} [options.loadTile] - Function to load tile data, should return Promise with features
 * @param {Object} [options.style] - Style configuration for billboards
 * @param {Object} [options.styleOptions] - Additional style options (used by 'feature' tileType)
 * @param {string} [options.msId] - MapStore identifier
 * @param {number} [options.opacity=1.0] - Opacity for billboards
 * @param {boolean} [options.queryable=true] - Whether features are queryable
 *
 */
function TiledBillboardCollection(options) {

    if (!Cesium.defined(options)) {
        throw new Cesium.DeveloperError("options is required.");
    }

    this._map = options.map;
    this._tileType = options.tileType || 'feature';
    this._debugTiles = options.debugTiles ?? false;
    this._tileWidth = options.tileWidth ?? 512;
    this._minimumLevel = options.minimumLevel ?? 0;
    this._maximumLevel = options.maximumLevel ?? 18;
    this._loadTile = options.loadTile ? options.loadTile : () => Promise.resolve({ features: [] });
    this._queryable = options.queryable === undefined || !!options.queryable;

    this._tilingScheme = new Cesium.WebMercatorTilingScheme();
    this._globe = this._map?.scene?.globe;

    this._staticPrimitivesCollection = new Cesium.PrimitiveCollection({ destroyPrimitives: true });
    this._map.scene.primitives.add(this._staticPrimitivesCollection);

    if (this._tileType === 'billboard') {
        this._staticBillboardCollection = new Cesium.BillboardCollection({ scene: this._map.scene });
        this._map.scene.primitives.add(this._staticBillboardCollection);
    }

    this._tileCache = {};
    this._prevTiles = [];

    this._opacity = options.opacity;
    this._msId = options.msId;
    this._style = options.style;
    this._styleOptions = options.styleOptions || {};

    const maxNumberOfTile = 32;
    let timeout;
    this._update = () => {

        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        if (!this._map.terrainProvider) return;
        timeout = setTimeout(() => {
            this._callId = uuid();
            if (!this._removed) {
                // _tilesToRender is a private property not exposed by the API
                // https://community.cesium.com/t/does-quadtreeprimitive-still-support-in-cesium-1-32/5422/4
                const tilesToRender = [...(this._globe?._surface?._tilesToRender || [])];
                const maximumLevel = max(tilesToRender.map(tileToRender => tileToRender.level));

                let target = this._map.scene.globe.pick(new Cesium.Ray(this._map.camera.position, this._map.camera.direction), this._map.scene);
                let tiles = [];
                if (target) {
                    const center = Cesium.Cartographic.fromCartesian(
                        new Cesium.Cartesian3(target.x, target.y, target.z)
                    );
                    const errorRatio = 1.0;
                    // When terrain tiles haven't loaded yet, fall back to minimumLevel
                    let imageryLevel;
                    if (maximumLevel !== undefined) {
                        const targetGeometricError = errorRatio * this._map?.terrainProvider?.getLevelMaximumGeometricError(maximumLevel);
                        imageryLevel = getLevelWithMaximumTexelSpacing(
                            this._tilingScheme,
                            targetGeometricError,
                            center.latitude,
                            this._tileWidth
                        );
                    } else {
                        imageryLevel = this._minimumLevel;
                    }
                    if (imageryLevel > this._maximumLevel) {
                        imageryLevel = this._maximumLevel;
                    }

                    if (imageryLevel >= this._minimumLevel) {
                        const viewRectangle = this._map.camera.computeViewRectangle();
                        const topLeft = Cesium.Cartographic.fromRadians(viewRectangle.west, viewRectangle.north, 0);
                        const bottomRight = Cesium.Cartographic.fromRadians(viewRectangle.east, viewRectangle.south, 0);

                        const centerTile = makeTile(center, imageryLevel, this._tilingScheme);
                        const topLeftTile = makeTile(topLeft, imageryLevel, this._tilingScheme);
                        const bottomRightTile = makeTile(bottomRight, imageryLevel, this._tilingScheme);

                        if (!centerTile || !topLeftTile || !bottomRightTile) {
                            return;
                        }

                        for (let y = topLeftTile.y; y < bottomRightTile.y + 1; y++) {
                            for (let x = topLeftTile.x; x < bottomRightTile.x + 1; x++) {
                                const id = `${x}:${y}:${imageryLevel}`;
                                const radiansRectangle = this._tilingScheme.tileXYToRectangle(x, y, imageryLevel);
                                tiles.push({
                                    callId: this._callId,
                                    distance: Cesium.Cartesian2.distance(new Cesium.Cartesian2(centerTile.x, centerTile.y), new Cesium.Cartesian2(x, y)),
                                    id,
                                    x,
                                    y,
                                    z: imageryLevel,
                                    rectangle: Cesium.Rectangle.fromRadians(
                                        radiansRectangle.west,
                                        radiansRectangle.south,
                                        radiansRectangle.east,
                                        radiansRectangle.north
                                    )
                                });
                            }
                        }
                        tiles = [...tiles].sort((a, b) => a.distance - b.distance).filter((tile, idx) => idx < maxNumberOfTile);
                    }
                }

                this._staticPrimitivesCollection.removeAll();

                this._prevTiles.forEach(prevTile => {
                    if (this._tileCache[prevTile.id]) {
                        const visible = tiles.some(tile => tile.id === prevTile.id);
                        if (!visible ) {
                            this._tileCache[prevTile.id].hide();
                        }
                    }
                });

                this._map.scene.requestRender();

                tiles.forEach(tile => {

                    if (this._debugTiles) {
                        this._staticPrimitivesCollection.add(
                            createPolylinePrimitive({
                                color: '#ff0000',
                                opacity: 0.5,
                                clampToGround: true,
                                coordinates: [
                                    Cesium.Cartographic.toCartesian(new Cesium.Cartographic(tile.rectangle.west, tile.rectangle.south)),
                                    Cesium.Cartographic.toCartesian(new Cesium.Cartographic(tile.rectangle.west, tile.rectangle.north)),
                                    Cesium.Cartographic.toCartesian(new Cesium.Cartographic(tile.rectangle.east, tile.rectangle.north)),
                                    Cesium.Cartographic.toCartesian(new Cesium.Cartographic(tile.rectangle.east, tile.rectangle.south)),
                                    Cesium.Cartographic.toCartesian(new Cesium.Cartographic(tile.rectangle.west, tile.rectangle.south))
                                ]
                            })
                        );
                    }
                    if (!this._tileCache[tile.id]) {
                        this._tileCache[tile.id] = this._createTile(tile);
                        this._loadTile(tile)
                            .then(({ features }) =>
                                (!this._removed && this._tileCache[tile.id])
                                    ? (this._tileType === 'billboard'
                                        ? this._tileCache[tile.id].addFeatures(features)
                                        : this._tileCache[tile.id].addFeatures(features, this._styleOptions))
                                    : undefined
                            )
                            .then(() => {
                                if (!this._removed && this._tileCache[tile.id]) {
                                    if (this._tileType === 'billboard') {
                                        if (this._callId === tile.callId) {
                                            this._tileCache[tile.id].show();
                                        }
                                    }
                                    this._map.scene.requestRender();
                                }
                            })
                            .catch(() => {
                                if (!this._removed && this._tileCache[tile.id]) {
                                    this._tileCache[tile.id].destroy();
                                    delete this._tileCache[tile.id];
                                }
                            });
                    } else {
                        this._tileCache[tile.id].show();
                        this._map.scene.requestRender();
                    }
                });
                this._prevTiles = [...tiles];
            }
        }, 300);
    };

    this._map.camera.moveEnd.addEventListener(this._update);
}

TiledBillboardCollection.prototype._createTile = function(tile) {
    if (this._tileType === 'billboard') {
        return new BillboardsTile({
            id: tile.id,
            collection: this._staticBillboardCollection,
            style: this._style,
            msId: this._msId,
            map: this._map,
            opacity: this._opacity,
            queryable: this._queryable
        });
    }
    return new FeaturesTile({
        id: tile.id,
        msId: this._msId,
        map: this._map,
        opacity: this._opacity,
        queryable: this._queryable,
        style: this._style
    });
};

/**
 * Destroys the tiled billboard collection and cleans up resources.
 * Removes all billboards, clears the tile cache, and removes event listeners.
 */
TiledBillboardCollection.prototype.destroy = function() {
    this._removed = true;
    Object.keys(this._tileCache).forEach(tileId => {
        if (this._tileCache[tileId]) {
            this._tileCache[tileId].destroy();
        }
    });
    this._tileCache = {};
    this._prevTiles = [];
    this._map.camera.moveEnd.removeEventListener(this._update);
    this._staticPrimitivesCollection.removeAll();
    this._map.scene.primitives.remove(this._staticPrimitivesCollection);
    if (this._staticBillboardCollection) {
        this._staticBillboardCollection.removeAll();
        this._map.scene.primitives.remove(this._staticBillboardCollection);
    }
};

/**
 * Updates opacity for all cached tiles.
 * For feature tiles, delegates to GeoJSONStyledFeatures.setOpacity.
 * For billboard tiles, stores new opacity for subsequent style applications.
 * @param {number} opacity - The new opacity value (0.0 to 1.0)
 */
TiledBillboardCollection.prototype.setOpacity = function(opacity) {
    this._opacity = opacity;
    Object.keys(this._tileCache).forEach(tileId => {
        const tile = this._tileCache[tileId];
        if (tile) {
            tile.setOpacity(opacity);
        }
    });
    if (this._tileType === 'billboard') {
        this.setStyleFunction(this._style);
    }
};

/**
 * Sets a new style function for the billboards.
 * Updates the style configuration and applies new styling to existing billboards.
 * For billboard tiles, updates billboard properties; for feature tiles,
 * re-applies styling to GeoJSONStyledFeatures in each cached tile.
 * Note: this is tested programatically, currenly not used anywhere. As tile starts to support with serverType other than 'no-vendor', can be used.
 * @param {Object} newStyle - The new style configuration to apply
 *
 */
TiledBillboardCollection.prototype.setStyleFunction = function(newStyle) {
    // Update the stored style
    this._style = newStyle;
    this._styleOptions = { ...this._styleOptions, style: newStyle };

    // Update existing billboards with new style
    Object.keys(this._tileCache).forEach(tileId => {
        const tile = this._tileCache[tileId];
        if (!tile) return;

        if (this._tileType === 'billboard' && tile._billboards) {
            // Update the style for this tile
            tile._style = newStyle;

            tile._billboards.forEach((billboard) => {

                if (billboard._msGetFeatureById) {
                    const { feature } = billboard._msGetFeatureById();
                    if (feature) {
                        // Apply new style to the billboard
                        getStyle({ style: newStyle }, 'cesium')
                            .then((styleFunc) => {
                                return styleFunc({
                                    map: this._map,
                                    opacity: tile._opacity ?? 1.0,
                                    features: [{
                                        ...feature,
                                        positions: [[billboard.position]]
                                    }],
                                    getPreviousStyledFeature: () => {
                                        return;
                                    }
                                });
                            })
                            .then((styledFeatures) => {
                                if (styledFeatures && styledFeatures.length > 0) {
                                    // Apply style to all styled features, not just the first one
                                    styledFeatures.forEach((styledFeature) => {
                                        if (styledFeature && styledFeature.primitive) {
                                            const newBillboardProps = styledFeature.primitive?.entity?.billboard;
                                            if (newBillboardProps) {
                                                // Update billboard properties with new style
                                                Object.assign(billboard, newBillboardProps);
                                            }
                                        }
                                    });
                                }
                            })
                            .catch((error) => {
                                console.warn('Failed to update billboard style:', error);
                            });
                    }
                }
            });
        } else if (this._tileType === 'feature' && tile._styledFeatures) {
            tile._style = newStyle;
            layerToGeoStylerStyle({ ...this._styleOptions, style: newStyle })
                .then((style) => getStyle(applyDefaultStyleToVectorLayer({
                    ...this._styleOptions,
                    features: tile._features,
                    style
                }), 'cesium'))
                .then((styleFunc) => {
                    if (tile._styledFeatures) {
                        tile._styledFeatures.setStyleFunction(styleFunc);
                    }
                })
                .catch((error) => {
                    console.warn('Failed to update feature tile style:', error);
                });
        }
    });
};


TiledBillboardCollection.prototype.load = function() {
    this._update();
};


export default TiledBillboardCollection;
