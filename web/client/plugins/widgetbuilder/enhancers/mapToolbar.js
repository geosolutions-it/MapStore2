/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, branch, withProps, withHandlers} = require('recompose');
const {connect} = require('react-redux');
const { insertWidget, setPage, onEditorChange} = require('../../../actions/widgets');
const manageLayers = require('./manageLayers');
const handleNodeEditing = require('./handleNodeEditing');
const { wizardSelector, wizardStateToProps } = require('../commons');

const mapBuilderConnect = require('./connection/mapBuilderConnect');
const withConnectButton = require('./connection/withConnectButton');
const withExitButton = require('./withExitButton');
module.exports = compose(
    connect(wizardSelector, {
        setPage,
        onChange: onEditorChange,
        insertWidget
    },
        wizardStateToProps
    ),
    manageLayers,
    handleNodeEditing,
    withHandlers({
        onRemoveSelected: ({selectedLayers = [], removeLayersById = () => { } }) => () => {
            removeLayersById(selectedLayers);
        }
    }),
    branch(
        ({editNode}) => !!editNode,
        withProps(({ selectedNodes = [], setEditNode = () => { } }) => ({
            buttons: [{
                visible: selectedNodes.length === 1,
                tooltipId: "close",
                glyph: "1-close",
                onClick: () => setEditNode(false)
            }]
        })),
        withProps(({ selectedNodes = [], onRemoveSelected = () => { }, setEditNode = () => { } }) => ({
            tocButtons: [{
                visible: selectedNodes.length === 1,
                glyph: "wrench",
                tooltipId: "toc.toolLayerSettingsTooltip",
                onClick: () => setEditNode(selectedNodes[0])
            }, {
                onClick: () => onRemoveSelected(),
                visible: selectedNodes.length > 0,
                glyph: "trash",
                tooltipId: "toc.toolTrashLayerTooltip"
            }]
        }))
    ),
    mapBuilderConnect,
    withExitButton(undefined, {
        tooltipId: "widgets.builder.wizard.backToMapSelection"
    }),
    withConnectButton(({step}) => step === 0)

);
