/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SHOW_CONFIRMATION = 'BACKTOPAGE:SHOW_CONFIRMATION';

export const showConfirmation = (show) => ({
    type: SHOW_CONFIRMATION,
    show
});
