/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {onEditorChange} = require('../../actions/widgets');
const { wizardSelector, wizardStateToProps} = require('./commons');
const layerSelector = require('./enhancers/layerSelector');
const manageLayers = require('./enhancers/manageLayers');
const mapToolbar = require('./enhancers/mapToolbar');
const handleNodeEditing = require('./enhancers/handleNodeEditing');
const mapBuilderConnectMask = require('./enhancers/connection/mapBuilderConnectMask');
const BorderLayout = require('../../components/layout/BorderLayout');

const BuilderHeader = require('./BuilderHeader');
const { compose, branch, renderComponent, withState, withHandlers, withProps } = require('recompose');
const handleNodeSelection = require('../../components/widgets/builder/wizard/map/enhancers/handleNodeSelection');

const Toolbar = mapToolbar(require('../../components/widgets/builder/wizard/map/Toolbar'));
const MapSelector = require('./MapSelector');


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
            )(require('./MapLayerSelector'))
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
)(require('../../components/widgets/builder/wizard/MapWizard'));

const mapBuilder = compose(
    chooseMapEnhancer,
    withProps(({ editorData = {}}) => ({
        map: editorData.map
    })),
    mapBuilderConnectMask,
    handleNodeSelection,
    handleNodeEditing
);


module.exports = mapBuilder(({
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
