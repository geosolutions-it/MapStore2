/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {onEditorChange, insertWidget, setPage} = require('../../actions/widgets');
const {wizardSelector, wizardStateToProps} = require('./commons');
const layerSelector = require('./enhancers/layerSelector');
const BorderLayout = require('../../components/layout/BorderLayout');
const {normalizeLayer} = require('../../utils/LayersUtils');
const BuilderHeader = require('./BuilderHeader');

const Toolbar = connect(wizardSelector, {
        setPage,
        insertWidget
    },
    wizardStateToProps
)(require('../../components/widgets/builder/wizard/map/Toolbar'));
const { compose, branch, renderComponent, withState, withHandlers, withProps } = require('recompose');
/*
 * Prompts Map Selection or Layer selector (to add layers)
 */
const chooseMapEnhancer = compose(
    connect(wizardSelector),
    branch(
        ({ editorData = {} } = {}) => !editorData.map,
        renderComponent(require('./MapSelector'))
    ),
    withState('layerSelectorOpen', 'toggleLayerSelector', false),
    branch(
        ({ layerSelectorOpen = false } = {}) => layerSelectorOpen,
        renderComponent(
            compose(
                withProps(({ editorData = {}}) => ({
                    layers: editorData.map && editorData.map.layers
                })),
                connect(() => {}, {
                    setLayers: layers => onEditorChange('map.layers', layers)
                }),
                withHandlers({
                    addLayer: ({ layers = [], setLayers = () => { } }) => layer => setLayers([...layers, normalizeLayer(layer)])
                }),
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
module.exports = chooseMapEnhancer(({ enabled, onClose = () => { }, toggleLayerSelector = () => {}} = {}) =>
    (<BorderLayout
        className = "map-selector"
        header={<BuilderHeader onClose={onClose}><Toolbar toggleLayerSelector={toggleLayerSelector}/></BuilderHeader>}
        >
        {enabled ? <Builder /> : null}
    </BorderLayout>));
