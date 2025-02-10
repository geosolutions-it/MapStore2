/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import JSZip from 'jszip';
import { every, get, some } from 'lodash';
import { compose, createEventHandler, mapPropsStream } from 'recompose';
import Rx from 'rxjs';

import { isAnnotation, importJSONToAnnotations } from '../../../../plugins/Annotations/utils/AnnotationsUtils';
import ConfigUtils from '../../../../utils/ConfigUtils';
import {
    MIME_LOOKUPS,
    checkShapePrj,
    gpxToGeoJSON,
    kmlToGeoJSON,
    readJson,
    readKml,
    readKmz,
    readWMC,
    readZip,
    recognizeExt,
    shpToGeoJSON,
    readGeoJson,
    isFileSizeExceedMaxLimit
} from '../../../../utils/FileUtils';
import { geoJSONToLayer } from '../../../../utils/LayersUtils';

const tryUnzip = (file) => {
    return readZip(file).then((buffer) => {
        var zip = new JSZip();
        return zip.loadAsync(buffer);
    });
};

/**
 * Checks if the file is allowed. Returns a promise that does this check.
 */
const checkFileType = (file) => {
    return new Promise((resolve, reject) => {
        const ext = recognizeExt(file.name);
        const type = file.type || MIME_LOOKUPS[ext];
        if (type === 'application/x-zip-compressed'
            || type === 'application/zip'
            || type === 'application/vnd.google-earth.kml+xml'
            || type === 'application/vnd.google-earth.kmz'
            || type === 'application/gpx+xml'
            || type === 'application/json'
            || type === 'application/vnd.wmc'
            || type === 'application/geo+json') {
            resolve(file);
        } else {
            // Drag and drop of compressed folders doesn't correctly send the zip mime type (windows, also conflicts with installations of WinRar)
            // so the application must try to unzip the file to find out the effective file type.
            tryUnzip(file).then(() => resolve(file)).catch(() => reject(new Error("FILE_NOT_SUPPORTED")));
        }
    });
};
/**
 * Create a function that return a Promise for reading file. The Promise resolves with an array of (json)
 * @param {function} onWarnings callback in case of warnings to report
 */
const readFile = ({onWarnings, options}) => (file) => {
    const ext = recognizeExt(file.name);
    const type = file.type || MIME_LOOKUPS[ext];
    // Check the file size first before file conversion process to avoid this useless effort
    const configurableFileSizeLimitInMB = options.importedVectorFileMaxSizeInMB;
    const isVectorFile = type !== 'application/json';       // skip json as json is for map file
    if (configurableFileSizeLimitInMB && isVectorFile) {
        if (isFileSizeExceedMaxLimit(file, configurableFileSizeLimitInMB)) {
            // add 'exceedFileMaxSize' and fileSizeLimitInMB into layer object to be used in useFiles
            return [[{ "type": "FeatureCollection", features: [{}], "fileName": file.name, name: file.name, exceedFileMaxSize: true, fileSizeLimitInMB: configurableFileSizeLimitInMB }]];
        }
    }

    const projectionDefs = ConfigUtils.getConfigProp('projectionDefs') || [];
    const supportedProjections = (projectionDefs.length && projectionDefs.map(({code})  => code) || []).concat(["EPSG:4326", "EPSG:3857", "EPSG:900913"]);
    if (type === 'application/vnd.google-earth.kml+xml') {
        return readKml(file).then((xml) => {
            return kmlToGeoJSON(xml);
        });
    }
    if (type === 'application/gpx+xml') {
        return readKml(file).then((xml) => {
            return gpxToGeoJSON(xml, file.name);
        });
    }
    if (type === 'application/vnd.google-earth.kmz') {
        return readKmz(file).then((xml) => {
            return kmlToGeoJSON(xml);
        });
    }
    if (type === 'application/x-zip-compressed' ||
        type === 'application/zip') {
        return readZip(file).then((buffer) => {
            return checkShapePrj(buffer).then((warnings) => {
                if (warnings.length > 0) {
                    onWarnings({type: 'warning', filename: file.name, message: 'shapefile.error.missingPrj'});
                }
                const geoJsonArr = shpToGeoJSON(buffer).map(json => ({ ...json, filename: file.name }));
                const areProjectionsPresent = some(geoJsonArr, geoJson => !!get(geoJson, 'map.projection'));
                if (areProjectionsPresent) {
                    const filteredGeoJsonArr = geoJsonArr.filter(item => !!get(item, 'map.projection'));
                    const areProjectionsValid = every(filteredGeoJsonArr, geoJson => supportedProjections.includes(geoJson.map.projection));
                    if (areProjectionsValid) {
                        return geoJsonArr;
                    }
                    throw new Error("PROJECTION_NOT_SUPPORTED");
                }
                return geoJsonArr;
            });
        });
    }
    if (type === 'application/json') {
        return readJson(file).then(f => {
            const projection = get(f, 'map.projection');
            if (projection) {
                if (supportedProjections.includes(projection)) {
                    return [{...f, "fileName": file.name}];
                }
                throw new Error("PROJECTION_NOT_SUPPORTED");
            }
            return [{...f, "fileName": file.name}];
        });
    }
    if (type === 'application/geo+json') {
        return readGeoJson(file).then(f => {
            const projection = get(f, 'geoJSON.map.projection');
            if (projection) {
                if (supportedProjections.includes(projection)) {
                    return [{...f.geoJSON, "fileName": file.name}];
                }
                throw new Error("PROJECTION_NOT_SUPPORTED");
            }
            return [{...f.geoJSON, "fileName": file.name}];
        });
    }
    if (type === 'application/vnd.wmc') {
        return readWMC(file).then((config) => {
            return [{...config, "fileName": file.name}];
        });
    }
    return null;
};

