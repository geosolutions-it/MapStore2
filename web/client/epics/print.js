/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


import Rx from 'rxjs';
import { ADD_PRINT_TRANSFORMER, printTransformerAdded } from '../actions/print';
import { addTransformer } from '../utils/PrintUtils';


export const addPrintTransformerEpic = (action$) =>
    action$.ofType(ADD_PRINT_TRANSFORMER)
        .switchMap((action) => {
            addTransformer(action.name, action.transformer, action.position);
            return Rx.Observable.of(printTransformerAdded(action.name));
        });

export default {
    addPrintTransformerEpic
};
