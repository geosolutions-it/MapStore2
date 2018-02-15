 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const {compose, withProps} = require('recompose');
const { getFeature, describeFeatureType} = require('../../../observables/wfs');
const propsStreamFactory = require('../../misc/enhancers/propsStreamFactory');
const Rx = require('rxjs');

const sameFilter = (f1, f2) => f1 === f2;
const sameOptions = (o1 = {}, o2 = {}) =>
    o1.propertyName === o2.propertyName;

const getLayerUrl = l => l && l.wpsUrl || (l.search && l.search.url) || l.url;
const dataStreamFactory = ($props) =>
    $props
        .filter(({layer = {}, options}) => layer.name && options && options.propertyName)
        .distinctUntilChanged(
            ({layer={}, options = {}, filter}, newProps) =>
                getLayerUrl(layer) === getLayerUrl(layer)
                && (newProps.layer && layer.name === newProps.layer.name)
                && sameOptions(options, newProps.options)
                && sameFilter(filter, newProps.filter))
        .switchMap(
            ({layer={}, options, filter, onLoad = () => {}, onLoadError = () => {}}) =>
            Rx.Observable.forkJoin(
                    getFeature({ layer, featureType: layer.name, params: { propertyName: options.propertyName }, filter }, {
                        timeout: 15000
                    }),
                    describeFeatureType({layer})
            )
            .map(([response, describeFeatureType]) => ({
                    loading: false,
                    isAnimationActive: false,
                    error: undefined,
                    describeFeatureType,
                    features: response.data.features
                })).do(onLoad)
                .catch((e) => Rx.Observable.of({
                        loading: false,
                        error: e,
                        data: []
                    }).do(onLoadError)
                ).startWith({loading: true})
        );
module.exports = compose(
    withProps( () => ({
        dataStreamFactory
    })),
    propsStreamFactory
);
