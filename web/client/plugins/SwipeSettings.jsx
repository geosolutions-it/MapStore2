/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect } from 'react-redux';


// For displaying  UI configuration
const MapSwipeSettingsPanel = () => {
    return (<div id="ms-swipe">Panel settings</div>);
};

export default connect(null, {})(MapSwipeSettingsPanel);
