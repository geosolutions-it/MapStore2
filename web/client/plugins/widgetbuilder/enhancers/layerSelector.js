/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';

import { compose, withState, mapPropsStream } from 'recompose';
import isUndefined from 'lodash/isUndefined';
import { addSearch } from '../../../observables/wms';
import API from '../../../api/catalog';

// layers like tms or wmts don't need the recordToLayer conversion
export const toLayer = (r, service) => {

    return ["tms", "wfs"].includes(service?.type) // for tms and wfs the layer is ready
        ? {
            ...r,
            search: r.type === 'wfs' ? {
                url: r.url,
                type: "wfs"
            } : undefined
        }
        // the type wms is default (for csw and wms), wmts have to be passed. // TODO: improve and centralize more
        : API[service?.type || 'wms'].getLayerFromRecord(r, { service });
};

// checks for tms, wmts & wfs, in order to skip addSearch
export const addSearchObservable = (selected, service) => ["tms", "wmts", "wfs"].includes(service?.type) ? Rx.Observable.of(toLayer(selected, service)) : addSearch(toLayer(selected, service));

/**
 * enhancer for CompactCatalog (or a container) to validate a selected record,
 * convert it to layer and return as prop. Intercepts also validation errors, setting
 * canProceed = false and error as props.
 * TODO: this can become a more general validate enhancer
 */
export default compose(
    withState('selected', "setSelected", null),
    withState('layer', "setLayer", null),
    mapPropsStream(props$ =>
        props$.distinctUntilKeyChanged('selected').filter(({ selected } = {}) => selected)
            .switchMap(
                ({ selected, layerValidationStream = s => s, setLayer = () => { }, dashboardSelectedService, dashboardServices, defaultSelectedService, defaultServices } = {}) =>
                    Rx.Observable.of(toLayer(selected, dashboardServices ? dashboardServices[dashboardSelectedService] : defaultServices[defaultSelectedService]))
                        .let(layerValidationStream)
                        .switchMap(() => addSearchObservable(selected, dashboardServices ? dashboardServices[dashboardSelectedService] : defaultServices[defaultSelectedService]))
                        .do(l => setLayer({...l, visibility: !isUndefined(l.visibility) ? l.visibility : true}))
                        .mapTo({ canProceed: true })
                        .catch((error) => Rx.Observable.of({ error, canProceed: false }))
            ).startWith({ canProceed: true })
            .combineLatest(props$, ({ canProceed, error } = {}, props) => ({
                error,
                canProceed,
                ...props
            })
            )
    )
);
