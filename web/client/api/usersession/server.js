/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {Observable} from "rxjs";
import isString from "lodash/isString";
import { error } from '../../actions/notifications';
import { createResource, createCategory, updateResource, getResourceDataByName, getResourceIdByName, deleteResource }
    from '../persistence';

const buildResource = (name, user, session) => ({
    category: 'USERSESSION',
    data: session,
    metadata: {
        name,
        attributes: {
            user
        }
    }
});

/**
 * User Session Persistence Provider based on standard mapstore peristence API.
 */
export default {
    getSession: name => Observable.forkJoin(
        getResourceIdByName("USERSESSION", name),
        getResourceDataByName("USERSESSION", name)
    ).catch(() => {
        return Observable.of([null, null]);
    }),
    writeSession: (id, name, user, session) => {
        const resource = buildResource(name, user, session);
        return id ? updateResource({...resource, id}) : createResource(resource).catch((resp, stream$) => {
            const { status, data } = resp;
            if (status === 404 && isString(data) && data.indexOf('Resource Category not found') > -1) {
                return createCategory('USERSESSION').switchMap(() => stream$.skip(1))
                    .catch(() => Observable.of(error({
                        title: 'userSession.saveErrorNotification.titleContext',
                        message: 'userSession.saveErrorNotification.categoryError',
                        position: "tc",
                        autoDismiss: 5,
                        values: {
                            categoryName: 'USERSESSION'
                        }
                    })));
            }
            return resp;
        });
    },
    removeSession: id => deleteResource({id}).mergeAll().map(([r]) => r.data)
};
