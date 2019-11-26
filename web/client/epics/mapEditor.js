/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Observable } from 'rxjs';
import { SHOW } from '../actions/mapEditor';
import { loadMapConfig, configureMap } from '../actions/config';
import {removeAllAdditionalLayers} from '../actions/additionallayers';
import {clearLayers} from '../actions/layers';
import {resetControls} from '../actions/controls';
import isObject from 'lodash/isObject';
import { getConfigUrl } from '../utils/ConfigUtils';


/**
 * On plugins show, handles the configuration of the map in the app state.
 * If map is an object shape {map, id} this is considered to be a valid map configuration and is added to the app state
 * If map is a number It's considered to be an id and loaded from the store.
 * If map is undefined the new map is loaded from the store
 */
export const mapEditorConfigureMapState = (action$) =>
    action$.ofType(SHOW)
        .switchMap(({ map}) => {
            let loadAction;
            if (isObject(map)) {
                const clonedMap = JSON.parse(JSON.stringify(map.data));
                // If not cloned gives an invariant violation because of ConfigUtils layer configuration modification
                loadAction = configureMap({map: clonedMap, version: 2}, map.id);
            } else {
                let mapId = !!map && map || "new";
                const { configUrl } = getConfigUrl({ mapId, config: null });
                mapId = mapId === "new" ? null : mapId;
                loadAction = loadMapConfig(configUrl, mapId);
            }
            return Observable.from([removeAllAdditionalLayers(), resetControls(), clearLayers(), loadAction]);
        });
