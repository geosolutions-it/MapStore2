/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const {featureTypeSelectedEpic, wfsQueryEpic, viewportSelectedEpic} = require('../../../epics/wfsquery');
const {getLayerFromId} = require('../../../selectors/layers');
const {createQuery, featureTypeSelected, layerSelectedForSearch, LAYER_SELECTED_FOR_SEARCH, FEATURE_TYPE_LOADED, FEATURE_CLOSE} = require('../../../actions/wfsquery');
const {clearChanges, setPermission, toggleTool} = require('../../../actions/featuregrid');
const {hasChangesSelector, hasNewFeaturesSelector} = require('../../../selectors/featuregrid');
module.exports = (plugins) => {
    var reducers = {
        map: require('../../../reducers/map'),
        mapConfig: require('../../../reducers/config'),
        locale: require('../../../reducers/locale'),
        controls: require('../../../reducers/controls'),
        layers: require('../../../reducers/controls'),
        query: require('../../../reducers/query')
    };
    return require('../../../stores/StandardStore')({}, reducers, {
        featureTypeSelectedEpic, wfsQueryEpic, viewportSelectedEpic,
        initLoadFeatureGridDemo: (action$, store) =>
            action$.ofType('MAP_CONFIG_LOADED', "FEATUREGRID_SAMPLE::SELECT_LAYER")
                .switchMap(({id = 'atlantis:poi'} = {}) => {
                    const state = store.getState();
                    if (hasChangesSelector(state) || hasNewFeaturesSelector(state)) {
                        return Rx.Observable.of(toggleTool("featureCloseConfirm", true))
                            .merge(action$.ofType(FEATURE_CLOSE).switchMap( () => Rx.Observable.of(
                                layerSelectedForSearch(id),
                                setPermission({canEdit: true}),
                                featureTypeSelected( 'http://demo.geo-solutions.it:80/geoserver/wfs', id),
                            )));
                    }
                    return Rx.Observable.of(
                        layerSelectedForSearch(id),
                        setPermission({canEdit: true}),
                        featureTypeSelected( 'http://demo.geo-solutions.it:80/geoserver/wfs', id),
                    );
                }),
        createFeatureGridDemoQuery: (action$, store) =>
            Rx.Observable.zip(
                action$.ofType(LAYER_SELECTED_FOR_SEARCH),
                action$.ofType(FEATURE_TYPE_LOADED)
            ).switchMap(([layer]) => Rx.Observable.of(
            clearChanges(),
            createQuery("http://demo.geo-solutions.it:80/geoserver/wfs", {
                        featureTypeName: getLayerFromId(store.getState(), layer.id).name,
                        groupFields: [

                        ],
                        filterFields: [],
                        pagination: {
                            maxFeatures: 20,
                            startIndex: 0
                        },
                        filterType: 'OGC',
                        ogcVersion: '1.1.0',
                        sortOptions: null,
                        hits: false
                      })
        ))
    }, plugins);
};
