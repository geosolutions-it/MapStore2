/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {connect} from 'react-redux';

import {compose, renameProps, branch, renderComponent, withState, withProps} from 'recompose';

import BorderLayout from '../../components/layout/BorderLayout';
import {
    insertWidget,
    onEditorChange,
    setPage,
    openFilterEditor,
    changeEditorSetting
} from '../../actions/widgets';
import builderConfiguration from '../../components/widgets/enhancers/builderConfiguration';
import chartLayerSelector from './enhancers/chartLayerSelector';
import viewportBuilderConnect from './enhancers/connection/viewportBuilderConnect';
import viewportBuilderConnectMask from './enhancers/connection/viewportBuilderConnectMask';
import withExitButton from './enhancers/withChartExitButton';
import withConnectButton from './enhancers/connection/withConnectButton';
import { wizardStateToProps, wizardSelector } from './commons';
import ChartWizard from '../../components/widgets/builder/wizard/ChartWizard';
import LayerSelector from './ChartLayerSelector';
import BuilderHeader from './BuilderHeader';
import Toolbar from '../../components/widgets/builder/wizard/chart/Toolbar';
import { catalogEditorEnhancer } from './enhancers/catalogEditorEnhancer';
import { getDependantWidget, isChartCompatibleWithTableWidget } from "../../utils/WidgetsUtils";

/**
 * Enhancer allows us to check if charts along with traces has layers
 * incompatible to disallow dependency mapping with other targetable dependencies
 * 1. Checks for the geometry property (needed for synchronization with a map or any other sort of spatial filter) presence on all layers of the charts
 * 2. Checks for all the names of the layers to be matching with the name of the dependent `table` widget when dependency target widget is table
 * @param {object} editorData current chart widget in edit
 * @param {object[]} widgets list of all the available widgets
 * @returns {object} with flag determining whether to allow or disallow depedency support on the current chart widget
 */
const setMultiDependencySupport = ({editorData = {}, widgets = []} = {}) => {

    let disableMultiDependencySupport = editorData?.charts?.some(({ traces }) =>
        traces.some(trace => !trace.geomProp)
    );
    const dependantWidget = getDependantWidget({widgets, dependenciesMap: editorData?.dependenciesMap});
    if (dependantWidget?.widgetType === 'table') {
        // Disable dependency support when some layers in multi chart
        // doesn't match dependant table widget
        disableMultiDependencySupport = disableMultiDependencySupport || !isChartCompatibleWithTableWidget(editorData, dependantWidget);
    }
    return { disableMultiDependencySupport };
};

const Builder = connect(
    wizardSelector,
    {
        openFilterEditor,
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
    connect(
        wizardSelector,
        {
            openFilterEditor,
            setPage,
            onChange: onEditorChange,
            insertWidget
        },
        wizardStateToProps
    ),
    viewportBuilderConnect,
    withExitButton(),
    withProps((props) => setMultiDependencySupport(props)),
    withConnectButton(({step}) => step === 0)
)(Toolbar);

/*
 * in case you don't have a layer selected (e.g. dashboard) the chart builder
 * prompts a catalog view to allow layer selection
 */
const chooseLayerEnhancer = compose(
    withState('showLayers', "toggleLayerSelector", false),
    withState('errors', 'setErrors', {}),
    connect(wizardSelector, null, wizardStateToProps),
    viewportBuilderConnectMask,
    catalogEditorEnhancer,
    branch(
        ({layer, showLayers} = {}) => {
            return !layer || showLayers;
        },
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
                    onClose={onClose}
                    toggleLayerSelector={props.toggleLayerSelector}
                    errors={props.errors}
                    dashboardEditing={props.dashboardEditing}
                    widgets={props.widgets}
                />
            </BuilderHeader>}
        >
            {enabled ? <Builder dependencies={dependencies}  {...props}/> : null}
        </BorderLayout>
    </div>));
