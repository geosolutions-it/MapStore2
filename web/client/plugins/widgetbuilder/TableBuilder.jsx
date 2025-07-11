/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import {get} from 'lodash';
import { isGeometryType } from '../../utils/ogc/WFS/base';
import { compose, renameProps, branch, renderComponent, mapPropsStream } from 'recompose';
import InfoPopover from '../../components/widgets/widget/InfoPopover';
import Message from '../../components/I18N/Message';
import BorderLayout from '../../components/layout/BorderLayout';

import BuilderHeader from './BuilderHeader';
import { insertWidget, onEditorChange, setPage, openFilterEditor, changeEditorSetting } from '../../actions/widgets';

import builderConfiguration from '../../components/widgets/enhancers/builderConfiguration';
import tableLayerSelector from './enhancers/tableLayerSelector';
import viewportBuilderConnect from './enhancers/connection/viewportBuilderConnect';
import viewportBuilderConnectMask from './enhancers/connection/viewportBuilderConnectMask';
import withExitButton from './enhancers/withExitButton';
import withConnectButton from './enhancers/connection/withConnectButton';
import { wizardStateToProps, wizardSelector} from './commons';
import TableWizard from '../../components/widgets/builder/wizard/TableWizard';
import BaseToolbar from '../../components/widgets/builder/wizard/table/Toolbar';
import LayerSelector from './LayerSelector';
import { catalogEditorEnhancer } from './enhancers/catalogEditorEnhancer';

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
    builderConfiguration(),
    renameProps({
        editorData: "data",
        onEditorChange: "onChange"
    }),
    mapPropsStream(props$ => props$.merge(
        props$
            .distinctUntilChanged(({ featureTypeProperties: oldFT } = {}, { featureTypeProperties: newFT } = {}) => oldFT === newFT)
            // set propTypes to all attributes when
            .do(({ featureTypeProperties = [], onChange = () => { }, data = {} } = {}) => {
                // initialize attribute list if empty (first time)
                if (onChange && featureTypeProperties.length > 0 && !get(data, "options.propertyName")) {
                    onChange("options.propertyName", featureTypeProperties.filter(a => !isGeometryType(a)).map(ft => ({name: ft.name})));
                }
            }).ignoreElements()
    ))
)(TableWizard));

const Toolbar = compose(
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
    withConnectButton(({ step }) => step === 0)
)(BaseToolbar);

/*
 * in case you don't have a layer selected (e.g. dashboard) the table builder
 * prompts a catalog view to allow layer selection
 */
const chooseLayerEnhancer = compose(
    connect(wizardSelector),
    viewportBuilderConnectMask,
    catalogEditorEnhancer,
    branch(
        ({ layer } = {}) => !layer,
        renderComponent(tableLayerSelector(LayerSelector))
    )
);

export default chooseLayerEnhancer(({ enabled, onClose = () => { }, editorData = {}, exitButton, toggleConnection, availableDependencies = [], dependencies, ...props } = {}) =>

    (<BorderLayout
        header={
            <BuilderHeader onClose={onClose}>
                <Toolbar
                    editorData={editorData}
                    exitButton={exitButton}
                    toggleConnection={toggleConnection}
                    availableDependencies={availableDependencies}
                    widgets={props.widgets}
                    onClose={onClose} />
                {get(editorData, "options.propertyName.length") === 0 ? <InfoPopover
                    trigger={false}
                    glyph="exclamation-mark"
                    bsStyle="warning"
                    text={<Message msgId="widgets.builder.errors.checkAtLeastOneAttribute" />} /> : null}
            </BuilderHeader>}
    >
        {enabled ? <Builder editorData={editorData} dependencies={dependencies} {...props} /> : null}
    </BorderLayout>));
