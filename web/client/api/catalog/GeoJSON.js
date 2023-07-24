import { Observable } from 'rxjs';
import {
    preprocess as commonPreprocess
} from './common';
import axios from '../../libs/ajax';

import { geoJSONToLayer } from '../../utils/LayersUtils';

export const preprocess = commonPreprocess;
export const validate = (service) => Observable.of(service);
export const testService = (service) => Observable.of(service);
export const textSearch = (url, startPosition, maxRecords, text) => {
    return axios.get(url).then(({data}) => {
        const records = [{
            title: text,
            url: url,
            type: 'geojson',
            name: text,
            ...data
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
    const layer = record ? geoJSONToLayer(record) : null;
    return asPromise ? Promise.resolve(layer) : layer;
};
