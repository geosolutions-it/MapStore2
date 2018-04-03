/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { isWidgetSelectionActive } = require('../../../../selectors/widgets');
const withMask = require('../../../../components/misc/enhancers/withMask');
const { connect } = require('react-redux');
const {createSelector} = require('reselect');
const {compose} = require('recompose');
const React = require('react');
const Message = require('../../../../components/I18N/Message');
module.exports = compose(
    connect(createSelector(isWidgetSelectionActive, (widgetSelectionActive) => ({ widgetSelectionActive }))),
    withMask(
        ({ widgetSelectionActive }) => widgetSelectionActive,
        () => <div style={{margin: "auto"}} ><Message msgId="widgets.builder.wizard.selectMapToConnect" /></div>,
        {alwaysWrap: true}
    )
);
