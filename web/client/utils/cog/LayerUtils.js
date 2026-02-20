import { fromUrl as fromGeotiffUrl } from 'geotiff';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';

import { isProjectionAvailable } from "../ProjectionUtils";

let LayerUtils;

/**
 * Get projection code from geokeys
 * @param {Object} image
 * @returns {string} projection code
 */
export const getProjectionFromGeoKeys = (image) => {
    const geoKeys = image.geoKeys;
    if (!geoKeys) {
        return null;
    }

    if (
        geoKeys.ProjectedCSTypeGeoKey &&
        geoKeys.ProjectedCSTypeGeoKey !== 32767
    ) {
        return "EPSG:" + geoKeys.ProjectedCSTypeGeoKey;
    }

    if (
        geoKeys.GeographicTypeGeoKey &&
        geoKeys.GeographicTypeGeoKey !== 32767
    ) {
        return "EPSG:" + geoKeys.GeographicTypeGeoKey;
    }

    return null;
};

const abortError = (reject) => reject(new DOMException("Aborted", "AbortError"));
/**
 * fromUrl with abort fetching of data and data slices
 * Note: The abort action will not cancel data fetch request but just the promise,
 * because of the issue in https://github.com/geotiffjs/geotiff.js/issues/408
 */
export const fromUrl = (url, signal) => {
    if (signal?.aborted) {
        return abortError(Promise.reject);
    }
    return new Promise((resolve, reject) => {
        signal?.addEventListener("abort", () => abortError(reject));
        return fromGeotiffUrl(url)
            .then((image)=> image.getImage()) // Fetch and read first image to get medatadata of the tif
            .then((image) => resolve(image))
            .catch(()=> abortError(reject));
    });
};

export const getLayerConfig = ({ url, layer, controller }) => {
    return LayerUtils.fromUrl(url, controller?.signal)
        .then(image => {
            const crs = LayerUtils.getProjectionFromGeoKeys(image);
            const extent = image.getBoundingBox();
            const isProjectionDefined = isProjectionAvailable(crs);
            const samples = image.getSamplesPerPixel();
            const { STATISTICS_MINIMUM, STATISTICS_MAXIMUM } = image.getGDALMetadata() ?? {};

            // `nodata` is usually present in the tif's source data, currently defaults to 0 when not present. (TODO should be made configurable in the future)
            // Adds an alpha channel when present and helps with visualization and eliminates no data tile around the image
            const nodata = image.getGDALNoData() ?? 0;

            const  updatedLayer = {
                ...layer,
                sources: layer?.sources?.map(source => ({
                    ...source,
                    min: source.min ?? STATISTICS_MINIMUM,
                    max: source.max ?? STATISTICS_MAXIMUM,
                    nodata
                })),
                sourceMetadata: {
                    crs,
                    extent: extent,
                    width: image.getWidth(),
                    height: image.getHeight(),
                    tileWidth: image.getTileWidth(),
                    tileHeight: image.getTileHeight(),
                    origin: image.getOrigin(),
                    resolution: image.getResolution(),
                    samples,
                    fileDirectory: {
                        // add more fileDirectory properties based on requirement
                        PhotometricInterpretation: get(image, 'fileDirectory.PhotometricInterpretation')
                    }
                },
                // skip adding bbox when geokeys or extent is empty
                ...(!isEmpty(extent) && !isEmpty(crs) && {
                    bbox: {
                        crs,
                        ...(isProjectionDefined && {
                            bounds: {
                                minx: extent[0],
                                miny: extent[1],
                                maxx: extent[2],
                                maxy: extent[3]
                            }}
                        )
                    }
                })
            };
            return updatedLayer;
        })
        .catch(() => ({...layer}));
};

const LayersInstances = {};

export const addLayerInstance = (id, layer, lib = 'openlayers') => {
    // layer is OL,cesium layer instance
    LayersInstances[`${lib}_${id}`] = layer;
};

export const getLayerInstance = (id, lib = 'openlayers') => {
    if (!id) return null;
    return LayersInstances[`${lib}_${id}`];
};

export const removeLayerInstance = (id, lib = 'openlayers') => {
    delete LayersInstances[`${lib}_${id}`];
};


LayerUtils = {
    getProjectionFromGeoKeys,
    fromUrl,
    getLayerConfig
};

export default LayerUtils;

