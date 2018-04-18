/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, withProps, withHandlers} = require('recompose');
const { connect } = require('react-redux');

const {setControlProperty} = require('../../../actions/controls');
const {openFeatureGrid} = require('../../../actions/featuregrid');
const { onEditorChange } = require('../../../actions/widgets');
const {returnToFeatureGridSelector} = require('../../../selectors/widgets');
/**
 * Reset widgets
 */
module.exports = compose(
    connect(() => ({
        returnToFeatureGrid: state => returnToFeatureGridSelector(state)}),
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
    withProps(({ backFromWizard = () => {} }) => ({
        exitButton: {
            onClick: backFromWizard,
            glyph: 'arrow-left',
            tooltipId: "widgets.builder.wizard.backToWidgetTypeSelection"
        }
    }))
);
