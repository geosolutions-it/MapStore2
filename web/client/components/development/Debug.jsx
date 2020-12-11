/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import url from 'url';
if (!global.Symbol) {
    require("babel-polyfill");
}

const urlQuery = url.parse(window.location.href, true).query;

class Debug extends React.Component {
    render() {
        if (urlQuery && urlQuery.debug && __DEVTOOLS__ && !window.devToolsExtension) {
            const DevTools = require('./DevTools').default;
            return (
                <DevTools/>
            );
        }
        return null;
    }
}

export default Debug;
