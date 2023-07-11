import { Observable } from 'rxjs';
import {
    preprocess as commonPreprocess
} from './common';

import { geoJSONToLayer } from '../../utils/LayersUtils';

export const preprocess = commonPreprocess;
export const validate = (service) => Observable.of(service);
export const testService = (service) => Observable.of(service);
export const textSearch = (url, startPosition, maxRecords, text) => {
    return fetch(url).then((res) => res.json()).then((json) => {
        const records = [{
            title: text,
            url: url,
            type: 'geojson',
            name: text,
            ...json
        }];
        return {
            numberOfRecordsMatched: records.length,
            numberOfRecordsReturned: records.length,
            records: records
        };
    });
};

export const getCatalogRecords = (result) => {
    return result.records;
};

export const getLayerFromRecord = (record, options, asPromise) => {
    const layer = geoJSONToLayer(record);
    return asPromise ? Promise.resolve(layer) : layer;
};
