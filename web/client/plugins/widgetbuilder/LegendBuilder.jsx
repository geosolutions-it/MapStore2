/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { connect } = require('react-redux');
const {get} = require('lodash');
const { compose, renameProps, mapPropsStream } = require('recompose');
const InfoPopover = require('../../components/widgets/widget/InfoPopover');
const Message = require('../../components/I18N/Message');
const BorderLayout = require('../../components/layout/BorderLayout');

const { insertWidget, onEditorChange, setPage, openFilterEditor, changeEditorSetting } = require('../../actions/widgets');
const withMapConnect = require('./enhancers/connection/withMapConnect');

const legendBuilderConnect = require('./enhancers/connection/legendBuilderConnect');
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
    renameProps({
        editorData: "data",
        onEditorChange: "onChange"
    })
)(require('../../components/widgets/builder/wizard/TableWizard')));

const BuilderHeader = require('./BuilderHeader');
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
    withExitButton(),
    withConnectButton(({ step }) => step === 0)
)(require('../../components/widgets/builder/wizard/table/Toolbar'));

/*
 * in case you don't have a layer selected (e.g. dashboard) the table builder
 * prompts a catalog view to allow layer selection
 */
const builderEnhancer = compose(
    connect(wizardSelector),
    viewportBuilderConnectMask,
    legendBuilderConnect,
    withMapConnect({ center: "center", "zoom": "zoom" }),
    // auto trigger connect if not in sync
    mapPropsStream(
        props$ => props$.merge(
            props$
                .distinctUntilKeyChanged('mapSync')
                .filter( ({mapSync}) => !mapSync)
                .do(({ toggleConnection = () => {} }) => toggleConnection())
                .ignoreElements()
        )
    )
);

module.exports = builderEnhancer(({ enabled, onClose = () => { }, editorData = {}, exitButton, toggleConnection, availableDependencies = [], dependencies, ...props } = {}) =>

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
        {enabled ? <Builder editorData={editorData} dependencies={dependencies} {...props} /> : null}
    </BorderLayout>));
