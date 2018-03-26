/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');

const {compose, renameProps, branch, renderComponent} = require('recompose');

const BorderLayout = require('../../components/layout/BorderLayout');

const {insertWidget, onEditorChange, setPage, openFilterEditor, changeEditorSetting} = require('../../actions/widgets');

const builderConfiguration = require('../../components/widgets/enhancers/builderConfiguration');
const chartLayerSelector = require('./enhancers/chartLayerSelector');
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
)(require('../../components/widgets/builder/wizard/ChartWizard')));

const BuilderHeader = require('./BuilderHeader');
const Toolbar = connect(wizardSelector, {
        openFilterEditor,
        setPage,
        insertWidget
    },
    wizardStateToProps
)(require('../../components/widgets/builder/wizard/chart/Toolbar'));

/*
 * in case you don't have a layer selected (e.g. dashboard) the chart builder
 * prompts a catalog view to allow layer selection
 */
const chooseLayerEnhancer = compose(
    connect(wizardSelector),
    branch(
        ({layer} = {}) => !layer,
            renderComponent(chartLayerSelector(require('./LayerSelector')))
    )
);

module.exports = chooseLayerEnhancer(({enabled, onClose = () => {}, dependencies, ...props} = {}) =>

    (<BorderLayout
        header={<BuilderHeader onClose={onClose}><Toolbar onClose={onClose}/></BuilderHeader>}
        >
        {enabled ? <Builder dependencies={dependencies} {...props}/> : null}
    </BorderLayout>));
