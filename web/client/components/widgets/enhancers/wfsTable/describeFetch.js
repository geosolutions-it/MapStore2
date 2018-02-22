/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const { describeFeatureType } = require('../../../../observables/wfs');
const {getLayerUrl} = require('./common');
/**
 * Retrieves feature types for the layer provideded in props. When the layer changes url,
 * @param {Obserbable} props$ props stream
 */
module.exports = props$ =>
    props$
        .distinctUntilChanged(({ layer: layer1 } = {}, { layer: layer2 } = {}) => getLayerUrl(layer1) === getLayerUrl(layer2))
        .switchMap(({ layer } = {}) => describeFeatureType({ layer })
            .map(r => ({ describeFeatureType: r.data, loading: false, error: undefined })))
        .catch(error => Rx.Observable.of({
            loading: false,
            error
        }));
