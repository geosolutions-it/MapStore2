/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {ADD_LAYER, changeLayerProperties} = require('../actions/layers');
const {MAP_CONFIG_LOADED} = require('../actions/config');
const Rx = require('rxjs');
const WFS = require('../api/WFS');
const _ = require('lodash');

function getGeometryField(layer) {
    return Rx.Observable.of(WFS.describeFeatureType(layer.url, layer.name).then((describeFeatureType) => {
        const types = _.get(describeFeatureType, "complexType[0].complexContent.extension.sequence.element");
        const fields = _.head(types && types.filter( elem => (elem.name === "the_geom" || elem.type.prefix.indexOf("gml") === 0)));
        const geometryField = fields && fields.name;
        return geometryField ? changeLayerProperties(layer.id, {geometryField}) : changeLayerProperties(layer.id, {});
    }));
}

const addGeometryFieldLayer = action$ =>
    action$.ofType(ADD_LAYER).filter((action) => { return action.layer.type === 'wms'; }).switchMap(action => {
        return getGeometryField(action.layer);
    }).mergeAll();

const addGeometryFieldConfig = action$ =>
    action$.ofType(MAP_CONFIG_LOADED).switchMap(action => Rx.Observable.from(action.config.map.layers)
    .filter((layer) => { return layer.type === 'wms'; }))
    .switchMap(layer => {
        return getGeometryField(layer);
    }).mergeAll();

module.exports = {
    addGeometryFieldLayer,
    addGeometryFieldConfig
};
