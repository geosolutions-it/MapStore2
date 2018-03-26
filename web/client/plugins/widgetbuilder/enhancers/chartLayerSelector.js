/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { connect } = require('react-redux');
const { compose, defaultProps, setDisplayName } = require('recompose');
const layerSelector = require('./layerSelector');
const { onEditorChange } = require('../../../actions/widgets');
const canGenerateCharts = require('../../../observables/widgets/canGenerateCharts');
module.exports = compose(
    setDisplayName('ChartLayerSelector'),
    connect(() => { }, {
        onLayerChoice: (l) => onEditorChange("layer", l)
    }),
    defaultProps({
        layerValidationStream: stream$ => stream$.switchMap(layer => canGenerateCharts(layer))
    }),
    layerSelector
);
