/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import get from 'lodash/get';

export const permalinkSettingsSelector = (state) => get(state, 'permalink.settings', {});
export const permalinkLoadingSelector = (state) => get(state, 'permalink.loading', false);
