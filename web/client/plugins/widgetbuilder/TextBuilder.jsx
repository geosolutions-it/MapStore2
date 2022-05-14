/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';

import { insertWidget, onEditorChange, setPage } from '../../actions/widgets';
import BorderLayout from '../../components/layout/BorderLayout';
import ToolbarComp from '../../components/widgets/builder/wizard/text/Toolbar';
import TextWizardComp from '../../components/widgets/builder/wizard/TextWizard';
import BuilderHeader from './BuilderHeader';
import { wizardSelector, wizardStateToProps } from './commons';
import withExitButton from './enhancers/withExitButton';

const Toolbar = compose(
    connect(wizardSelector, {
        setPage,
        insertWidget,
        onResetChange: onEditorChange
    },
    wizardStateToProps
    ),
    withProps(({ onResetChange = () => { } }) => ({
        exitButton: {
            glyph: 'arrow-left',
            tooltipId: "widgets.builder.wizard.backToWidgetTypeSelection",
            onClick: () => onResetChange('widgetType', undefined)
        }
    })),
    withExitButton()
)(ToolbarComp);

const Builder = connect(
    wizardSelector,
    {
        onChange: onEditorChange
    },
    wizardStateToProps
)(TextWizardComp);

export default ({ enabled, onClose = () => {}} = {}) =>
    (<BorderLayout
        header={<BuilderHeader onClose={onClose}><Toolbar /></BuilderHeader>}
    >
        {enabled ? <Builder /> : null}
    </BorderLayout>);
