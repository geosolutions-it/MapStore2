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
import canGenerateCounter from '../../../observables/widgets/canGenerateCounter';
const counterLayerSelector = compose(
    setDisplayName('CounterLayerSelector'),
    layerSelectorConnect,
    defaultProps({
        layerValidationStream: stream$ => stream$.switchMap(layer => canGenerateCounter(layer))
    }),
    withBackButton,
    layerSelector
);
export default counterLayerSelector;
