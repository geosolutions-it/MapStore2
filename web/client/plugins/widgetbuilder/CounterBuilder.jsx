/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { connect } = require('react-redux');

const { compose, renameProps, branch, renderComponent } = require('recompose');

const BorderLayout = require('../../components/layout/BorderLayout');

const { insertWidget, onEditorChange, setPage, openFilterEditor, changeEditorSetting } = require('../../actions/widgets');

const builderConfiguration = require('../../components/widgets/enhancers/builderConfiguration');
const chartLayerSelector = require('./enhancers/chartLayerSelector');
const viewportBuilderConnect = require('./enhancers/connection/viewportBuilderConnect');
const viewportBuilderConnectMask = require('./enhancers/connection/viewportBuilderConnectMask');

const withExitButton = require('./enhancers/withExitButton');
const withConnectButton = require('./enhancers/connection/withConnectButton');

const {
    wizardStateToProps,
    wizardSelector
} = require('./commons');

const Builder = connect(
    wizardSelector,
    {
        setPage,
        setValid: valid => changeEditorSetting("valid", valid),
        onEditorChange,
        insertWidget
    },
    wizardStateToProps
)(compose(
    builderConfiguration,
    renameProps({
        editorData: "data",
        onEditorChange: "onChange"
    })
)(require('../../components/widgets/builder/wizard/CounterWizard')));

const BuilderHeader = require('./BuilderHeader');
const Toolbar = compose(
    connect(
        wizardSelector, {
            openFilterEditor,
            setPage,
            onChange: onEditorChange,
            insertWidget
        },
        wizardStateToProps
    ),
    viewportBuilderConnect,
    withExitButton(),
    withConnectButton(({ step }) => step === 0)
)(require('../../components/widgets/builder/wizard/counter/Toolbar'));

/*
 * in case you don't have a layer selected (e.g. dashboard) the chart builder
 * prompts a catalog view to allow layer selection
 */
const chooseLayerEnhancer = compose(
    connect(wizardSelector),
    viewportBuilderConnectMask,
    branch(
        ({ layer } = {}) => !layer,
        renderComponent(chartLayerSelector(require('./LayerSelector')))
    )
);

module.exports = chooseLayerEnhancer(({ enabled, onClose = () => { }, exitButton, editorData, toggleConnection, availableDependencies = [], dependencies, ...props } = {}) =>

    (<BorderLayout
        header={<BuilderHeader onClose={onClose}><Toolbar
            exitButton={exitButton}
            editorData={editorData}
            toggleConnection={toggleConnection}
            availableDependencies={availableDependencies}
            onClose={onClose} /></BuilderHeader>}
    >
        {enabled ? <Builder formOptions={{
            showColorRamp: false,
            showUom: true,
            showGroupBy: false,
            showLegend: false
        }} dependencies={dependencies} {...props} /> : null}
    </BorderLayout>));
