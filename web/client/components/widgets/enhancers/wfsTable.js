 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const {compose, withProps} = require('recompose');
const { getLayerJSONFeature, describeFeatureType} = require('../../../observables/wfs');
const propsStreamFactory = require('../../misc/enhancers/propsStreamFactory');
const Rx = require('rxjs');

const sameFilter = (f1, f2) => f1 === f2;
const sameOptions = (o1 = {}, o2 = {}) =>
    o1.propertyName === o2.propertyName;

const getLayerUrl = l => l && l.wpsUrl || (l.search && l.search.url) || l.url;
const dataRetrieveStream = $props => $props
    .filter(({ layer = {}, options }) => layer.name && options && options.propertyName)
    .distinctUntilChanged(
        ({ layer = {}, options = {}, filter }, newProps) =>
            getLayerUrl(layer) === getLayerUrl(layer)
            && (newProps.layer && layer.name === newProps.layer.name)
            && sameOptions(options, newProps.options)
            && sameFilter(filter, newProps.filter))
    .switchMap(
        ({
            layer = {},
            options,
            filter,
            onLoad = () => { },
            onLoadError = () => { }
        }) =>
            getLayerJSONFeature( layer, filter, {
                timeout: 15000,
                params: { propertyName: options.propertyName }
                // TODO totalFeatures
                // TODO sortOptions - default
            })
                .map((data) => ({
                    loading: false,
                    isAnimationActive: false,
                    error: undefined,
                    features: data.features,
                    pagination: {
                        totalFeatures: data.totalFeatures
                    }
                })).do(onLoad)
                .catch((e) => Rx.Observable.of({
                    loading: false,
                    error: e,
                    data: []
                }).do(onLoadError))
    );
const describeStream = props$ =>
    props$
        .distinctUntilChanged(({ layer: layer1 } = {}, { layer: layer2 } = {}) => getLayerUrl(layer1) === getLayerUrl(layer2))
        .switchMap( ({layer} = {}) => describeFeatureType({layer})
        .map(r =>({describeFeatureType: r.data}) ))
        .catch(e => Rx.Observable.of({
            loading: false,
            error: e
        }));

const dataStreamFactory = ($props) => {
    // TODO create event handler to trigger virtual scroll
    return describeStream($props)
        .combineLatest(
            dataRetrieveStream($props)
            .merge( ),
            (p1, p2) => ({
                ...p1,
                ...p2
            })
        )
    .startWith({ loading: true });
};
module.exports = compose(
    withProps( () => ({
        dataStreamFactory
    })),
    propsStreamFactory
);
