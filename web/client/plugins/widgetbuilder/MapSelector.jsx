/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, withProps } = require('recompose');
const {connect} = require('react-redux');
const { onEditorChange } = require('../../actions/widgets');
const { normalizeMap } = require('../../utils/LayersUtils');
const MapSelector = require('../../components/widgets/builder/wizard/map/MapSelector').default;
module.exports = compose(
    connect(
        () => ({}), {
            onMapSelected: ({ map }) => onEditorChange("map", normalizeMap(map)),
            onResetChange: onEditorChange

        }),
    // add button to back to widget type selection
    withProps(({ onResetChange = () => { } }) => ({
        stepButtons: [{
            glyph: 'arrow-left',
            tooltipId: 'widgets.builder.wizard.backToWidgetTypeSelection',
            onClick: () => {
                // options will not be valid anymore in case of layer change
                onResetChange("map", undefined);
                onResetChange("widgetType", undefined);
            }
        }]
    }))
)(MapSelector);
