/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    plugins: {
        LayerSelectorPlugin: require('./plugins/LayerSelector'),
        MapPlugin: require('../../plugins/Map'),
        WFSDownload: require('../../plugins/WFSDownload'),
        FeatureEditor: require('../../plugins/FeatureEditor').default,
        QueryPanel: require('../../plugins/QueryPanel'),
        Notifications: require('../../plugins/Notifications')
    },
    requires: {
    }
};
