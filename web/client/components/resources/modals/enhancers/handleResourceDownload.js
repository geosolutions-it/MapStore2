/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const { getResource } = require('../../../../api/persistence');

const { mapPropsStream } = require('recompose');
module.exports = mapPropsStream(props$ => {
    return props$.combineLatest(
        props$
            .pluck('resource')
            .filter(res => res && res.id)
            .distinctUntilChanged()
            .switchMap(res =>
                getResource(res.id, { withData: false, includeAttributes: true })
                    .map(resource => ({
                        loading: false,
                        resource
                    }))
                    .startWith({ loading: true, resource: false })
                    .catch(e => Rx.Observable.of({ loading: false, errors: [e] }))
            )
            .startWith({}),
        (p1, p2) => ({
            ...p1,
            ...p2
        })
    );
});
