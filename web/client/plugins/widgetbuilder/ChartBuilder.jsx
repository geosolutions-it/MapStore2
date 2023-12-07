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


const setMultiDependencySupport = ({editorData = {}, disableMultiDependencySupport: disableSupport, widgets = []} = {}) => {
    let disableMultiDependencySupport = disableSupport || editorData?.charts?.some(f => !f.geomProp);
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
    withState('noAttributes', 'setNoAttributes', false),
    connect(wizardSelector, null, wizardStateToProps),
    viewportBuilderConnectMask,
    catalogEditorEnhancer,
    branch(
        ({layer, showLayers} = {}) => !layer || showLayers,
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
                    noAttributes={props.noAttributes}
                    dashboardEditing={props.dashboardEditing}
                />
            </BuilderHeader>}
        >
            {enabled ? <Builder dependencies={dependencies}  {...props}/> : null}
        </BorderLayout>
    </div>));
