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
const {wizardSelector, wizardStateToProps} = require('./commons');
const layerSelector = require('./enhancers/layerSelector');
const manageLayers = require('./enhancers/manageLayers');
const mapToolbar = require('./enhancers/mapToolbar');
const handleNodeEditing = require('./enhancers/handleNodeEditing');
const BorderLayout = require('../../components/layout/BorderLayout');

const BuilderHeader = require('./BuilderHeader');
const { compose, branch, renderComponent, withState, withHandlers, withProps } = require('recompose');
const handleNodeSelection = require('../../components/widgets/builder/wizard/map/enhancers/handleNodeSelection');

const Toolbar = mapToolbar(require('../../components/widgets/builder/wizard/map/Toolbar'));

/*
 * Prompts Map Selection or Layer selector (to add layers)
 */
const chooseMapEnhancer = compose(
    connect(wizardSelector),
    // map selector
    branch(
        ({ editorData = {} } = {}) => !editorData.map,
        renderComponent(require('./MapSelector'))
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
                layerSelector
            )(require('./MapLayerSelector'))
        )
    )
);
const Builder = connect(
    wizardSelector,
    {
        onChange: onEditorChange
    },
    wizardStateToProps
)(require('../../components/widgets/builder/wizard/MapWizard'));

const mapBuilder = compose(
    chooseMapEnhancer,
    withProps(({ editorData = {}}) => ({
        map: editorData.map
    })),
    handleNodeSelection,
    handleNodeEditing
);


module.exports = mapBuilder(({ enabled, onClose = () => { }, toggleLayerSelector = () => { }, editNode, setEditNode, closeNodeEditor, selectedGroups=[], selectedLayers=[], selectedNodes, onNodeSelect = () => { } } = {}) =>
    (<BorderLayout
        className = "map-selector"
        header={(<BuilderHeader onClose={onClose}>
            <Toolbar
            selectedNodes={selectedNodes}
            selectedLayers={selectedLayers}
            selectedGroups={selectedGroups}
            toggleLayerSelector={toggleLayerSelector}/></BuilderHeader>)}
        >
        {enabled ? <Builder
            setEditNode={setEditNode}
            editNode={editNode}
            closeNodeEditor={closeNodeEditor}
            onNodeSelect={onNodeSelect}
            selectedNodes={selectedNodes}/> : null}
    </BorderLayout>));