const isGeoJSON = json => json && json.features && json.features.length !== 0;
const isMap = json => json && json.version && json.map;

/**
 * Enhancers a component to process files on drop event.
 * Recognizes map files (JSON format) or vector data in various formats.
 * They are converted in JSON as a "files" property.
 */
export default compose(
    mapPropsStream(
        props$ => {
            const { handler: onDrop, stream: drop$ } = createEventHandler();
            const { handler: onWarnings, stream: warnings$} = createEventHandler();
            return props$.combineLatest(
                drop$.switchMap(
                    ({files, options}) => Rx.Observable.from(files)
                        .flatMap(checkFileType) // check file types are allowed
                        .flatMap(readFile({onWarnings, options})) // read files to convert to json
                        .reduce((result, jsonObjects) => ({ // divide files by type
                            layers: (result.layers || [])
                                .concat(
                                    jsonObjects.filter(json => isGeoJSON(json))
                                        .map(json => {
                                            const isLayerExceedsMaxFileSize = json?.exceedFileMaxSize || false;
                                            const isAnnotationLayer = isAnnotation(json);
                                            if (isAnnotationLayer) {
                                                // annotation GeoJSON to layers
                                                return { name: "Annotations", features: importJSONToAnnotations(json), filename: json.filename};
                                            } else if (isLayerExceedsMaxFileSize) {
                                            // layers with size exceeds the max size limit
                                                return { ...json, filename: json.filename};
                                            }
                                            // other GeoJSON to layers
                                            return {...geoJSONToLayer(json), filename: json.filename};
                                        })
                                ),
                            maps: (result.maps || [])
                                .concat(
                                    jsonObjects.filter(json => isMap(json))

                                )
                        }), {})
                        .map(filesMap => ({
                            loading: false,
                            files: filesMap
                        }))
                        .catch(error => Rx.Observable.of({error, loading: false}))
                        .startWith({ loading: true})
                )
                    .startWith({}),
                (p1, p2) => ({
                    ...p1,
                    ...p2,
                    onDrop
                })
            ).combineLatest(
                warnings$
                    .scan((warnings = [], warning) => ([...warnings, warning]), [])
                    .startWith(undefined),
                (p1, warnings) => ({
                    ...p1,
                    warnings
                })
            );
        }

    )
);
