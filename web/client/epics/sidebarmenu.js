/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { keys, findIndex, get } from 'lodash';
import {SET_CONTROL_PROPERTIES, SET_CONTROL_PROPERTY, setControlProperty, TOGGLE_CONTROL} from '../actions/controls';
import ConfigUtils from "../utils/ConfigUtils";

const customExclusivePanels = get(ConfigUtils.getConfigProp('miscSettings'), 'exclusiveDockPanels', []);
const exclusiveDockPanels = ['measure', 'mapCatalog', 'mapTemplates', 'metadataexplorer', 'userExtensions', 'details', 'cadastrapp']
    .concat(...(Array.isArray(customExclusivePanels) ? customExclusivePanels : []));

export const resetOpenDockPanels = (action$, store) => action$
    .ofType(SET_CONTROL_PROPERTIES, SET_CONTROL_PROPERTY, TOGGLE_CONTROL)
    .filter(({control, property, properties = [], type}) => {
        const state = store.getState();
        const controlState = state.controls[control].enabled;
        switch (type) {
        case SET_CONTROL_PROPERTY:
        case TOGGLE_CONTROL:
            return (property === 'enabled' || !property) && controlState && exclusiveDockPanels.includes(control);
        default:
            return findIndex(keys(properties), prop => prop === 'enabled') > -1 && controlState && exclusiveDockPanels.includes(control);
        }
    })
    .switchMap(({control}) => {
        const actions = [];
        const state = store.getState();
        exclusiveDockPanels.forEach((controlName) => {
            const enabled = get(state, ['controls', controlName, 'enabled'], false);
            enabled && control !== controlName && actions.push(setControlProperty(controlName, 'enabled', null));
        });
        return Observable.from(actions);
    });

export default { resetOpenDockPanels };
