/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from '../libs/ajax';
import { convertRadianToDegrees } from '../utils/CoordinatesUtils';
import isNumber from 'lodash/isNumber';
import { METERS_PER_UNIT } from '../utils/MapUtils';

function getTitleFromUrl(url) {
    const parts = url.split('/');
    return parts[parts.length - 2];
}

function tilesetToBoundingBox(Cesium, tileset) {
    if (tileset?.root?.boundingVolume?.region) {
        // Latitudes and longitudes are in the WGS 84 datum as defined in EPSG 4979 and are in radians
        // region [west, south, east, north, minimum height, maximum height]
        const [west, south, east, north] = tileset.root.boundingVolume.region;

        return {
            bounds: {
                minx: convertRadianToDegrees(west),
                miny: convertRadianToDegrees(south),
                maxx: convertRadianToDegrees(east),
                maxy: convertRadianToDegrees(north)
            },
            crs: 'EPSG:4326'
        };
    }

    const transform = Cesium.Matrix4.fromArray(tileset.root.transform || [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    // computation from https://github.com/CesiumGS/cesium/blob/1.90/Source/Scene/Cesium3DTile.js
    // createBox function
    if (tileset?.root?.boundingVolume?.box) {
        const [x, y, z] = tileset.root.boundingVolume.box;
        const center = Cesium.Matrix4.multiplyByPoint(
            transform,
            new Cesium.Cartesian3(x, y, z),
            new Cesium.Cartesian3()
        );
        const rotationScale = Cesium.Matrix4.getMatrix3(transform, new Cesium.Matrix4());
        const halfAxes = Cesium.Matrix3.multiply(
            rotationScale,
            Cesium.Matrix3.fromArray(tileset.root.boundingVolume.box, 3, new Cesium.Matrix3()),
            new Cesium.Matrix3()
        );
        // from https://github.com/CesiumGS/cesium/blob/a11b14cab7229036b3348763d861a28b905d367d/Source/Scene/TileOrientedBoundingBox.js#L95
        const sphere = Cesium.BoundingSphere.fromOrientedBoundingBox(new Cesium.OrientedBoundingBox(center, halfAxes));
        const cartographic = Cesium.Cartographic.fromCartesian(sphere.center);
        const lng = convertRadianToDegrees(cartographic.longitude);
        const lat = convertRadianToDegrees(cartographic.latitude);

        const radiusDegrees = sphere.radius / METERS_PER_UNIT.degrees;
        return {
            bounds: {
                minx: lng - radiusDegrees,
                miny: lat - radiusDegrees,
                maxx: lng + radiusDegrees,
                maxy: lat + radiusDegrees
            },
            crs: 'EPSG:4326'
        };
    }
    // computation from https://github.com/CesiumGS/cesium/blob/1.90/Source/Scene/Cesium3DTile.js
    // createSphere function
    if (tileset?.root?.boundingVolume?.sphere) {
        const [x, y, z, radius] = tileset.root.boundingVolume.sphere;
        const center = Cesium.Matrix4.multiplyByPoint(
            transform,
            new Cesium.Cartesian3(x, y, z),
            new Cesium.Cartesian3()
        );
        const scale = Cesium.Matrix4.getScale(transform, new Cesium.Matrix4());
        const uniformScale = Cesium.Cartesian3.maximumComponent(scale);
        const radiusDegrees = (radius * uniformScale) / METERS_PER_UNIT.degrees;
        const cartographic = Cesium.Cartographic.fromCartesian(center);
        const lng = convertRadianToDegrees(cartographic.longitude);
        const lat = convertRadianToDegrees(cartographic.latitude);
        return {
            bounds: {
                minx: lng - radiusDegrees,
                miny: lat - radiusDegrees,
                maxx: lng + radiusDegrees,
                maxy: lat + radiusDegrees
            },
            crs: 'EPSG:4326'
        };
    }
    return null;
}

function getFormat(uri) {
    const parts = uri.split(/\./g);
    const format = parts[parts.length - 1];
    return format;
}

function extractCapabilities(tileset) {
    return import('cesium')
        .then((mod) => {
            const Cesium = mod;
            const version = tileset?.asset?.version !== undefined ? tileset.asset.version : '1.0';
            const bbox = tilesetToBoundingBox(Cesium, tileset);
            const format = getFormat(tileset?.root?.content?.uri || '');
            const propertiesKeys =  Object.keys(tileset?.properties || {});
            const properties = propertiesKeys.map((key) => {
                const { minimum, maximum } = tileset.properties[key];
                return {
                    name: key,
                    type: isNumber(minimum) || isNumber(maximum)
                        ? 'number'
                        : 'string',
                    minimum,
                    maximum
                };
            });
            return {
                version,
                ...(bbox && { bbox }),
                format,
                properties
            };
        });
}

export const getCapabilities = (url) => {
    return axios.get(url)
        .then(({ data }) => {
            return extractCapabilities(data).then((properties) => ({ tileset: data, ...properties }));
        });
};

export const getRecords = (url, startPosition, maxRecords, text, info) => {
    return axios.get(url)
        .then(({ data }) => {
            return extractCapabilities(data)
                .then((properties) => {
                    const records = [{
                        // current specification does not define the title location
                        // but there is works related to the metadata in the next version of 3d tiles
                        // for the moment we set the name assigned to catalog service
                        // or we can extract the title from the url
                        title: info?.options?.service?.title || getTitleFromUrl(url),
                        url: url,
                        type: '3dtiles',
                        tileset: data,
                        ...properties
                    }].filter(({ title }) => !text || title?.toLowerCase().includes(text?.toLowerCase() || ''));
                    return {
                        numberOfRecordsMatched: records.length,
                        numberOfRecordsReturned: records.length,
                        records
                    };
                });
        });
};
