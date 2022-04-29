/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {get} from "lodash";

export const isActiveSelector = (state) => get(state, "controls.userExtensions.enabled");
