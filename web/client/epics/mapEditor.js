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
import {changeVisualizationMode} from '../actions/maptype';
import isObject from 'lodash/isObject';
import { getConfigUrl } from '../utils/ConfigUtils';
import { VisualizationModes } from '../utils/MapTypeUtils';

/**
 * On plugins show, handles the configuration of the map in the app state.
 * If map is an object shape {map, id} this is considered to be a valid map configuration and is added to the app state
 * If map is a number It's considered to be an id and loaded from the store.
 * If map is undefined the new map is loaded from the store
 */
export const mapEditorConfigureMapState = (action$) =>
    action$.ofType(SHOW)
        .switchMap(({ map}) => {
            let loadActions = [];
            if (isObject(map)) {
                const { visualizationMode = VisualizationModes._2D, ...clonedMap } = JSON.parse(JSON.stringify(map.data));
                // If not cloned gives an invariant violation because of ConfigUtils layer configuration modification
                loadActions.push(configureMap({map: clonedMap, version: 2}, map.id));
                loadActions.push(changeVisualizationMode(visualizationMode));
            } else {
                let mapId = !!map && map || "new";
                const { configUrl } = getConfigUrl({ mapId, config: null });
                mapId = mapId === "new" ? null : mapId;
                loadActions.push(loadMapConfig(configUrl, mapId));
            }
            return Observable.from([removeAllAdditionalLayers(), resetControls(), clearLayers(), ...loadActions]);
        });
