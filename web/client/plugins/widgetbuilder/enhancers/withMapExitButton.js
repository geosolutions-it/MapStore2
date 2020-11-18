/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, withProps, withHandlers } from 'recompose';

import { connect } from 'react-redux';
import { setControlProperty } from '../../../actions/controls';
import { openFeatureGrid } from '../../../actions/featuregrid';
import { onEditorChange } from '../../../actions/widgets';
import { returnToFeatureGridSelector } from '../../../selectors/widgets';

/**
 * Reset widgets
 */
export default compose(
    connect((state) => ({
        returnToFeatureGrid: returnToFeatureGridSelector(state)}),
    {
        backToWidgetList: () => onEditorChange('widgetType', undefined),
        closeWidgetBuilder: () => setControlProperty("widgetBuilder", "enabled", false, false),
        openFeatureGridTable: () => openFeatureGrid()
    }),
    /**
     * it allows to return to the feature grid if the chart wizard has been opened from there.
     * otherwise it goes back to the widget list
    */
    withHandlers({
        backFromWizard: ({
            backToWidgetList = () => {},
            closeWidgetBuilder = () => {},
            openFeatureGridTable = () => {},
            returnToFeatureGrid
        }) => () => {
            if (returnToFeatureGrid) {
                closeWidgetBuilder();
                openFeatureGridTable();
            } else {
                backToWidgetList();
            }
        }
    }),
    withProps(({ returnToFeatureGrid, backFromWizard = () => {} }) => ({
        exitButton: {
            onClick: backFromWizard,
            glyph: 'arrow-left',
            tooltipId: returnToFeatureGrid ? "widgets.builder.wizard.backToFeatureGrid" : "widgets.builder.wizard.backToWidgetTypeSelection"
        }
    }))
);
