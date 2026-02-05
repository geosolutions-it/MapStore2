/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';
import { compose, renameProps, branch, renderComponent, withState } from 'recompose';
import BorderLayout from '../../components/layout/BorderLayout';
import BuilderHeader from './BuilderHeader';
import Toolbar from '../../components/widgets/builder/wizard/filter/Toolbar';
import LayerSelector from './FilterLayerSelector';
import FilterBuilderContent from './FilterBuilderContent';
import {
    insertWidget,
    onEditorChange,
    setPage,
    openFilterEditor,
    changeEditorSetting
} from '../../actions/widgets';
import filterLayerSelector from './enhancers/filterLayerSelector';
import viewportBuilderConnectMask from './enhancers/connection/viewportBuilderConnectMask';
import { catalogEditorEnhancer } from './enhancers/catalogEditorEnhancer';
import { wizardSelector, wizardStateToProps } from './commons';

const Builder = connect(
    wizardSelector,
    {
        setPage,
        setValid: valid => changeEditorSetting("valid", valid),
        onEditorChange,
        insertWidget,
        openFilterEditor
    },
    wizardStateToProps
)(compose(
    renameProps({
        editorData: "data",
        onEditorChange: "onChange"
    })
)(FilterBuilderContent));

const FilterToolbar = compose(
    connect(
        wizardSelector,
        {
            setPage,
            onChange: onEditorChange,
            insertWidget,
            openFilterEditor
        },
        wizardStateToProps
    )
)(Toolbar);

/*
 * in case you don't have a layer selected (e.g. dashboard) the filter builder
 * prompts a catalog view to allow layer selection
 */
const chooseLayerEnhancer = compose(
    withState('showLayers', "toggleLayerSelector", false),
    withState('errors', 'setErrors', {}),
    connect(wizardSelector, null, wizardStateToProps),
    viewportBuilderConnectMask,
    catalogEditorEnhancer,
    branch(
        ({showLayers} = {}) => showLayers,
        renderComponent(filterLayerSelector(LayerSelector))
    )
);

export default chooseLayerEnhancer(({ enabled, onClose = () => {}, exitButton, editorData, ...props } = {}) => {
    return (
        <div className="mapstore-filter-advance-options">
            <BorderLayout
                header={
                    <BuilderHeader onClose={onClose}>
                        <FilterToolbar
                            exitButton={exitButton}
                            editorData={editorData}
                            onClose={onClose}
                            toggleLayerSelector={props.toggleLayerSelector}
                            errors={props.errors}
                            dashBoardEditing={props.dashBoardEditing}
                            widgets={props.widgets}
                        />
                    </BuilderHeader>
                }
            >
                {enabled ? <Builder {...props} enabled={enabled} toggleLayerSelector={props.toggleLayerSelector} layer={props.layer} dashBoardEditing={props.dashBoardEditing} /> : null}
            </BorderLayout>
        </div>
    );
});
