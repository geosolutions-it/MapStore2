/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {connect} = require('react-redux');
const {setControlProperty} = require('../../actions/controls');

module.exports = connect(() => {}, {
        onClose: setControlProperty.bind(null, "widgetBuilder", "enabled", false, false)
    }
)(require('../../components/widgets/builder/BuilderHeader'));
