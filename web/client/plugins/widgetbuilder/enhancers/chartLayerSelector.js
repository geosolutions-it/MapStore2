/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, defaultProps, setDisplayName } from 'recompose';

import withBackButton from './withBackButton';
import layerSelector from './layerSelector';
import layerSelectorConnect from './connection/layerSelectorConnect';
import canGenerateCharts from '../../../observables/widgets/canGenerateCharts';

const chartLayerSelector = compose(
    setDisplayName('ChartLayerSelector'),
    layerSelectorConnect,
    defaultProps({
        layerValidationStream: stream$ => stream$.switchMap(layer => canGenerateCharts(layer))
    }),
    withBackButton,
    layerSelector
);
export default chartLayerSelector;
