/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';

import { getLayerJSONFeature } from '../../../../observables/wfs';
import { getCurrentPaginationOptions, updatePages } from '../../../../utils/FeatureGridUtils';

/**
 * Create an operator that resonds to a fetch data trigger event to retrives data on scroll.
 * @param {Observable} pages$ the stream of virtual scroll pages requests
 * @returns a function that can be merged with stream of
 * props to retrieve data using virtual scroll.
 */
export default pages$ => props$ => props$.switchMap(({
    layer = {},
    size = 20,
    maxStoredPages = 5,
    filter,
    options = {},
    sortOptions,
    pages,
    features = [],
    onLoad = () => { },
    onLoadError = () => { }
}) => pages$.switchMap(({ pagesRange, pagination = {} }, { }) => getLayerJSONFeature(layer, filter, {
    ...getCurrentPaginationOptions(pagesRange, pages, size),
    sortOptions: sortOptions,
    timeout: 15000,
    totalFeatures: pagination.totalFeatures, // this is needed to allow workaround of GEOS-7233
    propertyName: options.propertyName,
    viewParams: options.viewParams
    // TODO: defaultSortOptions - to skip primary-key issues
})
    .do(data => onLoad({
        ...updatePages(data, pagesRange, { pages, features }, { ...getCurrentPaginationOptions(pagesRange, pages, size), size, maxStoredPages }),
        pagination: {
            totalFeatures: data.totalFeatures
        }
    }))
    .map(() => ({
        loading: false
    }))
    .catch((e) => Rx.Observable.of({
        loading: false,
        error: e
    }).do(onLoadError))
    .startWith({
        loading: true
    })
));
