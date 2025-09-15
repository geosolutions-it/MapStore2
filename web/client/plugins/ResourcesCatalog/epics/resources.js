/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';

import { LOGOUT } from '../../../actions/security';

import { unloadResources } from '../actions/resources';

export const unloadCatalogResourcesOnLogout = (actions$) =>
    actions$.ofType(LOGOUT)
        .switchMap(() => {
            return Rx.Observable.of(
                unloadResources()
            );
        });

export default { unloadCatalogResourcesOnLogout };
