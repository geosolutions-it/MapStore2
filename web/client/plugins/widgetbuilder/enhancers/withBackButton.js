/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

// add button to back to widget type selection
import { withProps } from 'recompose';

const withBackButton = withProps(({ onResetChange = () => { } }) => ({
    stepButtons: [{
        glyph: 'arrow-left',
        tooltipId: "widgets.builder.wizard.backToWidgetTypeSelection",
        onClick: () => {
            // options will not be valid anymore in case of layer change
            onResetChange("options", undefined);
            onResetChange("widgetType", undefined);
        }
    }]
}));
export default withBackButton;
