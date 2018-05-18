/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { connect } = require('react-redux');
const { compose, defaultProps, withProps, setDisplayName } = require('recompose');
const layerSelector = require('./layerSelector');
const { onEditorChange } = require('../../../actions/widgets');
const canGenerateCharts = require('../../../observables/widgets/canGenerateCharts');
module.exports = compose(
    setDisplayName('ChartLayerSelector'),
    connect(() => ({}), {
        onLayerChoice: (l) => onEditorChange("layer", l),
        onResetChange: onEditorChange
    }),
    defaultProps({
        layerValidationStream: stream$ => stream$.switchMap(layer => canGenerateCharts(layer))
    }),
    // add button to back to widget type selection
    withProps(({ onResetChange = () => { } }) => ({
        stepButtons: [{
            glyph: 'arrow-left',
            tooltipId: "widgets.builder.wizard.backToWidgetTypeSelection",
            onClick: () => {
                // options will not be valid anymore in case of layer change
                onResetChange("options", undefined);
                onResetChange("widgetType", undefined);
            }
        }]
    })),
    layerSelector
);
