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
        if (type === 'application/x-zip-compressed' ||
            type === 'application/zip' ||
            type === 'application/vnd.google-earth.kml+xml' ||
            type === 'application/vnd.google-earth.kmz' ||
            type === 'application/gpx+xml') {
            resolve(file);
        } else {
            tryUnzip(file).then(() => resolve(file)).catch(reject);
        }
    });
};

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
};

const isGeoJSON = json => json.features.length !== 0;
const isMap = json => json.version && json.map;
module.exports = compose(
    withHandlers(({
        loadMap = () => {},
        selectLayers = () => {}
    }) => ({
        useFiles: ({layers = [], maps = []}) => {
            const map = maps[0]; // only 1 map is allowed
            if (map) {
                loadMap(map);
            }
            if (layers.length > 0) {
                selectLayers(layers);
            }
        }
    })),
    mapPropsStream(
        props$ => {
            const { handler: onDrop, stream: drop$ } = createEventHandler();
            const { handler: onWarnings, stream: warnings$} = createEventHandler(); // TODO: manage warning (missing prj file)
            return props$.combineLatest(
                    drop$.switchMap(
                        files => Rx.Observable.from(files)
                            .switchMap(checkFileType) // check file types are allowed
                            .switchMap(readFile(onWarnings)) // read files to convert to json
                            .reduce((result, json) => ({ // divide files by type
                                layers: (result.layers || []).concat(isGeoJSON(json) ? [LayerUtils.geoJSONToLayer(json)] : []),
                                maps: (result.maps || []).concat(isMap(json) ? [json] : [])
                            }), {})
                            .withLatestFrom(props$.pluck('useFiles'))
                            .do(([json, useFiles]) => { // trigger callback for to manage files
                                if (useFiles) {
                                    useFiles(json);
                                }
                            }) // call the proper function to use the json file read
                            .ignoreElements()
                            .catch(error => Rx.Observable.of({error}))
                            .concat(Rx.Observable.of({loading: false}))
                            .startWith({ loading: true})
                ).startWith({}),
                (p1, p2) => ({
                    ...p1,
                    ...p2,
                    onDrop
                })
            );
        }
    )
);
