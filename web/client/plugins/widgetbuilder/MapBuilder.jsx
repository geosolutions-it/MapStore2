/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';
import { branch, compose, renderComponent, withHandlers, withProps, withState } from 'recompose';

import { onEditorChange } from '../../actions/widgets';
import BorderLayout from '../../components/layout/BorderLayout';
import handleNodeSelection from '../../components/widgets/builder/wizard/map/enhancers/handleNodeSelection';
import ToolbarComp from '../../components/widgets/builder/wizard/map/Toolbar';
import MapWizardComp from '../../components/widgets/builder/wizard/MapWizard';
import BuilderHeader from './BuilderHeader';
import { wizardSelector, wizardStateToProps } from './commons';
import mapBuilderConnectMask from './enhancers/connection/mapBuilderConnectMask';
import handleNodeEditing from './enhancers/handleNodeEditing';
import layerSelector from './enhancers/layerSelector';
import manageLayers from './enhancers/manageLayers';
import mapToolbar from './enhancers/mapToolbar';
import MapLayerSelectorComp from './MapLayerSelector';
import MapSelector from './MapSelector';

const Toolbar = mapToolbar(ToolbarComp);


/*
 * Prompts Map Selection or Layer selector (to add layers)
 */
const chooseMapEnhancer = compose(
    connect(wizardSelector, {
        onResetChange: onEditorChange
    }),
    // map selector
    branch(
        ({ editorData = {} } = {}) => !editorData.map,
        renderComponent(MapSelector)
    ),
    // layer selector - to add layers to the map
    withState('layerSelectorOpen', 'toggleLayerSelector', false),
    branch(
        ({ layerSelectorOpen = false } = {}) => layerSelectorOpen,
        renderComponent(
            compose(
                manageLayers,
                withHandlers({
                    onLayerChoice: ({ toggleLayerSelector = () => { }, addLayer = () => { } }) => (layer) => {
                        addLayer(layer);
                        toggleLayerSelector(false);
                    }
                }),
                layerSelector,
            )(MapLayerSelectorComp)
        )
    ),
    // add button to back to map selection
    withProps(({ onResetChange = () => { } }) => ({
        exitButton: {
            glyph: 'arrow-left',
            onClick: () => {
                // options will not be valid anymore in case of layer change
                onResetChange("map", undefined);
            }
        }
    }))
);
const Builder = connect(
    wizardSelector,
    {
        onChange: onEditorChange
    },
    wizardStateToProps,
)(MapWizardComp);

const mapBuilder = compose(
    chooseMapEnhancer,
    withProps(({ editorData = {}}) => ({
        map: editorData.map
    })),
    mapBuilderConnectMask,
    handleNodeSelection,
    handleNodeEditing
);


export default mapBuilder(({
    enabled, onClose = () => {},
    toggleLayerSelector = () => {},
    editorData = {},
    editNode, setEditNode, closeNodeEditor, isLocalizedLayerStylesEnabled, env, selectedGroups = [], exitButton, selectedLayers = [], selectedNodes, onNodeSelect = () => {},
    availableDependencies = [], toggleConnection = () => {}
} = {}) =>
    (<BorderLayout
        className = "map-selector"
        header={(<BuilderHeader onClose={onClose}>
            <Toolbar
                exitButton={exitButton}
                editorData={editorData}
                availableDependencies={availableDependencies}
                toggleConnection={toggleConnection}
                selectedNodes={selectedNodes}
                selectedLayers={selectedLayers}
                selectedGroups={selectedGroups}
                onNodeSelect={onNodeSelect}
                toggleLayerSelector={toggleLayerSelector}/></BuilderHeader>)}
    >
        {enabled ? <Builder
            setEditNode={setEditNode}
            editNode={editNode}
            closeNodeEditor={closeNodeEditor}
            onNodeSelect={onNodeSelect}
            isLocalizedLayerStylesEnabled={isLocalizedLayerStylesEnabled}
            env={env}
            selectedNodes={selectedNodes}/> : null}
    </BorderLayout>));
