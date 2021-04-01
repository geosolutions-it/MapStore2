/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';

import { compose, withState, mapPropsStream } from 'recompose';
import { addSearch } from '../../../observables/wms';
import { recordToLayer } from '../../../utils/CatalogUtils';

// layers like tms or tileprovider don't need the recordToLayer convertion
const toLayer = r => ["tileprovider", "wfs"].includes(r.type) ? r : recordToLayer(r);
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
                ({ selected, layerValidationStream = s => s, setLayer = () => { } } = {}) =>
                    Rx.Observable.of(toLayer(selected))
                        .let(layerValidationStream)
                        .switchMap(() => selected.provider ? Rx.Observable.of(selected) : addSearch(toLayer(selected)))
                        .do(l => setLayer(l))
                        .mapTo({ canProceed: true })
                        .catch((error) => Rx.Observable.of({ error, canProceed: false }))
            ).startWith({})
            .combineLatest(props$, ({ canProceed, error } = {}, props) => ({
                error,
                canProceed,
                ...props
            })
            )
    )
);
