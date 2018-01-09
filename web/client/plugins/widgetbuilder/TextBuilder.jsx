/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {onEditorChange, insertWidget, setPage} = require('../../actions/widgets');
const {wizardSelector, wizardStateToProps} = require('./commons');
const BorderLayout = require('../../components/layout/BorderLayout');
const BuilderHeader = require('./BuilderHeader');

const Toolbar = connect(wizardSelector, {
        setPage,
        insertWidget
    },
    wizardStateToProps
)(require('../../components/widgets/builder/wizard/text/Toolbar'));

const Builder = connect(
    wizardSelector,
    {
        onChange: onEditorChange
    },
    wizardStateToProps
)(require('../../components/widgets/builder/wizard/TextWizard'));
module.exports = ({enabled} = {}) =>
    (<BorderLayout
        header={<BuilderHeader ><Toolbar /></BuilderHeader>}
        >
        {enabled ? <Builder /> : null}
    </BorderLayout>);
