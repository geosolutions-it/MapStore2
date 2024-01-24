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
const updateOpacity = (primitives, opacityOption, map) => {
    for (let i = 0; i < primitives.length; i++) {
        const primitive = primitives.get(i);
        let geomInstances = primitive.geometryInstances;
        geomInstances?.forEach(geomInstance => {
            let instanceAttributes = primitive.getGeometryInstanceAttributes(geomInstance.id);
            let cloneColor = Cesium.Color.fromBytes(instanceAttributes.color[0], instanceAttributes.color[1], instanceAttributes.color[2], instanceAttributes.color[3]);
            cloneColor.alpha = (geomInstance?.originalOpacity || 1 ) * opacityOption;
            instanceAttributes.color = Cesium.ColorGeometryInstanceAttribute.fromColor(cloneColor).value;
        });

    }
    map.scene.requestRender();
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
            let geometryInstance =  new Cesium.GeometryInstance({
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
            geometryInstance.originalOpacity = color.w;
            return geometryInstance;
        })).flat();
};

const createPrimitiveFromMeshes = (meshes, options, center, primitiveName) => {
    const primitive = new Cesium.Primitive({
        geometryInstances: getGeometryInstances({
            meshes: meshes.filter(mesh => primitiveName === 'translucentPrimitive' ? !mesh.geometry.every(({ color }) => color.w === 1) : !!mesh.geometry.every(({ color }) => color.w === 1)),
            center,
            options
        }),
        releaseGeometryInstances: false,
        appearance: new Cesium.PerInstanceColorAppearance({
            translucent: primitiveName === 'translucentPrimitive' ? true : false
        }),
        asynchronous: false,
        allowPicking: true
    });
    // see https://github.com/geosolutions-it/MapStore2/blob/9f6f9d498796180ff59679887d300ce51e72a289/web/client/components/map/cesium/Map.jsx#L354-L393
    primitive._msGetFeatureById = (id) => {
        return {
            msId: options.id,
            feature: {
                properties: meshes.find((_mesh) => _mesh.id === id)?.properties || {},
                type: 'Feature',
                geometry: null
            }
        };
    };
    primitive.msId = options.id;
    primitive.id = primitiveName;
    return primitive;
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
                    const translucentPrimitive = createPrimitiveFromMeshes(meshes, options, center, 'translucentPrimitive');
                    const opaquePrimitive = createPrimitiveFromMeshes(meshes, options, center, 'opaquePrimitive');
                    primitives.add(translucentPrimitive);
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
            if (primitives && map) {
                updatePrimitivesVisibility(primitives, newVisibility);
            }
        }
    };
};

Layers.registerType('model', {
    create: createLayer,
    update: (layer, newOptions, oldOptions, map) => {
        if (layer?.primitives && !isEqual(newOptions?.center, oldOptions?.center)) {
            updatePrimitivesPosition(layer?.primitives, newOptions?.center);
        }
        // if (layer?.primitives && !isEqual(newOptions?.opacity, oldOptions?.opacity)) {
        //     updateOpacity(layer?.primitives, newOptions?.opacity, map);
        // }
        return null;
    }
});
