/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';

import { onEditorChange } from '../../actions/widgets';
import Message from '../../components/I18N/Message';
import BorderLayout from '../../components/layout/BorderLayout';
import WidgetTypeSelector from '../../components/widgets/builder/WidgetTypeSelector';
import BuilderHeader from './BuilderHeader';

const TypeSelector = connect(
    () => ({}),
    {
        onSelect: (type) => onEditorChange("widgetType", type)
    }
)(WidgetTypeSelector);

/**
 * Builder page that shows the type selector
 */
export default ({enabled, onClose = () => {}, typeFilter} = {}) =>

    (<BorderLayout
        className="bg-body"
        header={<BuilderHeader onClose={onClose}><Message msgId="widgets.selectWidgetType" /></BuilderHeader>}
    >
        {enabled ? <TypeSelector typeFilter={typeFilter}/> : null}
    </BorderLayout>);
