/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { compose, mapPropsStream, renameProps, withProps } from 'recompose';
import { createSelector } from 'reselect';

import { insertWidget, onEditorChange, openFilterEditor, setPage } from '../../actions/widgets';
import Message from '../../components/I18N/Message';
import BorderLayout from '../../components/layout/BorderLayout';
import ToolbarComp from '../../components/widgets/builder/wizard/legend/Toolbar';
import LegendWizard from '../../components/widgets/builder/wizard/LegendWizard';
import InfoPopover from '../../components/widgets/widget/InfoPopover';
import { currentLocaleSelector } from '../../selectors/locale';
import BuilderHeader from './BuilderHeader';
import { wizardSelector, wizardStateToProps } from './commons';
import legendBuilderConnect from './enhancers/connection/legendBuilderConnect';
import viewportBuilderConnectMask from './enhancers/connection/viewportBuilderConnectMask';
import withConnectButton from './enhancers/connection/withConnectButton';
import withMapConnect from './enhancers/connection/withMapConnect';
import withExitButton from './enhancers/withExitButton';

const withValidMap = withProps(({ availableDependencies = [], editorData }) => ({ valid: availableDependencies.length > 0 && editorData.mapSync }));


const localeSelector = createSelector(
    currentLocaleSelector,
    (locale) => ({
        currentLocale: locale
    })
);

const Builder = compose(
    connect(
        wizardSelector,
        {
            setPage,
            onEditorChange,
            insertWidget
        },
        wizardStateToProps
    ),
    connect(localeSelector),
    withValidMap,
    renameProps({
        editorData: "data",
        onEditorChange: "onChange"
    })

)(LegendWizard);


const Toolbar = compose(
    connect(wizardSelector, {
        openFilterEditor,
        setPage,
        onChange: onEditorChange,
        insertWidget
    },
    wizardStateToProps
    ),
    legendBuilderConnect,
    withValidMap,
    // exit support
    connect(() => ({}), {
        onLayerChoice: (l) => onEditorChange("layer", l),
        onResetChange: onEditorChange
    }),
    withProps(({ onResetChange = () => { } }) => ({
        exitButton: {
            glyph: 'arrow-left',
            tooltipId: "widgets.builder.wizard.backToWidgetTypeSelection",
            onClick: () => onResetChange('widgetType', undefined)
        }
    })),
    withExitButton(({ step}) => step === 0),
    // end exit support
    withConnectButton(({ step }) => step === 0)
)(ToolbarComp);

/*
 * in case you don't have a layer selected (e.g. dashboard) the table builder
 * prompts a catalog view to allow layer selection
 */
const builderEnhancer = compose(
    connect(wizardSelector),
    viewportBuilderConnectMask,
    legendBuilderConnect,
    withMapConnect({ layers: "layers", "zoom": "zoom", "viewport": "viewport" }),
    // auto trigger connect if not in sync
    mapPropsStream(
        props$ => props$.merge(
            props$
                .filter(({ editorData = {} }) => !editorData.mapSync)
                .take(1)
                .distinctUntilChanged()
                .do(({ toggleConnection = () => { }, availableDependencies }) => toggleConnection(availableDependencies))
                .ignoreElements()
        )
    )
);

export default builderEnhancer(({ enabled, onClose = () => { }, editorData = {}, exitButton, toggleConnection, availableDependencies = [], dependencies, ...props } = {}) =>

    (<BorderLayout
        header={
            <BuilderHeader onClose={onClose}>
                <Toolbar
                    editorData={editorData}
                    exitButton={exitButton}
                    toggleConnection={toggleConnection}
                    availableDependencies={availableDependencies}
                    onClose={onClose} />
                {get(editorData, "options.propertyName.length") === 0 ? <InfoPopover
                    trigger={false}
                    glyph="exclamation-mark"
                    bsStyle="warning"
                    text={<Message msgId="widgets.builder.errors.checkAtLeastOneAttribute" />} /> : null}
            </BuilderHeader>}
    >
        {enabled ? <Builder availableDependencies={availableDependencies} editorData={editorData} dependencies={dependencies} {...props} /> : null}
    </BorderLayout>));
