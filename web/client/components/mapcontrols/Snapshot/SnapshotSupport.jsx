/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default (mapType) => {
    const SnapshotSupport = require('../../map/' + mapType + '/SnapshotSupport').default;
    return SnapshotSupport.default || SnapshotSupport;
};
