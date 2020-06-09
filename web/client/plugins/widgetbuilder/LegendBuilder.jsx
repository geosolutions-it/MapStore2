/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { connect } = require('react-redux');
const {createSelector} = require('reselect');
const {get} = require('lodash');
const { compose, renameProps, mapPropsStream, withProps } = require('recompose');
const InfoPopover = require('../../components/widgets/widget/InfoPopover');
const Message = require('../../components/I18N/Message');
const BorderLayout = require('../../components/layout/BorderLayout');

const { insertWidget, onEditorChange, setPage, openFilterEditor } = require('../../actions/widgets');

const legendBuilderConnect = require('./enhancers/connection/legendBuilderConnect');
const viewportBuilderConnectMask = require('./enhancers/connection/viewportBuilderConnectMask');
const withExitButton = require('./enhancers/withExitButton');
const withConnectButton = require('./enhancers/connection/withConnectButton');
const withMapConnect = require('./enhancers/connection/withMapConnect');
const withValidMap = withProps(({ availableDependencies = [], editorData }) => ({ valid: availableDependencies.length > 0 && editorData.mapSync }));
const {currentLocaleSelector} = require('../../selectors/locale');

const localeSelector = createSelector(
    currentLocaleSelector,
    (locale) => ({
        currentLocale: locale
    })
);

const {
    wizardStateToProps,
    wizardSelector
} = require('./commons');

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
    }),

)(require('../../components/widgets/builder/wizard/LegendWizard'));

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
)(require('../../components/widgets/builder/wizard/legend/Toolbar'));

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
        {enabled ? <Builder availableDependencies={availableDependencies} editorData={editorData} dependencies={dependencies} {...props} /> : null}
    </BorderLayout>));
