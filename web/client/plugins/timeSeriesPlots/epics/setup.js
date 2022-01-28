/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import get from 'lodash/get';

import { addCatalogService, ADD_CATALOG_SERVICE, changeSelectedService } from '@mapstore/actions/catalog';
import { SETUP, TEAR_DOWN, toggleSelectionTool } from '../actions/timeSeriesPlots';
import { timeSeriesCatalogServiceTitleSelector, timeSeriesCatalogServiceSelector, timePlotsDataSelector } from '../selectors/timeSeriesPlots';

import { CONTROL_NAME, MOUSEMOVE_EVENT } from '../constants';
import { hideMapinfoMarker, toggleMapInfoState } from '@mapstore/actions/mapInfo';
import { registerEventListener, unRegisterEventListener } from '@mapstore/actions/map';
import { cleanPopups } from '@mapstore/actions/mapPopups';
import { registerCustomSaveHandler } from '../../../selectors/mapsave';
import { createStructuredSelector } from 'reselect';

import {
    TIME_SERIES_VECTOR_LAYERS_ID
} from '../constants';

export const setUpTimeSeriesLayersService = (action$, store) =>
    action$.ofType(SETUP)
    .switchMap(({cfg}) => {
        const { timeSeriesCatalogService } = cfg;
        const mapInfoEnabled = get(store.getState(), "mapInfo.enabled");
        registerCustomSaveHandler('timeSeriesPlots', createStructuredSelector({
            timePlotsData: timePlotsDataSelector
        }));
        return Rx.Observable.from([
            addCatalogService(timeSeriesCatalogService)
        ]).concat([...(mapInfoEnabled ? [toggleMapInfoState(), hideMapinfoMarker()] : [])]);
    });

export const timeSeriesPlotsTearDown = (action$, { getState = () => {} }) => 
    action$.ofType(TEAR_DOWN).switchMap(() =>
        Rx.Observable.from([
            toggleSelectionTool(),
            cleanPopups(),
            unRegisterEventListener(MOUSEMOVE_EVENT, CONTROL_NAME) // Reset map's mouse event trigger
        ])
        .concat([...(!get(getState(), "mapInfo.enabled") ? [toggleMapInfoState()] : [])])
    );