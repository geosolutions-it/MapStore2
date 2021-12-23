/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';

import { addCatalogService, ADD_CATALOG_SERVICE, changeSelectedService } from '@mapstore/actions/catalog';
import { SETUP } from '../actions/timeSeriesPlots';
import { timeSeriesCatalogServiceTitleSelector, timeSeriesCatalogServiceSelector } from '../selectors/timeSeriesPlots';

import {
    TIME_SERIES_VECTOR_LAYERS_ID
} from '../constants';

export const setUpTimeSeriesLayersService = (action$, store) =>
    action$.ofType(SETUP)
    .switchMap(({cfg}) => {
        const { timeSeriesCatalogService } = cfg;
        return Rx.Observable.of(addCatalogService(timeSeriesCatalogService));
    });

// export const selectTimeSeriesLayersService = (action$, { getState = () => {} }) =>
//     action$.ofType(ADD_CATALOG_SERVICE)
//     .filter(({service : { title }}) => title === timeSeriesCatalogServiceTitleSelector(getState()))
//     .switchMap(() => { 
//         const timeSeriesCatalogService = timeSeriesCatalogServiceSelector(getState());
//         return Rx.Observable.of(changeSelectedService(timeSeriesCatalogService));
//     });
