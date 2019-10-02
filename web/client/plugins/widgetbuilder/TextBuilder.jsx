/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const { compose, withProps } = require('recompose');
const {onEditorChange, insertWidget, setPage} = require('../../actions/widgets');
const {wizardSelector, wizardStateToProps} = require('./commons');
const BorderLayout = require('../../components/layout/BorderLayout');
const withExitButton = require('./enhancers/withExitButton');
const BuilderHeader = require('./BuilderHeader');

const Toolbar = compose(
    connect(wizardSelector, {
        setPage,
        insertWidget,
        onResetChange: onEditorChange
    },
    wizardStateToProps,
    ),
    withProps(({ onResetChange = () => { } }) => ({
        exitButton: {
            glyph: 'arrow-left',
            tooltipId: "widgets.builder.wizard.backToWidgetTypeSelection",
            onClick: () => onResetChange('widgetType', undefined)
        }
    })),
    withExitButton(),
)(require('../../components/widgets/builder/wizard/text/Toolbar'));

const Builder = connect(
    wizardSelector,
    {
        onChange: onEditorChange
    },
    wizardStateToProps
)(require('../../components/widgets/builder/wizard/TextWizard'));
module.exports = ({ enabled, onClose = () => {}} = {}) =>
    (<BorderLayout
        header={<BuilderHeader onClose={onClose}><Toolbar /></BuilderHeader>}
    >
        {enabled ? <Builder /> : null}
    </BorderLayout>);
