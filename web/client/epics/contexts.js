/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from "rxjs";
import {MAPS_LIST_LOADING} from "../actions/maps";
import {searchContexts} from "../actions/contextmanager";

export const searchContextsOnMapSearch = action$ =>
    action$.ofType(MAPS_LIST_LOADING)
        .switchMap(({ searchText }) => Rx.Observable.of(searchContexts(searchText)));
