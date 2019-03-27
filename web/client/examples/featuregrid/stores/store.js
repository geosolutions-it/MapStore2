/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const {featureTypeSelectedEpic, wfsQueryEpic, viewportSelectedEpic, redrawSpatialFilterEpic} = require('../../../epics/wfsquery');
const {getLayerFromId} = require('../../../selectors/layers');
const {layerSelectedForSearch, LAYER_SELECTED_FOR_SEARCH, CLOSE_FEATURE_GRID} = require('../../../actions/wfsquery');
const {browseData} = require('../../../actions/layers');
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
        featureTypeSelectedEpic, wfsQueryEpic, viewportSelectedEpic, redrawSpatialFilterEpic,
        initLoadFeatureGridDemo: (action$, store) =>
            action$.ofType('MAP_CONFIG_LOADED', "FEATUREGRID_SAMPLE::SELECT_LAYER")
                .switchMap(({id = 'atlantis:poi'} = {}) => {
                    const state = store.getState();
                    if (hasChangesSelector(state) || hasNewFeaturesSelector(state)) {
                        return Rx.Observable.of(toggleTool("featureCloseConfirm", true))
                            .merge(action$.ofType(CLOSE_FEATURE_GRID).switchMap( () => Rx.Observable.of(
                                layerSelectedForSearch(id),
                                setPermission({canEdit: true})
                            )));
                    }
                    return Rx.Observable.of(
                        layerSelectedForSearch(id),
                        setPermission({canEdit: true})
                    );
                }),
        createFeatureGridDemoQuery: (action$, store) =>
            action$.ofType(LAYER_SELECTED_FOR_SEARCH)
                .switchMap((layer) => Rx.Observable.of(
                    clearChanges(),
                    browseData({
                        ...getLayerFromId(store.getState(), layer.id)
                    })
                ))
    }, plugins);
};
