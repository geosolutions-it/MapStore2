/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {pure, compose, defaultProps} = require('recompose');
const Message = require('../I18N/Message');
const emptyState = require('../misc/enhancers/emptyState');
const withSelection = require('../widgets/view/enhancers/withSelection');

module.exports =
    compose(
        pure,
        emptyState(
            ({widgets = []} = {}) => widgets.length === 0,
            () => ({
                glyph: "dashboard",
                title: <Message msgId="dashboard.emptyTitle" />
            })
        ),
        defaultProps({
            isWidgetSelectable: ({}) => true
        }),
        withSelection
    )(require('../widgets/view/WidgetsView'));
