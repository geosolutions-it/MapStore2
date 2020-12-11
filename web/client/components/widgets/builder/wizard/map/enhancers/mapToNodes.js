/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { withProps } from 'recompose';

import {denormalizeGroups, splitMapAndLayers} from '../../../../../../utils/LayersUtils';

/**
 * Maps MapStore's map (as stored on back-end) to be mapped properly to
 * TOC nodes
 *
 */
const mapToNodes = ({ map }) => ({
    nodes: (
        ({ layers = {} }) => (denormalizeGroups(layers.flat || [], layers.groups || []).groups)
    )(splitMapAndLayers(map))
});
export default withProps(mapToNodes);
