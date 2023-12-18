/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import * as Cesium from 'cesium';

const applyMatrix = (matrix, coords) => {
    const result = Cesium.Matrix4.multiplyByPoint(
        Cesium.Matrix4.fromArray(matrix),
        new Cesium.Cartesian3(...coords),
        new Cesium.Cartesian3()
    );

    return [result.x, result.y, result.z];
};

const dataToJSON = ({ data, ifcApi }) => {
    const settings = {};
    let rawFileData = new Uint8Array(data);
    const modelID = ifcApi.OpenModel(rawFileData, settings); // eslint-disable-line
    ifcApi.LoadAllGeometry(modelID); // eslint-disable-line
    const coordinationMatrix = ifcApi.GetCoordinationMatrix(modelID); // eslint-disable-line
    let meshes = [];
    let minx = Infinity;
    let maxx = -Infinity;
    let miny = Infinity;
    let maxy = -Infinity;
    let minz = Infinity;
    let maxz = -Infinity;
    ifcApi.StreamAllMeshes(modelID, (mesh) => { // eslint-disable-line
        const placedGeometries = mesh.geometries;
        let geometry = [];
        for (let i = 0; i < placedGeometries.size(); i++) {
            const placedGeometry = placedGeometries.get(i);
            const ifcGeometry = ifcApi.GetGeometry(modelID, placedGeometry.geometryExpressID); // eslint-disable-line
            const ifcVertices = ifcApi.GetVertexArray(ifcGeometry.GetVertexData(), ifcGeometry.GetVertexDataSize()); // eslint-disable-line
            const ifcIndices = ifcApi.GetIndexArray(ifcGeometry.GetIndexData(), ifcGeometry.GetIndexDataSize()); // eslint-disable-line
            const positions = new Float64Array(ifcVertices.length / 2);
            const normals = new Float32Array(ifcVertices.length / 2);
            for (let j = 0; j < ifcVertices.length; j += 6) {
                const [x, y, z] = applyMatrix(
                    coordinationMatrix,
                    applyMatrix(placedGeometry.flatTransformation, [
                        ifcVertices[j],
                        ifcVertices[j + 1],
                        ifcVertices[j + 2]
                    ])
                );
                if (x < minx) { minx = x; }
                if (y < miny) { miny = y; }
                if (z < minz) { minz = z; }
                if (x > maxx) { maxx = x; }
                if (y > maxy) { maxy = y; }
                if (z > maxz) { maxz = z; }
                positions[j / 2] = x;
                positions[j / 2 + 1] = y;
                positions[j / 2 + 2] = z;
                normals[j / 2] = ifcVertices[j + 3];
                normals[j / 2 + 1] = ifcVertices[j + 4];
                normals[j / 2 + 2] = ifcVertices[j + 5];
            }
            geometry.push({
                color: placedGeometry.color,
                positions,
                normals,
                indices: Array.from(ifcIndices)
            });
            ifcGeometry.delete();
        }
        const propertyLines = ifcApi.GetLine(modelID, mesh.expressID); // eslint-disable-line
        meshes.push({
            geometry,
            id: mesh.expressID,
            properties: Object.keys(propertyLines).reduce((acc, key) => {
                return {
                    ...acc,
                    [key]: propertyLines[key]?.value || propertyLines[key]
                };
            }, {})
        });
    });
    ifcApi.CloseModel(modelID); // eslint-disable-line
    return {
        meshes,
        extent: [minx, miny, maxx, maxy, minz, maxz],
        center: [minx + (maxx - minx) / 2, miny + (maxy - miny) / 2, minz + (maxz - minz) / 2],
        size: [maxx - minx, maxy - miny, maxz - minz]
    };
};

const getWebIFC = () => import('web-ifc')
    .then(WebIFC => {
        const ifcApi = new WebIFC.IfcAPI();
        ifcApi.SetWasmPath('./web-ifc/'); // eslint-disable-line
        return ifcApi.Init().then(() => ifcApi); // eslint-disable-line
    });

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
                new Cesium.Cartesian3(0.0, 0.0, 0.0),
                Cesium.Quaternion.fromAxisAngle(
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

    let primitives = new Cesium.PrimitiveCollection({ destroyPrimitives: true });

    fetch(options.url)
        .then((res) => res.arrayBuffer())
        .then((data) => {
            return getWebIFC()
                .then((ifcApi) => {
                    const { meshes, center } = dataToJSON({ ifcApi, data });
                    const translucentPrimitive = new Cesium.Primitive({
                        geometryInstances: getGeometryInstances({
                            meshes: meshes.filter(mesh => !mesh.geometry.every(({ color }) => color.w === 1)),
                            center,
                            options
                        }),
                        appearance: new Cesium.PerInstanceColorAppearance({
                            translucent: true
                        }),
                        asynchronous: false,
                        allowPicking: true
                    });
                    // see https://github.com/geosolutions-it/MapStore2/blob/9f6f9d498796180ff59679887d300ce51e72a289/web/client/components/map/cesium/Map.jsx#L354-L393
                    translucentPrimitive._msGetFeatureById = (id) => meshes.find((_mesh) => _mesh.id === id)?.properties || {};
                    translucentPrimitive.msId = options.id;
                    primitives.add(translucentPrimitive);
                    const opaquePrimitive = new Cesium.Primitive({
                        geometryInstances: getGeometryInstances({
                            meshes: meshes.filter(mesh => !!mesh.geometry.every(({ color }) => color.w === 1)),
                            center,
                            options
                        }),
                        appearance: new Cesium.PerInstanceColorAppearance({
                            // flat: true
                            translucent: false
                        }),
                        asynchronous: false,
                        allowPicking: true
                    });
                    opaquePrimitive._msGetFeatureById = (id) => meshes.find((_mesh) => _mesh.id === id)?.properties || {};
                    opaquePrimitive.msId = options.id;
                    primitives.add(opaquePrimitive);
                });
        });
    map.scene.primitives.add(primitives);
    return {
        detached: true,
        primitives,
        remove: () => {
            if (primitives && map) {
                map.scene.primitives.remove(primitives);
                primitives = undefined;
            }
        }
    };
};

Layers.registerType('model', {
    create: createLayer,
    update: (/* layer, newOptions, oldOptions, map */) => {
        return null;
    }
});
