/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const { Observable } = require('rxjs');
const { updateLayerDimension, changeLayerProperties, ADD_LAYER} = require('../actions/layers');
const {MAP_CONFIG_LOADED} = require('../actions/config');
const { error } = require('../actions/notifications');

const { SET_CURRENT_TIME, MOVE_TIME, SET_OFFSET_TIME, updateLayerDimensionData, setCurrentTime, setCurrentOffset} = require('../actions/dimension');
const { selectLayer, autoselect } = require('../actions/timeline');
const { layersWithTimeDataSelector, offsetTimeSelector, currentTimeSelector } = require('../selectors/dimension');
const { describeDomains, getMultidimURL } = require('../api/MultiDim');
const {
    domainsToDimensionsObject
} = require('../utils/TimeUtils');

const { pick, find, get, flatten } = require('lodash');


const DESCRIBE_DOMAIN_OPTIONS = {
    expandLimit: 10 // TODO: increase this limit to max client allowed
};


const getTimeMultidimURL = (l = {}) => get(find(l.dimensions || [], d => d && d.source && d.source.type === "multidim-extension"), "source.url");
module.exports = {
    /**
     * Sync current time param of the layer with the current time element
     */
    updateLayerDimensionOnCurrentTimeSelection: (action$, { getState = () => { } } = {}) =>
        action$.ofType(SET_CURRENT_TIME, SET_OFFSET_TIME, MOVE_TIME).switchMap(() => {
            const currentTime = currentTimeSelector(getState());
            const offsetTime = offsetTimeSelector(getState());
            const time = offsetTime ? `${currentTime}/${offsetTime}` : currentTime;
            return Observable.of(updateLayerDimension('time', time));
        }),

    /**
     * Check the presence of Multidimensional API extension, then setup layers properly.
     * Updates also current dimension state
     */
    queryMultidimensionalAPIExtensionOnAddLayer: action$ =>
        action$
            .ofType(ADD_LAYER)
            .filter(
                ({ layer = {} } = {}) => layer.id && layer.url && layer.name && (layer.type === "wms" || layer.type === "wmts")
            )
            // find out possible multidim URL
            // TODO: find out a better way to extract or discover multidim URL
            .map(({ layer = {} } = {}) => ({ layer, multidimURL: getMultidimURL(layer)}))
            // every add layer has it's own flow, this is why it uses
            .flatMap(({ layer = {}, multidimURL } = {}) =>
                describeDomains(multidimURL, layer.name, undefined, DESCRIBE_DOMAIN_OPTIONS)
                    .switchMap( domains => {
                        const dimensions = domainsToDimensionsObject(domains, multidimURL) || [];
                        if (dimensions && dimensions.length > 0) {
                            /**
                             * updating the time object in state.layers (from describeDomains),
                             * while maintaining other dimensions information in state.layer,
                             * it also creates a list of dimensions (from describeDomains) in state.dimensions.
                             *  */
                            const timeDimensionData = find(dimensions, d => d.name === 'time');
                            if (timeDimensionData) {
                                const newDimensions = [...(layer.dimensions || []).filter(dimension => dimension.name !== 'time'), pick(timeDimensionData, ['source', 'name'])];
                                return Observable.of(
                                    changeLayerProperties(layer.id, {
                                        dimensions: newDimensions
                                    }),
                                    ...flatten(dimensions.map(d => [updateLayerDimensionData(layer.id, d.name, d), autoselect()])));
                            }

                        }
                        return Observable.empty();
                    })
                    // no multi-dimension support
                    .catch(() => Observable.empty()) ),
    /**
     * Updates dimension state for layers that has multidimensional extension.
     */
    updateLayerDimensionDataOnMapLoad: (action$, {getState = () => {}} = {}) =>
        action$.ofType(MAP_CONFIG_LOADED).switchMap( ({config = {}}) => {
            const layers = layersWithTimeDataSelector(getState());
            const layersWithMultidim = layers.filter(l =>
                l && l.dimensions && find(l.dimensions, d => d && d.source && d.source.type === "multidim-extension")); // layers with dimension and multidimensional extension

            const selectedLayer = config.timelineData?.selectedLayer;
            const currentTime = config.dimensionData?.currentTime;
            const offsetTime = config.dimensionData?.offsetTime;

            return (currentTime ?
                Observable.of(
                    // restore states of timeline and dimension from map config
                    ...(selectedLayer ? [selectLayer(selectedLayer)] : []),
                    setCurrentTime(currentTime),
                    setCurrentOffset(offsetTime)
                ) : Observable.empty()
            )
                .concat(Observable.from(layersWithMultidim)
                    // one flow for each dimension
                    .mergeMap(l =>
                        describeDomains(getTimeMultidimURL(l), l.name, undefined, DESCRIBE_DOMAIN_OPTIONS)
                            .switchMap( domains =>
                                Observable.from(flatten(domainsToDimensionsObject(domains, getTimeMultidimURL(l))
                                    .map(d => [
                                        updateLayerDimensionData(l.id, d.name, d),
                                        ...(!currentTime ? [autoselect()] : [])
                                    ]))
                                )
                            )
                            .catch(() =>
                                Observable.of(error({
                                    uid: "error_with_timeline_update",
                                    title: "timeline.errors.multidim_error_title",
                                    message: "timeline.errors.multidim_error_message"
                                })).delay(2000)
                            )
                    )
                );
        })
};
