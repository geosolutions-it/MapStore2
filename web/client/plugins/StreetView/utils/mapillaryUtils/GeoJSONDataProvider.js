/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { S2GeometryProvider, DataProviderBase, MapillaryError } from 'mapillary-js';
import axios from 'axios';
import { getTilesAtZ } from './tilemath.js';
import { debugTiles } from './utils.js';

const DEFAULT_REFERENCE = { alt: 0, lat: 0, lng: 0 };

function generateCells(images, geometryProvider) {
    const cells = new Map();
    for (const image of images) {
        const cellId = geometryProvider.lngLatToCellId(image.geometry);
        if (!cells.has(cellId)) {
            cells.set(cellId, []);
        }
        cells.get(cellId).push(image);
    }
    return cells;
}

const getFilenameInfo = (filename) => {
    const parts = filename.split('/');
    const imageName = parts[parts.length - 1];
    const group = parts.length === 2 ? parts[0] : undefined;
    return { imageName, group };
};

function featureToImage(feature, { imageId, meshId, clusterId, sequenceId, url }) {
    const geometry = {
        lat: feature.properties.MAPLatitude,
        lng: feature.properties.MAPLongitude
    };
    const { imageName, group } = getFilenameInfo(feature.properties.filename);
    const thumbId = feature.properties.filename;
    const thumbUrl = url + (group ? group + '/' : '' ) + 'thumb/' + imageName + '.jpg';
    const width = feature.properties.width;
    const height = feature.properties.height;
    const [yy, mm, dd, h, m, s] = feature.properties.MAPCaptureTime.split('_');
    return {
        altitude: feature.properties.MAPAltitude,
        atomic_scale: 1,
        camera_parameters: [],
        camera_type: 'spherical',
        captured_at: new Date(`${yy}/${mm}/${dd} ${h}:${m}:${s}`).getTime(),
        cluster: {
            id: clusterId,
            url: clusterId
        },
        compass_angle: feature.properties.MAPCompassHeading.TrueHeading,
        computed_compass_angle: feature.properties.MAPCompassHeading.TrueHeading,
        computed_altitude: feature.properties.MAPAltitude,
        computed_geometry: geometry,
        creator: { id: null, username: null },
        geometry,
        height,
        id: imageId,
        merge_id: 'merge_id',
        mesh: { id: meshId, url: meshId },
        exif_orientation: feature.properties.MAPOrientation,
        'private': null,
        quality_score: 1,
        sequence: { id: sequenceId },
        thumb: { id: thumbId, url: thumbUrl },
        owner: { id: null },
        width
    };
}

class GeoJSONDataProvider extends DataProviderBase {
    constructor(options = {}) {
        super(options.geometry ?? new S2GeometryProvider(options?.geometryLevel));
        this._features = options?.geojson?.features || [];
        this._debug = !!options.debug;
        this._getImageFromUrl = options.getImageFromUrl
            ? options.getImageFromUrl
            : (url) => axios.get(url, {
                responseType: 'arraybuffer'
            }).then(res => res.data);
        this._url = options.url;
        this._initialize();
        this._populate();
    }
    getCluster() {
        return Promise.resolve({ points: {}, reference: DEFAULT_REFERENCE });
    }
    getCoreImages(cellId) {
        const images = this.cells.has(cellId) ? this.cells.get(cellId) : [];
        return Promise.resolve({ cell_id: cellId, images });
    }
    getImageBuffer(url) {
        return this._getImageFromUrl(url);
    }
    getImages(imageIds) {
        const images = imageIds.map((id) => ({
            node: this.images.has(id) ? this.images.get(id) : null,
            node_id: id
        }));
        return Promise.resolve(images);
    }
    getImageTiles(request) {
        const image = this.images.has(request.imageId) ? this.images.get(request.imageId) : null;
        if (image) {
            const imageSize = { w: image.width, h: image.height };
            if (this._debug) {
                return Promise.resolve(debugTiles(imageSize, request));
            }
            const tiles = getTilesAtZ(imageSize, request.z);
            const { imageName, group } = getFilenameInfo(request.imageId);
            return Promise.resolve({
                node: tiles.map(({ x, y, z }) => {
                    return {
                        url: `${this._url}${group ? `${group}/` : ''}tiles/${imageName}/${z}_${x}_${y}.jpg`,
                        x, y, z
                    };
                }),
                node_id: request.imageId
            });
        }
        return Promise.reject(new MapillaryError(`Not image id ${request.imageId} for tiling request`));
    }
    getMesh() {
        return Promise.resolve({faces: [], vertices: []});
    }
    getSequence(sequenceId) {
        return new Promise((resolve, reject) => {
            if (this.sequences.has(sequenceId)) {
                resolve(this.sequences.get(sequenceId));
            } else {
                reject(new MapillaryError(`Sequence ${sequenceId} does not exist`));
            }
        });
    }
    getSpatialImages(imageIds) {
        return this.getImages(imageIds);
    }
    _initialize() {
        this.sequences = new Map();
        this.images = new Map();
        this.clusters = new Map();
        this.cells = new Map();
        this.meshes = new Map();
    }
    _populate() {
        const clusterId = 1;
        const meshId = 1;
        const images = [];
        const sequences = {};
        this._features.forEach((feature) => {
            const sequenceId = feature.properties.MAPSequenceUUID || '1';
            if (!sequences[sequenceId]) {
                sequences[sequenceId] = { id: sequenceId, image_ids: [] };
            }
            const imageId = feature.properties.filename;
            sequences[sequenceId].image_ids.push(imageId);
            images.push(featureToImage(feature, { imageId, clusterId, meshId, sequenceId, url: this._url }));
        });
        this.images = new Map(images.map((i) => [i.id, i]));
        this.cells = generateCells(this.images.values(), this._geometry);
        this.sequences = new Map(Object.keys(sequences).map(sequenceId => [sequenceId, sequences[sequenceId]]));
    }
}

export default GeoJSONDataProvider;
