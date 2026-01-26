/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import { connect } from 'react-redux';
import { compose, defaultProps, setDisplayName, withState, mapPropsStream, withProps } from 'recompose';
import { castArray, isEmpty, isUndefined } from 'lodash';

import withBackButton from './withBackButton';
import { toLayer, addSearchObservable } from './layerSelector';
import { onEditorChange } from '../../../actions/widgets';
import canGenerateFilter from '../../../observables/widgets/canGenerateFilter';

const layerSelectorConnect = connect(() => ({}), {
    onLayerChoice: (...args) => {
        return onEditorChange(...args);
    },
    onResetChange: onEditorChange
});

const layerSelector = compose(
    withState('selected', "setSelected", null),
    withState('layer', "setLayer", null),
    mapPropsStream(props$ =>
        props$.distinctUntilKeyChanged('selected').filter(({ selected } = {}) => selected)
            .switchMap(
                ({ selected, layerValidationStream = s => s, setLayer = () => { }, dashboardSelectedService, dashboardServices, defaultSelectedService, defaultServices, ...props } = {}) =>
                    Rx.Observable.of(castArray(selected)?.map(s => toLayer(s, dashboardServices ? dashboardServices[dashboardSelectedService] : defaultServices[defaultSelectedService])))
                        .let((stream$) => layerValidationStream(stream$, props))
                        .switchMap(() =>
                            Rx.Observable.forkJoin(
                                selected.map(s => addSearchObservable(s, dashboardServices ? dashboardServices[dashboardSelectedService] : defaultServices[defaultSelectedService]))
                            )
                        )
                        .do(layers => setLayer(layers?.map(l => ({ ...l, visibility: !isUndefined(l.visibility) ? l.visibility : true }))))
                        .mapTo({ canProceed: true })
                        .catch((error) =>
                            Rx.Observable.of({
                                layerError: `widgets.builder.errors.${error?.code ? 'noWidgetsAvailableDescription' : error?.message}`,
                                canProceed: false
                            })
                        )
            ).startWith({ canProceed: true })
            .combineLatest(props$, ({ canProceed, layerError } = {}, props) => ({
                layerError,
                canProceed,
                ...props
            }))
    ),
    withProps(({ selected, setSelected }) => ({
        getItems: (items) => items.map(i =>
            !isEmpty(selected)
                && i && i.record
                && selected.some(s => s.identifier === i.record.identifier)
                ? { ...i, selected: true }
                : i
        ),
        onItemClick: ({ record } = {}, props, event) => {
            if (event.ctrlKey || event.metaKey) {
                const selectedArray = castArray(selected);
                if (isEmpty(selected)) {
                    return setSelected(castArray(record));
                }
                const present = selectedArray.find((s) => s?.identifier === record?.identifier);
                if (present) {
                    return setSelected(selectedArray.filter(s => s?.identifier !== record?.identifier));
                }
                return setSelected(selectedArray.concat(record));
            }
            return setSelected(castArray(record));
        }
    }))
);

const filterLayerSelector = compose(
    setDisplayName('FilterLayerSelector'),
    layerSelectorConnect,
    defaultProps({
        layerValidationStream: stream$ =>
            stream$
                .switchMap(layers =>
                    Rx.Observable.forkJoin(layers.map(layer=> canGenerateFilter(layer)))
                )
    }),
    withBackButton,
    layerSelector
);

export default filterLayerSelector;

