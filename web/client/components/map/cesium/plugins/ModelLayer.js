/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Cesium from 'cesium';
import Layers from '../../../../utils/cesium/Layers';
import { ifcDataToJSON, getWebIFC } from '../../../../api/Model';     // todo: change path to MODEL


const transform = (positions, coords, matrix) => {
    let transformed = [];
    for (let i = 0; i < positions.length; i += 3) {
        const cartesian = Cesium.Matrix4.multiplyByPoint(matrix, new Cesium.Cartesian3(
            positions[i] + coords[0],
            positions[i + 1] + coords[1],
            positions[i + 2] + coords[2]
        ), new Cesium.Cartesian3());
        transformed.push(
            cartesian.x,
            cartesian.y,
            cartesian.z
        );
    }
    return transformed;
};

const getGeometryInstances = ({
    meshes,
    center,
    options
}) => {
    return meshes
        .map((mesh) => mesh.geometry.map(({
            color,
            positions,
            normals,
            indices
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
            const transformedPositions = transform(
                positions,
                [-center[0], -center[1], -center[2]],
                Cesium.Matrix4.multiply(
                    Cesium.Transforms.eastNorthUpToFixedFrame(
                        // review the center properties
                        // based on other existing layer parameters
                        Cesium.Cartesian3.fromDegrees(...(options.center ? [
                            options.center[0],
                            options.center[1],
                            options.center[2]
                        ] : [0, 0, 0]))
                    ),
                    rotationMatrix,
                    new Cesium.Matrix4()
                )
            );
            const transformedNormals = transform(
                normals,
                [0, 0, 0],
                rotationMatrix
            );
            return new Cesium.GeometryInstance({
                id: mesh.id,
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

                // modelMatrix: ,
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
            // newVisiblity
        ) => {
            // todo: add the logic of setting visibility
        }
    };
};

Layers.registerType('model', {
    create: createLayer,
    update: (/* layer, newOptions, oldOptions, map */) => {
        // todo: here we can put change opacity logic
        return null;
    }
});
