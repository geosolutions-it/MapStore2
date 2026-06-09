/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';

import { describeFeatureType } from '../wfs';

/**
 * Tries to retrieve WFS info to guess if the layer passed can be used as base for a chart
 * @param  {Object} layer The layer object
 * @return {Observable} a stream that throws an error if the layer can not be used for charts
 */
export default layer => Observable.forkJoin(describeFeatureType({layer}));
