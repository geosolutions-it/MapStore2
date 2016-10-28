/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    plugins: {
        OmniBarPlugin: require('../plugins/OmniBar'),
        HomePlugin: require('../plugins/Home'),
        LoginPlugin: require('../plugins/Login'),
        ManagerMenuPlugin: require('../plugins/manager/ManagerMenu'),
        RedirectPlugin: require('../plugins/Redirect'),
        LanguagePlugin: require('../plugins/Language'),
        AttributionPlugin: require('./plugins/Attribution'),
        HeaderPlugin: require('./plugins/Header'),
        FooterPlugin: require('./plugins/Footer')
    },
    requires: {
        ReactSwipe: require('react-swipeable-views').default,
        SwipeHeader: require('../components/data/identify/SwipeHeader')
    }
};
