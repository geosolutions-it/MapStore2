/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import every from 'lodash/every';
import get from 'lodash/get';
import includes from 'lodash/includes';
import some from 'lodash/some';
import proj4 from 'proj4';
import { compose, createEventHandler, mapPropsStream } from 'recompose';
import Rx from 'rxjs';

import { FILE_TYPE_ALLOWED } from '../constants';

import {getConfigProp} from "../../../utils/ConfigUtils";
import {parseURN} from "../../../utils/CoordinatesUtils";
import {
    MIME_LOOKUPS,
    checkShapePrj,
    readJson,
    readZip,
    readDxf,
    recognizeExt,
    shpToGeoJSON
} from '../../../utils/FileUtils';
import {flattenImportedFeatures} from "../../../utils/LongitudinalProfileUtils";

/**
 * Checks if the file is allowed. Returns a promise that does this check.
 */
const checkFileType = (file) => {
    return new Promise((resolve, reject) => {
        const ext = recognizeExt(file.name);
        const type = file.type || MIME_LOOKUPS[ext];
        if (includes(FILE_TYPE_ALLOWED, type)) {
            resolve(file);
        } else {
            reject(new Error("FILE_NOT_SUPPORTED"));
        }
    });
};
/**
 * Create a function that return a Promise for reading file. The Promise resolves with an array of (json)
 */
const readFile = (onWarnings) => (file) => {
    const ext = recognizeExt(file.name);
    const type = file.type || MIME_LOOKUPS[ext];
    const projectionDefs = getConfigProp('projectionDefs') || [];
    const supportedProjections = (projectionDefs.length && projectionDefs.map(({code})  => code) || []).concat(["EPSG:4326", "EPSG:3857", "EPSG:900913"]);
    // [ ] change this to use filterCRSList
    if (type === 'application/json' || type === 'application/geo+json') {
        return readJson(file).then(f => {
            const projection = get(f, 'map.projection') ?? parseURN(get(f, 'crs'));
            if (projection) {
                const supportedProjection = proj4.defs(projection);
                if (supportedProjection) {
                    return [{...f, "fileName": file.name}];
                }
                throw new Error("PROJECTION_NOT_SUPPORTED");
            }
            return [{...f, "fileName": file.name}];
        });
    }
    if (type === 'application/x-zip-compressed' ||
        type === 'application/zip') {
        return readZip(file).then((buffer) => {
            return checkShapePrj(buffer)
                .then((warnings) => {
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
    if (type === 'image/x-dxf' || type === 'image/vnd.dxf') {
        return readDxf(file)
            .then(({entities}) => {
                const geoJSON = {
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: entities[0].vertices.map(entity => {
                            return [entity.x, entity.y];
                        })
                    }
                };
                if (entities[0].type === "LWPOLYLINE") {
                    return [{...geoJSON, "fileName": file.name, showProjectionCombobox: true}];
                }
                throw new Error("GEOMETRY_NOT_SUPPORTED");

            });
    }
    return null;
};

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
                    files => Rx.Observable.from(files)
                        .flatMap(checkFileType) // check file types are allowed
                        .flatMap(readFile(onWarnings)) // read files to convert to json
                        .map(res => {
                            return ({
                                showProjectionCombobox: !!res[0].showProjectionCombobox,
                                loading: false,
                                flattenFeatures: flattenImportedFeatures(res),
                                crs: res[0]?.crs?.properties?.name ?? 'EPSG:3857'
                            });
                        })
                        .catch(error => Rx.Observable.of({error, loading: false}))
                        .startWith({ loading: true, showProjectionCombobox: false})
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
