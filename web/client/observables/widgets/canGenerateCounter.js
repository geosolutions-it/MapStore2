/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Observable } from 'rxjs';
import { describeFeatureType } from '../wfs';
import pingAggregateProcess from './pingAggregateProcess';

/**
 * Tries to retrieve WFS and WPS info to guess if the layer passed can be used as base for a chart
 * @param  {Object} layer The layer object
 * @return {Observable} a stream that throws an error if the layer can not be used for counter
 */
export default layer => Observable.forkJoin(describeFeatureType({ layer }), pingAggregateProcess(layer));
