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
const {onEditorChange, insertWidget} = require('../../actions/widgets');
const {wizardSelector, wizardStateToProps} = require('./commons');
const BorderLayout = require('../../components/layout/BorderLayout');
const BuilderHeader = require('./BuilderHeader');

const Toolbar = connect(wizardSelector, {
        insertWidget
    },
    wizardStateToProps
)(require('../../components/widgets/builder/wizard/text/Toolbar'));

const Builder = connect(
    createSelector(wizardSelector, ({editorData = {}} = {}) => ({
        value: editorData.text
    })),
    {
        onChange: (type) => onEditorChange("text", type)
    }
)(require('../../components/widgets/builder/wizard/TextWizard'));
module.exports = ({enabled} = {}) =>

    (<BorderLayout
        header={<BuilderHeader ><Toolbar /></BuilderHeader>}
        >
        {enabled ? <Builder /> : null}
    </BorderLayout>);
