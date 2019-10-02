/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const { describeFeatureType } = require('../../../../observables/wfs');
const { getSearchUrl } = require('../../../../utils/LayersUtils');
/**
 * Retrieves feature types for the layer provideded in props. When the layer changes url,
 * @param {Obserbable} props$ props stream
 */
module.exports = props$ =>
    props$
        .distinctUntilChanged(({ layer: layer1 } = {}, { layer: layer2 } = {}) =>
            getSearchUrl(layer1) === getSearchUrl(layer2)
            && layer1.loadingError === layer2.loadingError) // this check is not too precise,it may need a refinement
        .switchMap(({ layer } = {}) => describeFeatureType({ layer })
            .map(r => ({ describeFeatureType: r.data, loading: false, error: undefined }))
            .catch(error => Rx.Observable.of({
                loading: false,
                error
            })));
