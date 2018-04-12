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
const {featureGridSelector} = require('../../../selectors/controls');
/**
 * Reset widgets
 */
module.exports = compose(
    connect(() => ({
        returnToFeatureGrid: state => featureGridSelector(state)}),
    {
        backToWidgetList: () => onEditorChange('widgetType', undefined),
        backToFeatureGrid: () => setControlProperty("widgetBuilder", "enabled", false, false),
        openFeatureGridTable: () => openFeatureGrid()
    }),
    withHandlers({
        backFromWizard: ({
            backToWidgetList = () => {},
            backToFeatureGrid = () => {},
            openFeatureGridTable = () => {},
            returnToFeatureGrid
        }) => () => {
            if (returnToFeatureGrid) {
                backToFeatureGrid();
                openFeatureGridTable();
            }
            backToWidgetList();
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
