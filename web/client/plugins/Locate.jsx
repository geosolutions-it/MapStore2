/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {connect} = require('react-redux');

const {changeLocateState} = require('../actions/locate');

module.exports = {
    LocatePlugin: connect((state) => ({
        locate: state.locate && state.locate.state || 'DISABLED'
    }), {
        onClick: changeLocateState
    })(require('../components/mapcontrols/locate/LocateBtn')),
    reducers: {locate: require('../reducers/locate')}
};
