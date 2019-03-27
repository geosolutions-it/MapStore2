/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Message = require('../../components/I18N/Message');
const {onEditorChange} = require('../../actions/widgets');
const {connect} = require('react-redux');
const BorderLayout = require('../../components/layout/BorderLayout');
const BuilderHeader = require('./BuilderHeader');
const TypeSelector = connect(
    () => ({}),
    {
        onSelect: (type) => onEditorChange("widgetType", type)
    }
)(require('../../components/widgets/builder/WidgetTypeSelector'));

/**
 * Builder page that shows the type selector
 */
module.exports = ({enabled, onClose = () => {}, typeFilter} = {}) =>

    (<BorderLayout
        className="bg-body"
        header={<BuilderHeader onClose={onClose}><Message msgId="widgets.selectWidgetType" /></BuilderHeader>}
    >
        {enabled ? <TypeSelector typeFilter={typeFilter}/> : null}
    </BorderLayout>);
