/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { withProps } from 'recompose';

export default withProps(({
    coordinate = "lat"
}) => ({
    maxDegrees: coordinate === "lat" ? 90 : 180,
    directions: coordinate === "lat" ? ["N", "S"] : ["E", "W"]
}));
