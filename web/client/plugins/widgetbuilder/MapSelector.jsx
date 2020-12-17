/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, withProps } from 'recompose';

import { connect } from 'react-redux';
import { onEditorChange } from '../../actions/widgets';
import { normalizeMap } from '../../utils/LayersUtils';
import MapSelector from '../../components/widgets/builder/wizard/map/MapSelector';

export default compose(
    connect(
        () => ({}), {
            onMapSelected: ({ map }) => onEditorChange("map", normalizeMap(map)),
            onSetIdentifyTrue: () => onEditorChange("map.mapInfoControl", true),
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
