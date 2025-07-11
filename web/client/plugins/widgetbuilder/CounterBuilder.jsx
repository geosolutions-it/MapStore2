/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';

import { compose, renameProps, branch, renderComponent } from 'recompose';

import BorderLayout from '../../components/layout/BorderLayout';

import { insertWidget, onEditorChange, setPage, openFilterEditor, changeEditorSetting } from '../../actions/widgets';

import builderConfiguration from '../../components/widgets/enhancers/builderConfiguration';
import counterLayerSelector from './enhancers/counterLayerSelector';
import viewportBuilderConnect from './enhancers/connection/viewportBuilderConnect';
import viewportBuilderConnectMask from './enhancers/connection/viewportBuilderConnectMask';

import withExitButton from './enhancers/withExitButton';
import withConnectButton from './enhancers/connection/withConnectButton';
import CounterWizard from '../../components/widgets/builder/wizard/CounterWizard';
import BuilderHeader from './BuilderHeader';
import BaseToolbar from '../../components/widgets/builder/wizard/counter/Toolbar';
import LayerSelector from './LayerSelector';
import { catalogEditorEnhancer } from './enhancers/catalogEditorEnhancer';

import {wizardStateToProps, wizardSelector} from './commons';

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
    builderConfiguration({ needsWPS: true }),
    renameProps({
        editorData: "data",
        onEditorChange: "onChange"
    })
)(CounterWizard));


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
)(BaseToolbar);

/*
 * in case you don't have a layer selected (e.g. dashboard) the chart builder
 * prompts a catalog view to allow layer selection
 */
const chooseLayerEnhancer = compose(
    connect(wizardSelector),
    viewportBuilderConnectMask,
    catalogEditorEnhancer,
    branch(
        ({ layer } = {}) => !layer,
        renderComponent(counterLayerSelector(LayerSelector))
    )
);

export default chooseLayerEnhancer(({ enabled, onClose = () => { }, exitButton, editorData, toggleConnection, availableDependencies = [], dependencies, ...props } = {}) =>

    (<BorderLayout
        header={<BuilderHeader onClose={onClose}><Toolbar
            exitButton={exitButton}
            editorData={editorData}
            toggleConnection={toggleConnection}
            availableDependencies={availableDependencies}
            widgets={props.widgets}
            onClose={onClose} /></BuilderHeader>}
    >
        {enabled ? <Builder formOptions={{
            showLayer: false,
            showColorRamp: false,
            showUom: false,
            showGroupBy: false,
            showLegend: false,
            advancedOptions: true
        }} dependencies={dependencies} {...props} /> : null}
    </BorderLayout>));
