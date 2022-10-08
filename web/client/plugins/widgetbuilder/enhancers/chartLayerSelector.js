/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';
import { connect } from 'react-redux';
import { compose, defaultProps, setDisplayName, withState, mapPropsStream, withProps } from 'recompose';

import withBackButton from './withBackButton';
import { toLayer, addSearchObservable } from './layerSelector';
import canGenerateCharts from '../../../observables/widgets/canGenerateCharts';

import { castArray, isEmpty, isUndefined } from "lodash";

import { onEditorChange } from '../../../actions/widgets';

const layerSelectorConnect = connect(() => ({}), {
    onLayerChoice: (...args) => onEditorChange(...args),
    onResetChange: onEditorChange
});

/**
 * enhancer for CompactCatalog (or a container) to validate a selected record,
 * convert it to layer and return as prop. Intercepts also validation errors, setting
 * canProceed = false and error as props.
 */
const layerSelector = compose(
    withState('selected', "setSelected", null),
    withState('layer', "setLayer", null),
    mapPropsStream(props$ =>
        props$.distinctUntilKeyChanged('selected').filter(({ selected } = {}) => selected)
            .switchMap(
                ({ selected, layerValidationStream = s => s, setLayer = () => { }, dashboardSelectedService, dashboardServices, defaultSelectedService, defaultServices } = {}) =>
                    Rx.Observable.of(castArray(selected)?.map(s => toLayer(s, dashboardServices ? dashboardServices[dashboardSelectedService] : defaultServices[defaultSelectedService])))
                        .let(layerValidationStream)
                        .switchMap(() =>
                            Rx.Observable.forkJoin(
                                selected.map(s => addSearchObservable(s, dashboardServices ? dashboardServices[dashboardSelectedService] : defaultServices[defaultSelectedService]))
                            )
                        )
                        .do(layers => setLayer(layers?.map(l=>({...l, visibility: !isUndefined(l.visibility) ? l.visibility : true}))))
                        .mapTo({ canProceed: true })
                        .catch((error) => Rx.Observable.of({ error, canProceed: false }))
            ).startWith({ canProceed: true })
            .combineLatest(props$, ({ canProceed, error } = {}, props) => ({
                error,
                canProceed,
                ...props
            }))
    ),
    withProps(({selected, setSelected, layers}) => ({
        getItems: (items) => items.map(i =>
            !isEmpty(selected)
                && i && i.record
                && selected.some(s => s.identifier === i.record.identifier)
                ? { ...i, selected: true }
                : !isEmpty(layers)
                && layers.some(l => i?.record?.identifier === l.name)
                    ? { ...i, className: 'disabled' }
                    : i
        ),
        onItemClick: ({record} = {}, props, event) => {
            if (event.ctrlKey) {
                return setSelected(isEmpty(selected)
                    ? castArray(record)
                    : castArray(selected).concat(record));
            }
            return setSelected(castArray(record));
        }
    }))
);

const chartLayerSelector = compose(
    setDisplayName('ChartLayerSelector'),
    layerSelectorConnect,
    defaultProps({
        layerValidationStream: stream$ => stream$.switchMap(layers =>
            layers.map(layer=> canGenerateCharts(layer))
        )
    }),
    withBackButton,
    layerSelector
);
export default chartLayerSelector;
