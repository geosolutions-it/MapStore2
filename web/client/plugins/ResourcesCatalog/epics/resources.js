/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';

import { LOGOUT, LOGIN_SUCCESS } from '../../../actions/security';

import { setShowDetails, unloadResources } from '../actions/resources';

export const unloadCatalogResourcesOnAuthentication = (actions$) =>
    actions$.ofType(LOGOUT, LOGIN_SUCCESS)
        .switchMap(() => {
            return Rx.Observable.of(
                setShowDetails(false),
                unloadResources()
            );
        });

export default { unloadCatalogResourcesOnAuthentication };
