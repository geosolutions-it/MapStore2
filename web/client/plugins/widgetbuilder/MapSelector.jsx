/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {connect} = require('react-redux');
const { onEditorChange } = require('../../actions/widgets');


module.exports = connect(
    () => ({}), {
        onMapSelected: ({ map }) => onEditorChange("map", map)

    }

)(require('../../components/widgets/builder/wizard/map/MapSelector'));
