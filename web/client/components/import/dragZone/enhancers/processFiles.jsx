/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const { compose, mapPropsStream, createEventHandler} = require('recompose');
const { get, some, every } = require('lodash');
const FileUtils = require('../../../../utils/FileUtils');
const LayersUtils = require('../../../../utils/LayersUtils');
const ConfigUtils = require('../../../../utils/ConfigUtils');
const {isAnnotation} = require('../../../../utils/AnnotationsUtils');

const JSZip = require('jszip');

const tryUnzip = (file) => {
    return FileUtils.readZip(file).then((buffer) => {
        var zip = new JSZip();
        return zip.loadAsync(buffer);
    });
};

/**
 * Checks if the file is allowed. Returns a promise that does this check.
 */
const checkFileType = (file) => {
    return new Promise((resolve, reject) => {
        const ext = FileUtils.recognizeExt(file.name);
        const type = file.type || FileUtils.MIME_LOOKUPS[ext];
        if (type === 'application/x-zip-compressed'
            || type === 'application/zip'
            || type === 'application/vnd.google-earth.kml+xml'
            || type === 'application/vnd.google-earth.kmz'
            || type === 'application/gpx+xml'
            || type === 'application/json'
            || type === 'application/vnd.wmc') {
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
const readFile = (onWarnings) => (file) => {
    const ext = FileUtils.recognizeExt(file.name);
    const type = file.type || FileUtils.MIME_LOOKUPS[ext];
    const projectionDefs = ConfigUtils.getConfigProp('projectionDefs') || [];
    const supportedProjections = (projectionDefs.length && projectionDefs.map(({code})  => code) || []).concat(["EPSG:4326", "EPSG:3857", "EPSG:900913"]);
    if (type === 'application/vnd.google-earth.kml+xml') {
        return FileUtils.readKml(file).then((xml) => {
            return FileUtils.kmlToGeoJSON(xml);
        });
    }
    if (type === 'application/gpx+xml') {
        return FileUtils.readKml(file).then((xml) => {
            return FileUtils.gpxToGeoJSON(xml, file.name);
        });
    }
    if (type === 'application/vnd.google-earth.kmz') {
        return FileUtils.readKmz(file).then((xml) => {
            return FileUtils.kmlToGeoJSON(xml);
        });
    }
    if (type === 'application/x-zip-compressed' ||
        type === 'application/zip') {
        return FileUtils.readZip(file).then((buffer) => {
            return FileUtils.checkShapePrj(buffer).then((warnings) => {
                if (warnings.length > 0) {
                    onWarnings({type: 'warning', filename: file.name, message: 'shapefile.error.missingPrj'});
                }
                const geoJsonArr = FileUtils.shpToGeoJSON(buffer).map(json => ({ ...json, filename: file.name }));
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
        return FileUtils.readJson(file).then(f => {
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
    if (type === 'application/vnd.wmc') {
        return FileUtils.readWMC(file).then(config => [config]);
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
module.exports = compose(
    mapPropsStream(
        props$ => {
            const { handler: onDrop, stream: drop$ } = createEventHandler();
            const { handler: onWarnings, stream: warnings$} = createEventHandler();
            return props$.combineLatest(
                drop$.switchMap(
                    files => Rx.Observable.from(files)
                        .flatMap(checkFileType) // check file types are allowed
                        .flatMap(readFile(onWarnings)) // read files to convert to json
                        .reduce((result, jsonObjects) => ({ // divide files by type
                            layers: (result.layers || [])
                                .concat(
                                    jsonObjects.filter(json => isGeoJSON(json))
                                        .map(json => (isAnnotation(json) ?
                                            // annotation GeoJSON to layers
                                            { name: "Annotations", features: json?.features || [], filename: json.filename} :
                                            // other GeoJSON to layers
                                            {...LayersUtils.geoJSONToLayer(json), filename: json.filename}))
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
