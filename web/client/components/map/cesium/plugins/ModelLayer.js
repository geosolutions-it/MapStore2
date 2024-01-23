/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Cesium from 'cesium';
import isEqual from 'lodash/isEqual';
import Layers from '../../../../utils/cesium/Layers';
import { ifcDataToJSON, getWebIFC } from '../../../../api/Model';     // todo: change path to MODEL

const updatePrimitivesPosition = (primitives, center) => {
    for (let i = 0; i < primitives.length; i++) {
        const primitive = primitives.get(i);
        primitive.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
            // review the center properties
            // based on other existing layer parameters
            Cesium.Cartesian3.fromDegrees(...(center ? [
                center[0],
                center[1],
                center[2]
            ] : [0, 0, 0]))
        );
    }
};
const updatePrimitivesVisibility = (primitives, visibilityOption) => {
    for (let i = 0; i < primitives.length; i++) {
        const primitive = primitives.get(i);
        primitive.show = visibilityOption;
    }
};
const getGeometryInstances = ({
    meshes
}) => {
    return meshes
        .map((mesh) => mesh.geometry.map(({
            color,
            positions,
            normals,
            indices,
            flatTransformation
        }) => {
            const rotationMatrix = Cesium.Matrix4.fromTranslationQuaternionRotationScale(
                new Cesium.Cartesian3(0.0, 0.0, 0.0),       // 0,0
                Cesium.Quaternion.fromAxisAngle(            // 90 deg
                    new Cesium.Cartesian3(1.0, 0.0, 0.0),
                    Math.PI / 2
                ),
                new Cesium.Cartesian3(1.0, 1.0, 1.0),
                new Cesium.Matrix4()
            );
            const transformedPositions = positions;
            const transformedNormals = normals;
            return new Cesium.GeometryInstance({
                id: mesh.id,
                modelMatrix: Cesium.Matrix4.multiply(
                    rotationMatrix,
                    flatTransformation,
                    new Cesium.Matrix4()
                ),
                geometry: new Cesium.Geometry({
                    attributes: {
                        position: new Cesium.GeometryAttribute({
                            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                            componentsPerAttribute: 3,
                            values: new Float64Array(transformedPositions)
                        }),
                        normal: new Cesium.GeometryAttribute({
                            componentDatatype: Cesium.ComponentDatatype.FLOAT,
                            componentsPerAttribute: 3,
                            values: transformedNormals,
                            normalize: true
                        })
                    },
                    indices,
                    primitiveType: Cesium.PrimitiveType.TRIANGLES,
                    boundingSphere: Cesium.BoundingSphere.fromVertices(transformedPositions)
                }),
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(
                        color.x,
                        color.y,
                        color.z,
                        color.w
                    ))
                }
            });
        })).flat();
};

const createLayer = (options, map) => {
    if (!options.visibility) {
        return {
            detached: true,
            primitives: () => undefined,
            remove: () => {}
        };
    }
    let primitives = new Cesium.PrimitiveCollection({ destroyPrimitives: true });

    fetch(options.url)
        .then((res) => res.arrayBuffer())
        .then((data) => {
            return getWebIFC()
                .then((ifcApi) => {
                    const { meshes, center } = ifcDataToJSON({ ifcApi, data });
                    const translucentPrimitive = new Cesium.Primitive({
                        geometryInstances: getGeometryInstances({
                            meshes: meshes.filter(mesh => !mesh.geometry.every(({ color }) => color.w === 1)),
                            center,
                            options
                        }),
                        releaseGeometryInstances: false,
                        appearance: new Cesium.PerInstanceColorAppearance({
                            translucent: true
                        }),
                        asynchronous: false,
                        allowPicking: true
                    });
                    // see https://github.com/geosolutions-it/MapStore2/blob/9f6f9d498796180ff59679887d300ce51e72a289/web/client/components/map/cesium/Map.jsx#L354-L393
                    translucentPrimitive._msGetFeatureById = (id) => meshes.find((_mesh) => _mesh.id === id)?.properties || {};
                    translucentPrimitive.msId = options.id;
                    translucentPrimitive.id = 'translucentPrimitive';
                    primitives.add(translucentPrimitive);
                    const opaquePrimitive = new Cesium.Primitive({
                        geometryInstances: getGeometryInstances({
                            meshes: meshes.filter(mesh => !!mesh.geometry.every(({ color }) => color.w === 1)),
                            center,
                            options
                        }),
                        releaseGeometryInstances: false,
                        appearance: new Cesium.PerInstanceColorAppearance({
                            // flat: true
                            translucent: false
                        }),
                        asynchronous: false,
                        allowPicking: true
                    });
                    opaquePrimitive._msGetFeatureById = (id) => meshes.find((_mesh) => _mesh.id === id)?.properties || {};
                    opaquePrimitive.msId = options.id;
                    opaquePrimitive.id = 'opaquePrimitive';
                    primitives.add(opaquePrimitive);
                    updatePrimitivesPosition(primitives, options.center);

                });
        });
    map.scene.primitives.add(primitives);
    window.MapScene = map.scene;
    return {
        detached: true,
        primitives,
        remove: () => {
            if (primitives && map) {
                map.scene.primitives.remove(primitives);
                primitives = undefined;
            }
        },
        setVisible: (
            newVisibility
        ) => {
            // todo: add the logic of setting visibility
            if (primitives && map) {
                updatePrimitivesVisibility(primitives, newVisibility);
            }
        }
    };
};

Layers.registerType('model', {
    create: createLayer,
    update: (layer, newOptions, oldOptions) => {
        if (layer?.primitives && !isEqual(newOptions?.center, oldOptions?.center)) {
            // update layer.bbox
            layer.bbox = {
                ...layer.bbox,
                bounds: {
                    minx: newOptions?.center?.[0] || 0 - 2,
                    miny: newOptions?.center?.[1] || 0 - 2,
                    maxx: newOptions?.center?.[0] || 0 + 2,
                    maxy: newOptions?.center?.[1] || 0 + 2
                }
            };
            updatePrimitivesPosition(layer?.primitives, newOptions?.center);
        }
        return null;
    }
});
