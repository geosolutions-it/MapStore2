/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {SET_CONTROL_PROPERTY, TOGGLE_CONTROL} from "../actions/controls";
import {isActiveSelector} from "../selectors/userextensions";
import {Observable} from "rxjs";
import {closeFeatureGrid} from "../actions/featuregrid";
import {hideMapinfoMarker, purgeMapInfoResults} from "../actions/mapInfo";

export const openUserExtensionsEpic = (action$, store) =>
    action$.ofType(SET_CONTROL_PROPERTY, TOGGLE_CONTROL)
        .filter((action) => action.control === "userExtensions" && isActiveSelector(store.getState()))
        .switchMap(() => {
            return Observable.of(closeFeatureGrid(), purgeMapInfoResults(), hideMapinfoMarker());
        });
