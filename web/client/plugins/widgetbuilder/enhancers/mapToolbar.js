/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {compose, withProps, withHandlers} = require('recompose');
const {connect} = require('react-redux');
const {insertWidget, setPage} = require('../../../actions/widgets');
const manageLayers = require('./manageLayers');
const { wizardSelector, wizardStateToProps } = require('../commons');

module.exports = compose(
    connect(wizardSelector, {
        setPage,
        insertWidget
    },
        wizardStateToProps
    ),
    manageLayers,
    withHandlers({
        onRemoveSelected: ({ layers = [], selectedGroups = [], selectedLayers = [], onEditorChange = () => { }, removeLayersById = () => { } }) => () => {
            // TODO: clear selection
            // TODO: get layer's by group
            // TODO: remove groups
            removeLayersById(selectedLayers);
        }
    }),
    withProps(({ selectedNodes = [], onRemoveSelected = () => { } }) => ({
        tocButtons: [{
            onClick: () => onRemoveSelected(),
            visible: selectedNodes.length > 0,
            glyph: "trash",
            tooltipId: "widgets.builder.wizard.addLayer"
        }]
    }))
);
