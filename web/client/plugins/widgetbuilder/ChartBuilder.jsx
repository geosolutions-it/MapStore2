/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {connect} from 'react-redux';

import { compose, renameProps, branch, renderComponent} from 'recompose';

import BorderLayout from '../../components/layout/BorderLayout';

import {insertWidget, onEditorChange, setPage, openFilterEditor, changeEditorSetting} from '../../actions/widgets';

import builderConfiguration from '../../components/widgets/enhancers/builderConfiguration';
import chartLayerSelector from './enhancers/chartLayerSelector';
import viewportBuilderConnect from './enhancers/connection/viewportBuilderConnect';
import viewportBuilderConnectMask from './enhancers/connection/viewportBuilderConnectMask';
import withExitButton from './enhancers/withExitButton';
import withConnectButton from './enhancers/connection/withConnectButton';
import {wizardStateToProps, wizardSelector} from './commons';
import ChartWizard from '../../components/widgets/builder/wizard/ChartWizard';
import LayerSelector from './LayerSelector';
import BuilderHeader from './BuilderHeader';
import Toolbar from '../../components/widgets/builder/wizard/chart/Toolbar';

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
    builderConfiguration({needWPS: false}),
    renameProps({
        editorData: "data",
        onEditorChange: "onChange"
    })
)(ChartWizard));


const ChartToolbar = compose(
    connect(wizardSelector, {
        openFilterEditor,
        setPage,
        onChange: onEditorChange,
        insertWidget
    },
    wizardStateToProps
    ),
    viewportBuilderConnect,
    withExitButton(),
    withConnectButton(({step}) => step === 1)

)(Toolbar);

/*
 * in case you don't have a layer selected (e.g. dashboard) the chart builder
 * prompts a catalog view to allow layer selection
 */
const chooseLayerEnhancer = compose(
    connect(wizardSelector),
    viewportBuilderConnectMask,
    branch(
        ({layer} = {}) => !layer,
        renderComponent(chartLayerSelector(LayerSelector))
    )
);

export default chooseLayerEnhancer(({ enabled, onClose = () => { }, exitButton, editorData, toggleConnection, availableDependencies = [], dependencies, ...props} = {}) =>

    (<div className = "mapstore-chart-advance-options">
        <BorderLayout
            header={<BuilderHeader onClose={onClose}>
                <ChartToolbar
                    exitButton={exitButton}
                    editorData={editorData}
                    toggleConnection={toggleConnection}
                    availableDependencies={availableDependencies}
                    onClose={onClose}/>
            </BuilderHeader>}
        >
            {enabled ? <Builder dependencies={dependencies} {...props}/> : null}
        </BorderLayout>
    </div>));
