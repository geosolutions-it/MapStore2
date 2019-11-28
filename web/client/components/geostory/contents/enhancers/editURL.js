/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { branch } from 'recompose';
import emptyState from '../../../misc/enhancers/emptyState';

export const webPagePlaceholderEnhancer = branch(
    ({ src = "", viewHeight, size } = {}) => (!src || !viewHeight || !size),
    emptyState(
        () => true,
        () => ({ glyph: "code" })
    )
);
