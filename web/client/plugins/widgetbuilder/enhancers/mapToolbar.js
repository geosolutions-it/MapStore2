/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, branch, withProps } from 'recompose';

import { connect } from 'react-redux';
import { insertWidget, setPage, onEditorChange } from '../../../actions/widgets';
import manageLayers from './manageLayers';
import handleNodeEditing from './handleNodeEditing';
import handleRemoveLayer from './handleMapRemoveLayer';
import handleMapZoomLayer from './handleMapZoomLayer';
import { wizardSelector, wizardStateToProps } from '../commons';
import mapBuilderConnect from './connection/mapBuilderConnect';
import withConnectButton from './connection/withConnectButton';
import withExitButton from './withExitButton';

export default compose(
    connect(wizardSelector, {
        setPage,
        onChange: onEditorChange,
        insertWidget
    },
    wizardStateToProps
    ),
    manageLayers,
    handleNodeEditing,
    handleRemoveLayer,
    handleMapZoomLayer,
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
        withProps(({ selectedNodes = [], epsgSupported = false, onRemoveSelected = () => { }, setEditNode = () => { }, zoomTo = () => {} }) => ({
            tocButtons: [{
                visible: selectedNodes.length > 0,
                glyph: "zoom-to",
                tooltipId: selectedNodes.length === 1 ? "toc.toolZoomToLayerTooltip" : "toc.toolZoomToLayersTooltip",
                disabled: !epsgSupported,
                onClick: epsgSupported ? () => zoomTo(selectedNodes) : () => {}
            }, {
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
