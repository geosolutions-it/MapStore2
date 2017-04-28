/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {ADD_LAYER, changeLayerProperties} = require('../actions/layers');
const Rx = require('rxjs');
const assign = require('object-assign');
const WFS = require('../api/WFS');
const WMS = require('../api/WMS');
const _ = require('lodash');

function getGeometryField(layer) {
    return WFS.describeFeatureType(layer.url, layer.name).then((describeFeatureType) => {
        const types = _.get(describeFeatureType, "complexType[0].complexContent.extension.sequence.element");
        const fields = _.head(types && types.filter( elem => (elem.name === "the_geom" || elem.type.prefix.indexOf("gml") === 0)));
        const geometryField = fields && fields.name;
        return geometryField ? changeLayerProperties(layer.id, {geometryField}) : changeLayerProperties();
    });
}

function getSearchField(layer) {
    return WMS.describeLayers(layer.url, layer.name).then((results) => {
        if (results) {
            let description = _.find(results, (desc) => desc.name === layer.name );
            return description && description.owsType === 'WFS' ? changeLayerProperties(layer.id, {
                    search: {
                        url: description.owsURL,
                        type: 'wfs'
                    }
                }) : changeLayerProperties();
        }
        return changeLayerProperties();
    });
}

const getAdditionalFieldsWMSLayer = (action$, store) =>
    action$.ofType(ADD_LAYER)
    .filter((action) => { return action.layer && action.layer.type && action.layer.type === 'wms'; })
    .switchMap(action => {
        let currentLayer = assign(action.layer);
        const layers = store.getState().layers;
        const flat = layers && layers.flat && [].concat(layers.flat) || [];
        const layer = flat.filter((val) => { currentLayer.id = val.id; return _.isEqual(val, currentLayer); });
        return layer.length > 0 ? Rx.Observable.merge(Rx.Observable.of(getGeometryField(layer[0])), Rx.Observable.of(getSearchField(layer[0]))) : changeLayerProperties();
    }).mergeAll();

module.exports = {
    getAdditionalFieldsWMSLayer
};
