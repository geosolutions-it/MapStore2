/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSelector } from 'reselect';
import { getSwipeLayerId } from './swipe';
import { snappingLayerIdSelector } from './draw';

const EMPTY = [];

/**
 * Ids of layers that must not be coalesced,
 * because a tool needs them to resolve to their own renderer layer.
 */
export const coalesceExcludeIdsSelector = createSelector(
    [getSwipeLayerId, snappingLayerIdSelector],
    (swipeLayerId, snappingLayerId) => {
        const ids = [swipeLayerId, snappingLayerId].filter(Boolean);
        return ids.length ? ids : EMPTY;
    }
);

export default { coalesceExcludeIdsSelector };
