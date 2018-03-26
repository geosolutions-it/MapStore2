/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {connect} = require('react-redux');
const { onEditorChange } = require('../../actions/widgets');
const { normalizeMap } = require('../../utils/LayersUtils');

module.exports = connect(
    () => ({}), {
        onMapSelected: ({ map }) => onEditorChange("map", normalizeMap(map))

    }

)(require('../../components/widgets/builder/wizard/map/MapSelector'));
