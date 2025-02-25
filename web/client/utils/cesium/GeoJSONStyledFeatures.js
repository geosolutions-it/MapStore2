import * as Cesium from 'cesium';
import turfFlatten from '@turf/flatten';
import omit from 'lodash/omit';
import isArray from 'lodash/isArray';
import uuid from 'uuid/v1';

/**
 * validate the coordinates and ensure:
 * - values inside are not nested arrays
 * - the current coordinate are not a duplication of the previous one
 * @param {number[]} coords array of coordinates [longitude, latitude, height]
 * @param {number[]} prevCoords array of coordinates [longitude, latitude, height]
 * @returns the coordinates if valid and null if invalid
 */
const validateCoordinatesValue = (coords, prevCoords) => {
    if (!isArray(coords[0]) && !isArray(coords[1]) && !isArray(coords[2])) {
        // remove duplicated points
        // to avoid normalization errors
        return prevCoords && (prevCoords[0] === coords[0] && prevCoords[1] === coords[1] && prevCoords[2] === coords[2])
            ? null
            : coords;
    }
    return null;
};

const featureToCartesianPositions = (feature) => {
    if (feature.geometry.type === 'Point') {
        const validatedCoords = validateCoordinatesValue([
            feature.geometry.coordinates[0],
            feature.geometry.coordinates[1],
            feature.geometry.coordinates[2] || 0
        ]);
        return validatedCoords ? [[Cesium.Cartesian3.fromDegrees(
            validatedCoords[0],
            validatedCoords[1],
            validatedCoords[2] || 0
        )]] : null;
    }
    if (feature.geometry.type === 'LineString') {
        const positions = feature.geometry.coordinates.map((coords, idx) =>
            validateCoordinatesValue(coords, feature.geometry.coordinates[idx - 1])
                ? Cesium.Cartesian3.fromDegrees(coords[0], coords[1], coords[2])
                : null
        ).filter(coords => coords !== null);
        return positions.length > 1 ? [positions] : null;
    }
    if (feature.geometry.type === 'Polygon') {
        const positions = feature.geometry.coordinates.map(ring => {
            const ringPositions = ring.map((coords, idx) =>
                validateCoordinatesValue(coords, ring[idx - 1])
                    ? Cesium.Cartesian3.fromDegrees(coords[0], coords[1], coords[2])
                    : null
            ).filter(coords => coords !== null);
            return ringPositions.length > 2 ? ringPositions : null;
        }).filter(ring => ring !== null);
        return positions.length > 0 ? positions : null;
    }
    return null;
};
/**
 * Class to manage styles for layer with an array of features
 * @param {string} options.id layer identifier
 * @param {object} options.map a Cesium map instance
 * @param {number} options.opacity opacity of the layer
 * @param {boolean} options.queryable if false the features will not be queryable, default is true
 * @param {array} options.features array of valid geojson features
 * @param {boolean} options.mergePolygonFeatures if true will merge all polygons with similar styles in a single primitive. This could help to reduce the draw call to the render
 * @param {func} featureFilter a function to filter feature, it receives a GeoJSON feature as argument and it must return a boolean
 */
