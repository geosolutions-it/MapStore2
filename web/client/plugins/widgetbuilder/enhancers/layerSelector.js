/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const {compose, withState, mapPropsStream} = require('recompose');
const { addSearch } = require('../../../observables/wms');
const { recordToLayer } = require('../../../utils/CatalogUtils');

/**
 * enhancer for CompactCatalog (or a container) to validate a selected record,
 * convert it to layer and return as prop. Intercepts also validation errors, setting
 * canProceed = false and error as props.
 * TODO: this can become a more general validate enhancer
 */
module.exports = compose(
    withState('selected', "setSelected", null),
    withState('layer', "setLayer", null),
    mapPropsStream(props$ =>
        props$.distinctUntilKeyChanged('selected').filter(({ selected } = {}) => selected)
            .switchMap(
                ({ selected, layerValidationStream = s => s, setLayer = () => { } } = {}) =>
                    Rx.Observable.of(recordToLayer(selected))
                        .let(layerValidationStream)
                        .switchMap(() => addSearch(recordToLayer(selected)))
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
