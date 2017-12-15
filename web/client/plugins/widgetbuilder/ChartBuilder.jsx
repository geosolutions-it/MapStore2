/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const {compose, renameProps} = require('recompose');

const BorderLayout = require('../../components/layout/BorderLayout');


const {setControlProperty} = require('../../actions/controls');
const {insertWidget, onEditorChange, setPage, openFilterEditor, changeEditorSetting} = require('../../actions/widgets');
const {getEditingWidget, getEditorSettings, getWidgetLayer, dependenciesSelector} = require('../../selectors/widgets');
const builderConfiguration = require('../../components/widgets/enhancers/builderConfiguration');

const wizardStateToProps = ( stateProps = {}, dispatchProps = {}, ownProps = {}) => ({
        ...ownProps,
        ...stateProps,
        ...dispatchProps,
        step: stateProps && stateProps.settings && stateProps.settings.step,
        valid: stateProps && stateProps.settings && stateProps.settings.valid,
        onFinish: () => dispatchProps.insertWidget && dispatchProps.insertWidget({
            layer: stateProps.layer,
            url: stateProps.layer && stateProps.layer.url,
            ...(stateProps.editorData || {})
        })
    });
const wizardSelector = createSelector(
    getWidgetLayer,
    getEditingWidget,
    getEditorSettings,
    dependenciesSelector,
    (layer, editorData, settings, dependencies) => ({
        layer: (editorData && editorData.layer) || layer,
        editorData,
        settings,
        dependencies
    })
);

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

const BuilderHeader = connect(wizardSelector, {

        onClose: setControlProperty.bind(null, "widgetBuilder", "enabled", false, false)
    },
    wizardStateToProps
)(require('../../components/widgets/builder/BuilderHeader'));

const Toolbar = connect(wizardSelector, {
        openFilterEditor: openFilterEditor,
        setPage,
        insertWidget,
        onClose: setControlProperty.bind(null, "widgetBuilder", "enabled", false, false)
    },
    wizardStateToProps
)(require('../../components/widgets/builder/wizard/chart/Toolbar'));

module.exports = ({enabled} = {}) =>

    (<BorderLayout
        header={<BuilderHeader><Toolbar /></BuilderHeader>}
        >
        {enabled ? <Builder /> : null}
    </BorderLayout>);
