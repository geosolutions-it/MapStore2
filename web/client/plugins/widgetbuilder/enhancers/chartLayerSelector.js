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

import { castArray, isEmpty, isUndefined, get } from "lodash";

import { onEditorChange } from '../../../actions/widgets';
import { getDependantWidget } from "../../../utils/WidgetsUtils";

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
                ({ selected, layerValidationStream = s => s, setLayer = () => { }, dashboardSelectedService, dashboardServices, defaultSelectedService, defaultServices, ...props } = {}) =>
                    Rx.Observable.of(castArray(selected)?.map(s => toLayer(s, dashboardServices ? dashboardServices[dashboardSelectedService] : defaultServices[defaultSelectedService])))
                        .let((stream$) => layerValidationStream(stream$, props))
                        .switchMap(() =>
                            Rx.Observable.forkJoin(
                                selected.map(s => addSearchObservable(s, dashboardServices ? dashboardServices[dashboardSelectedService] : defaultServices[defaultSelectedService]))
                            )
                        )
                        .do(layers => setLayer(layers?.map(l=>({...l, visibility: !isUndefined(l.visibility) ? l.visibility : true}))))
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
    withProps(({selected, setSelected}) => ({
        getItems: (items) => items.map(i =>
            !isEmpty(selected)
                && i && i.record
                && selected.some(s => s.identifier === i.record.identifier)
                ? { ...i, selected: true }
                : i
        ),
        onItemClick: ({record} = {}, props, event) => {
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

const chartLayerSelector = compose(
    setDisplayName('ChartLayerSelector'),
    layerSelectorConnect,
    defaultProps({
        layerValidationStream: (stream$, props) => stream$.switchMap(layers =>
            Rx.Observable.forkJoin(layers.map(layer=> canGenerateCharts(layer)))
                .switchMap((resp) => {
                    let $observable = Rx.Observable.of(layers);
                    const dependantWidget = getDependantWidget({widgets: props?.widgets, dependenciesMap: get(props, 'editorData.dependenciesMap', {})});
                    if (resp.length && dependantWidget.widgetType === 'table') {
                        // Compare the dependant widget attributes with the selected layer(s)
                        // when the dependant widget is a table
                        const layersAttributes = resp.map(res => get(res[0], 'data.featureTypes[0].properties')?.map(p => p.name));
                        const dependantAttributes = get(dependantWidget, 'options.propertyName', []);
                        if (dependantAttributes.length && layersAttributes?.length ) {
                            const isDependantAttributesMatching =
                                layersAttributes.every(lAttrib => dependantAttributes.every(depAttrib => lAttrib.includes(depAttrib)));
                            $observable = isDependantAttributesMatching
                                ? $observable
                                : Rx.Observable.throw(new Error('attributesNotMatchingDescription'));
                        }
                    }
                    return $observable;
                })
        )
    }),
    withBackButton,
    layerSelector
);
export default chartLayerSelector;
