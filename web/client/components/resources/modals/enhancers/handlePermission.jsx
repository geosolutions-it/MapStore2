/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { branch, compose, mapPropsStream, withStateHandlers } from 'recompose';
import Rx from 'rxjs';

import GeoStoreDAO from '../../../../api/GeoStoreDAO';

/**
 * retrieves groups for permission handling and returns as props
 * @deprecated
 * @param {Object} API the API to use
 */
const retrieveGroups = (API) =>
    mapPropsStream(props$ =>
        props$.combineLatest(
            props$
                .take(1)
                .switchMap(({ user }) =>
                    Rx.Observable.defer(() => API.getAvailableGroups(user))
                        .map(availableGroups => ({ availableGroups }))
                        .startWith({ loading: true })
                )
                .startWith({})
                .catch( () => Rx.Observable.of({})),
            (props, overrides) => ({
                ...props,
                ...overrides
            })
        )
    );

/**
 * retrieves permission for the resource
 * @deprecated
 * @param {object} API the API to use
 */
const retrievePermission = (API) =>
    mapPropsStream(props$ =>
        props$.combineLatest(
            props$
            // trigger when resource changes
                .distinctUntilKeyChanged('resource')
                .pluck('resource')
                .filter(resource => resource.id)
                .pluck('id')
                .distinctUntilChanged()
                .switchMap(id =>
                    Rx.Observable.defer(() => API.getResourcePermissions(id))
                        .map(rules => ({ rules }))
                        .startWith({ loading: true })
                )
                .startWith({})
                .catch(() => Rx.Observable.of({})),
            (props, overrides) => ({
                ...props,
                ...overrides
            })
        )
    );
const manageLocalPermissionChanges = withStateHandlers(
    () => ({}),
    {
        onUpdateRules: () => (rules) => ({
            rules: rules
        })
    }
);
/**
 * @deprecated
 */
export default ( API = GeoStoreDAO ) => branch(
    ({ disablePermission }) => !disablePermission,
    compose(
        retrieveGroups(API),
        retrievePermission(API),
        manageLocalPermissionChanges
    )
);