class GeoJSONStyledFeatures {
    constructor(options = {}) {
        this._msId = options.id;
        this._dataSource = new Cesium.CustomDataSource(options.id);
        this._primitives = new Cesium.PrimitiveCollection({ destroyPrimitives: true });
        this._map = options.map;
        if (this._map) {
            this._map.scene.primitives.add(this._primitives);
            this._map.dataSources.add(this._dataSource);
        }
        this._styledFeatures = [];
        this._entities = [];
        this._opacity = options.opacity ?? 1;
        this._queryable = options.queryable === undefined ? true : !!options.queryable;
        this._mergePolygonFeatures = !!options?.mergePolygonFeatures;
        this._featureFilter = options.featureFilter;
        this._dataSource.entities.collectionChanged.addEventListener(() => {
            setTimeout(() => this._map.scene.requestRender(), 300);
        });
        // internal key to associate features with original features
        this._uuidKey = '__ms_uuid_key__' + uuid();
        // needs to be run after this._uuidKey
        this.setFeatures(options.features);
    }
    _addCustomProperties(obj) {
        obj._msIsQueryable = () => this._queryable;
        obj._msGetFeatureById = (id) => {
            const _id = id instanceof Cesium.Entity ? id.id : id;
            const [featureId] = _id.split(':');
            const feature = this._features.find((f) => f.id === featureId);
            const originalFeature = this._originalFeatures.find((f) => f.properties[this._uuidKey] === feature.properties[this._uuidKey]) || {};
            const { properties } = originalFeature;
            return {
                feature: {
                    ...originalFeature,
                    properties: omit(properties, [this._uuidKey])
                },
                msId: this._msId
            };
        };
    }
    _getEntityOptions(primitive) {
        const { entity, geometry, orientation, minimumHeights, maximumHeights } = primitive;
        if (entity.polygon) {
            return {
                polygon: {
                    ...entity.polygon,
                    hierarchy: new Cesium.ConstantProperty(new Cesium.PolygonHierarchy(
                        geometry[0].map(cartesian => cartesian.clone()),
                        geometry
                            .filter((hole, idx) => idx > 0)
                            .map(hole => new Cesium.PolygonHierarchy(hole.map((cartesian) => cartesian.clone())))
                    ))
                }
            };
        }
        if (entity.wall) {
            return {
                wall: {
                    ...entity.wall,
                    positions: geometry[0],
                    minimumHeights: minimumHeights?.[0],
                    maximumHeights: maximumHeights?.[0]
                }
            };
        }
        if (entity.polyline) {
            return {
                polyline: {
                    ...entity.polyline,
                    positions: geometry[0]
                }
            };
        }
        if (entity.polylineVolume) {
            return {
                polylineVolume: {
                    ...entity.polylineVolume,
                    positions: geometry[0]
                }
            };
        }
        return {
            ...entity,
            ...(orientation && { orientation }),
            position: geometry
        };
    }
    _updatePointEntity(primitive, previous) {
        if (previous && (primitive.entity.billboard || primitive.entity.label || primitive.entity.model)) {
            const entity = previous.entity;
            if (primitive.orientation) {
                entity.orientation = primitive.orientation;
            }
            if (primitive.geometry) {
                entity.position = primitive.geometry.clone();
            }
            const graphicKey = Object.keys(primitive.entity)[0];
            // it's better to recreate the point entity in case height reference change
            if (entity?.[graphicKey]?.heightReference?.getValue() !== primitive?.entity?.[graphicKey]?.heightReference) {
                return null;
            }
            const propertyKeys = Object.keys(primitive.entity[graphicKey]);
            propertyKeys.forEach((propertyKey) => {
                entity[graphicKey][propertyKey] = primitive.entity[graphicKey][propertyKey];
            });
            return previous;
        }
        return null;
    }
    _filterEntities({ primitive }) {
        return (this._mergePolygonFeatures && primitive?.entity?.polygon) ? false : !!primitive.entity;
    }
    _updateEntities(newStyledFeatures, forceUpdate) {
        const previousEntities = this._styledFeatures.filter((feature) => this._filterEntities(feature));
        const entities = newStyledFeatures.filter((feature) => this._filterEntities(feature));
        const previousIds = previousEntities.map(({ id }) => id);
        const currentIds = entities.map(({ id }) => id);
        const removeIds = previousIds
            .filter(id => !currentIds.includes(id));
        const entitiesToRemove = removeIds.map((id) => this._entities.find(entry => entry.id === id));
        entitiesToRemove.forEach(({ entity }) => {
            this._dataSource.entities.remove(entity);
        });
        const newEntities = entities.map(({ id, action, primitive }) => {
            const previous = this._entities.find(entry => entry.id === id);
            if (!forceUpdate && action === 'none') {
                return previous;
            }
            const updatedPoint = this._updatePointEntity(primitive, previous);
            if (updatedPoint) {
                return updatedPoint;
            }
            if (previous) {
                this._dataSource.entities.remove(previous);
            }
            const entity = this._dataSource.entities.add({
                id,
                ...this._getEntityOptions(primitive)
            });
            this._addCustomProperties(entity);
            return { id, entity };
        });
        this._entities = newEntities;
    }
    _updatePolygonPrimitive(newStyledFeatures, forceUpdate) {
        const previousPolygonPrimitives = this._styledFeatures.filter(({ primitive }) => primitive.type === 'polygon' && !primitive.clampToGround);
        const polygonPrimitives = newStyledFeatures.filter(({ primitive }) => primitive.type === 'polygon' && !primitive.clampToGround);
        const polygonPrimitivesIds = polygonPrimitives.map(({ id }) => id);
        const removedPrimitives = previousPolygonPrimitives.filter(({ id }) => !polygonPrimitivesIds.includes(id));
        const noActions = !removedPrimitives.length && polygonPrimitives.length ? polygonPrimitives.every(({ action }) => !forceUpdate && action === 'none') : false;
        if (noActions) {
            return;
        }
        if (this?._polygonPrimitives?.length) {
            this._polygonPrimitives.forEach((primitive) => {
                this._primitives.remove(primitive);
            });
            this._polygonPrimitives = [];
        }
        if (polygonPrimitives.length <= 0) {
            return;
        }
        const groupByTranslucencyAndExtrusion = polygonPrimitives.reduce((acc, options) => {
            const { primitive } = options;
            const { material, extrudedHeight } = primitive?.entity?.polygon || {};
            const key = `t:${material.alpha === 1},e:${extrudedHeight !== undefined ? 'true' : 'false'}`;
            return {
                ...acc,
                [key]: [...(acc[key] || []), options]
            };
        }, {});
        this._polygonPrimitives = Object.keys(groupByTranslucencyAndExtrusion).map((key) => {
            const styledFeatures = groupByTranslucencyAndExtrusion[key];
            const cesiumPrimitive = new Cesium.Primitive({
                geometryInstances: styledFeatures.map(({ primitive, id }) => {
                    const polygon = primitive?.entity?.polygon || {};
                    return new Cesium.GeometryInstance({
                        geometry: new Cesium.PolygonGeometry({
                            polygonHierarchy: new Cesium.PolygonHierarchy(
                                primitive.geometry[0].map(cartesian => cartesian.clone()),
                                primitive.geometry
                                    .filter((hole, idx) => idx > 0)
                                    .map(hole => new Cesium.PolygonHierarchy(hole.map((cartesian) => cartesian.clone())))
                            ),
                            arcType: polygon.arcType,
                            perPositionHeight: polygon.height !== undefined ? false : polygon.perPositionHeight,
                            ...(polygon.height !== undefined && { height: polygon.height }),
                            ...(polygon.extrudedHeight !== undefined && { extrudedHeight: polygon.extrudedHeight }),
                            vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
                        }),
                        id,
                        attributes: {
                            color: new Cesium.ColorGeometryInstanceAttribute(
                                polygon.material.red,
                                polygon.material.green,
                                polygon.material.blue,
                                polygon.material.alpha
                            ),
                            // allow to click on multiple instances
                            show: new Cesium.ShowGeometryInstanceAttribute(true)
                        }
                    });
                }),
                appearance: new Cesium.PerInstanceColorAppearance({
                    flat: styledFeatures[0].primitive?.entity?.polygon?.extrudedHeight === undefined,
                    translucent: styledFeatures[0].primitive?.entity?.polygon?.material?.alpha !== 1
                }),
                asynchronous: true
            });
            this._addCustomProperties(cesiumPrimitive);
            return cesiumPrimitive;
        });
        this._polygonPrimitives.forEach((primitive) => {
            this._primitives.add(primitive);
        });
    }
    _updateGroundPolygonPrimitive(newStyledFeatures, forceUpdate) {
        const previousGroundPolygonPrimitives = this._styledFeatures.filter(({ primitive }) => primitive.type === 'polygon' && !!primitive.clampToGround);
        const groundPolygonPrimitives = newStyledFeatures.filter(({ primitive }) => primitive.type === 'polygon' && !!primitive.clampToGround);
        const groundPolygonPrimitivesIds = groundPolygonPrimitives.map(({ id }) => id);
        const removedPrimitives = previousGroundPolygonPrimitives.filter(({ id }) => !groundPolygonPrimitivesIds.includes(id));
        const noActions = !removedPrimitives.length && groundPolygonPrimitives.length ? groundPolygonPrimitives.every(({ action }) => !forceUpdate && action === 'none') : false;
        if (noActions) {
            return;
        }
        if (this?._groundPolygonPrimitives?.length) {
            this._groundPolygonPrimitives.forEach((primitive) => {
                this._primitives.remove(primitive);
            });
            this._groundPolygonPrimitives = [];
        }
        if (groundPolygonPrimitives.length <= 0) {
            return;
        }
        const groupByColorAndClassification = groundPolygonPrimitives.reduce((acc, options) => {
            const { primitive } = options;
            const { material, classificationType } = primitive?.entity?.polygon || {};
            const key = `r:${material.red},g:${material.green},b:${material.blue},a:${material.alpha},c:${classificationType}`;
            return {
                ...acc,
                [key]: [...(acc[key] || []), options]
            };
        }, {});

        this._groundPolygonPrimitives = Object.keys(groupByColorAndClassification).map((key) => {
            const styledFeatures = groupByColorAndClassification[key];
            const cesiumPrimitive = new Cesium.GroundPrimitive({
                classificationType: styledFeatures[0].primitive?.entity?.polygon?.classificationType,
                geometryInstances: styledFeatures.map(({ primitive, id }) => {
                    const polygon = primitive?.entity?.polygon || {};
                    return new Cesium.GeometryInstance({
                        geometry: new Cesium.PolygonGeometry({
                            polygonHierarchy: new Cesium.PolygonHierarchy(
                                primitive.geometry[0].map(cartesian => cartesian.clone()),
                                primitive.geometry
                                    .filter((hole, idx) => idx > 0)
                                    .map(hole => new Cesium.PolygonHierarchy(hole.map((cartesian) => cartesian.clone())))
                            ),
                            arcType: polygon.arcType,
                            perPositionHeight: polygon.perPositionHeight
                        }),
                        id,
                        attributes: {
                            color: new Cesium.ColorGeometryInstanceAttribute(
                                polygon.material.red,
                                polygon.material.green,
                                polygon.material.blue,
                                polygon.material.alpha
                            ),
                            // allow to click on multiple instances
                            show: new Cesium.ShowGeometryInstanceAttribute(true)
                        }
                    });
                }),
                appearance: new Cesium.PerInstanceColorAppearance({
                    flat: true,
                    translucent: styledFeatures[0].primitive?.entity?.polygon?.material?.alpha !== 1
                }),
                asynchronous: true
            });

            this._addCustomProperties(cesiumPrimitive);
            return cesiumPrimitive;
        });

        this._groundPolygonPrimitives.forEach((primitive) => {
            this._primitives.add(primitive);
        });
    }
    _update(forceUpdate) {
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
        this._timeout = setTimeout(() => {
            this._timeout = undefined;
            if (this._styleFunction) {
                this._styleFunction({
                    map: this._map,
                    opacity: this._opacity,
                    features: this._featureFilter ? this._features.filter(this._featureFilter) : this._features,
                    getPreviousStyledFeature: (styledFeature) => {
                        const editingStyleFeature = this._styledFeatures.find(({ id }) => id === styledFeature.id);
                        return editingStyleFeature;
                    }
                })
                    .then((styledFeatures) => {
                        this._updateEntities(styledFeatures, forceUpdate);
                        if (this._mergePolygonFeatures) {
                            this._updatePolygonPrimitive(styledFeatures, forceUpdate);
                            this._updateGroundPolygonPrimitive(styledFeatures, forceUpdate);
                        }
                        this._styledFeatures = [...styledFeatures];
                        setTimeout(() => this._map.scene.requestRender());
                    });
            }
        }, 300);
    }
    setFeatures(newFeatures) {
        this._originalFeatures = (newFeatures ?? []).map((feature) => {
            return {
                ...feature,
                properties: {
                    ...feature.properties,
                    [this._uuidKey]: feature?.properties?.[this._uuidKey] ?? uuid()
                }
            };
        });
        const { features } = turfFlatten({ type: 'FeatureCollection', features: this._originalFeatures });
        this._features = features.filter(feature => feature.geometry)
            .map((feature) => {
                return {
                    ...feature,
                    id: uuid(),
                    positions: featureToCartesianPositions(feature)
                };
            }).filter(feature => feature.positions !== null);

    }
    setOpacity(opacity) {
        const previousOpacity = this._opacity;
        this._opacity = opacity;
        this._update(previousOpacity !== opacity);
    }
    setStyleFunction(styleFunction) {
        this._styleFunction = styleFunction;
        this._update();
    }
    setFeatureFilter(featureFilter) {
        this._featureFilter = featureFilter;
        this._update();
    }
    destroy() {
        this._primitives.removeAll();
        this._map.scene.primitives.remove(this._primitives);
        this._dataSource.entities.removeAll();
        this._map.dataSources.remove(this._dataSource);
    }
}

GeoJSONStyledFeatures.featureToCartesianPositions = featureToCartesianPositions;

export default GeoJSONStyledFeatures;
