/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Cesium from 'cesium';
import isEqual from 'lodash/isEqual';
import Layers from '../../../../utils/cesium/Layers';
import { ifcDataToJSON, getIFCModel } from '../../../../api/Model';

const updatePrimitivesMatrix = (primitives, feature) => {
    const { properties, geometry } = feature;
    const {
        heading,
        pitch,
        roll,
        scale
    } = properties || {};
    const [
        longitude,
        latitude,
        height
    ] = geometry?.coordinates || [];
    for (let i = 0; i < primitives.length; i++) {
        const primitive = primitives.get(i);
        const rotationMatrix = Cesium.Matrix4.fromTranslationQuaternionRotationScale(
            new Cesium.Cartesian3(0.0, 0.0, 0.0),
            Cesium.Quaternion.fromHeadingPitchRoll(
                new Cesium.HeadingPitchRoll(
                    Cesium.Math.toRadians(heading || 0),
                    Cesium.Math.toRadians(pitch || 0),
                    Cesium.Math.toRadians(roll || 0)
                )
            ),
            new Cesium.Cartesian3(scale || 1.0, scale || 1.0, scale || 1.0),
            new Cesium.Matrix4()
        );
        // Apply IFC transformation to model matrix
        const translationMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(longitude || 0, latitude || 0, height || 0)
        );
        const scaleMatrix = Cesium.Matrix4.fromScale(new Cesium.Cartesian3(scale || 1, scale || 1, scale || 1));
        primitive.modelMatrix = Cesium.Matrix4.multiply(
            translationMatrix,
            Cesium.Matrix4.multiply(rotationMatrix, scaleMatrix, new Cesium.Matrix4()),     // todo: try to remove this and put just the rotationMatrix
            new Cesium.Matrix4()
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
                new Cesium.Cartesian3(0.0, 0.0, 0.0),
                Cesium.Quaternion.fromAxisAngle(
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

const createPrimitiveFromMeshes = (meshes, options, primitiveName) => {
    const primitive = new Cesium.Primitive({
        geometryInstances: getGeometryInstances({
            meshes: meshes.filter(mesh => primitiveName === 'translucentPrimitive' ? !mesh.geometry.every(({ color }) => color.w === 1) : !!mesh.geometry.every(({ color }) => color.w === 1))
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
            remove: () => {},
            add: () => {}
        };
    }
    let primitives;
    return {
        detached: true,
        primitives,
        add: () => {
            primitives = new Cesium.PrimitiveCollection({ destroyPrimitives: true });
            getIFCModel(options.url)
                .then(({ifcModule, data}) => {
                    const { meshes } = ifcDataToJSON({ ifcModule, data });
                    const translucentPrimitive = createPrimitiveFromMeshes(meshes, options, 'translucentPrimitive');
                    const opaquePrimitive = createPrimitiveFromMeshes(meshes, options, 'opaquePrimitive');
                    primitives.add(translucentPrimitive);
                    primitives.add(opaquePrimitive);
                    updatePrimitivesMatrix(primitives, options?.features?.[0]);
                });
            map.scene.primitives.add(primitives);
        },
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
        if (layer?.primitives && !isEqual(newOptions?.features?.[0], oldOptions?.features?.[0])) {
            updatePrimitivesMatrix(layer?.primitives, newOptions?.features?.[0]);
        }
        if (newOptions?.forceProxy !== oldOptions?.forceProxy) {
            return createLayer(newOptions, map);
        }
        return null;
    }
});
