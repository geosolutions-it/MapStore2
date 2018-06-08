/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const { compose, withHandlers, mapPropsStream, createEventHandler} = require('recompose');
const FileUtils = require('../../../../utils/FileUtils');
const LayersUtils = require('../../../../utils/LayersUtils');

const JSZip = require('jszip');

const tryUnzip = (file) => {
    return FileUtils.readZip(file).then((buffer) => {
        var zip = new JSZip();
        return zip.loadAsync(buffer);
    });
};
const checkFileType = (file) => {
    return new Promise((resolve, reject) => {
        const ext = FileUtils.recognizeExt(file.name);
        const type = file.type || FileUtils.MIME_LOOKUPS[ext];
        if (type === 'application/x-zip-compressed'
            || type === 'application/zip'
            || type === 'application/vnd.google-earth.kml+xml'
            || type === 'application/vnd.google-earth.kmz'
            || type === 'application/gpx+xml'
            || type === 'application/json') {
            resolve(file);
        } else {
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
    if (type === 'application/vnd.google-earth.kml+xml') {
        return FileUtils.readKml(file).then((xml) => {
            return FileUtils.kmlToGeoJSON(xml);
        });
    }
    if (type === 'application/gpx+xml') {
        return FileUtils.readKml(file).then((xml) => {
            return FileUtils.gpxToGeoJSON(xml);
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
                    onWarnings('shapefile.error.missingPrj');
                }
                return FileUtils.shpToGeoJSON(buffer);
            });
        });
    }
    if (type === 'application/json') {
        return FileUtils.readJson(file).then(f => [f]);
    }
};

const isGeoJSON = json => json && json.features && json.features.length !== 0;
const isMap = json => json && json.version && json.map;
module.exports = compose(
    withHandlers({
        useFiles: ({ loadMap = () => { }, onClose = () => {}, setLayers = () => { }}) =>
            ({layers = [], maps = []}, warnings) => {
                const map = maps[0]; // only 1 map is allowed
                if (map) {
                    loadMap(map);
                }
                if (layers.length > 0) {
                    setLayers(layers, warnings); // TODO: warnings
                } else {
                    // close if loaded only the map
                    if (map) {
                        onClose();
                    }
                }
            }
    }),
    mapPropsStream(
        props$ => {
            const { handler: onDrop, stream: drop$ } = createEventHandler();
            const { handler: onWarnings, stream: warnings$} = createEventHandler();
            return props$.combineLatest(
                    drop$.switchMap(
                        files => Rx.Observable.from(files)
                            .switchMap(checkFileType) // check file types are allowed
                            .switchMap(readFile(onWarnings)) // read files to convert to json
                            .reduce((result, jsonObjects) => ({ // divide files by type
                                layers: (result.layers || [])
                                    .concat(
                                        jsonObjects.filter(json => isGeoJSON(json))
                                            .map(json => LayersUtils.geoJSONToLayer(json))
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
                    .scan((warnings = [], warning) => ({ warnings: [...warnings, warning] }))
                    .startWith({}),
                (p1, p2) => ({
                    ...p1,
                    ...p2
                })
            );
        }
    ),
    mapPropsStream(props$ => props$.merge(
        props$
            .distinctUntilKeyChanged('files')
            .filter(({files}) => files)
            .do(({ files, useFiles = () => { }, warnings = []}) => useFiles(files, warnings))
            .ignoreElements()
    ))
);
