/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { keys, findIndex } from 'lodash';
import { SET_CONTROL_PROPERTIES, SET_CONTROL_PROPERTY, TOGGLE_CONTROL } from '../actions/controls';
import {setLastActiveItem} from "../actions/sidebarmenu";

export const pickActivatedControlItem = (action$, store) => action$
    .ofType(SET_CONTROL_PROPERTIES, SET_CONTROL_PROPERTY, TOGGLE_CONTROL)
    .filter(({control, property, properties = [], type}) => {
        const state = store.getState();
        const controlState = state.controls[control].enabled;
        switch (type) {
        case SET_CONTROL_PROPERTY:
        case TOGGLE_CONTROL:
            return (property === 'enabled' || !property) && controlState;
        default:
            return findIndex(keys(properties), prop => prop === 'enabled') > -1 && controlState;
        }
    })
    .switchMap(({control}) => {
        return Observable.of(setLastActiveItem(control));
    });

export default { pickActivatedControlItem };
