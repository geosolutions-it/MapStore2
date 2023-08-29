/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


import Rx from 'rxjs';
import {ADD_PRINT_TRANSFORMER} from '../actions/print';
import { addTransformer } from '../utils/PrintUtils';


export const addPrintTransformerEpic = (action$) =>
    action$.ofType(ADD_PRINT_TRANSFORMER)
        .switchMap((action) => {
            const {name, transformer, position} = action;
            return Rx.Observable.of(
                addTransformer(name, transformer, position)
            );
        });

export default {
    addPrintTransformerEpic
};
