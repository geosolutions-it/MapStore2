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
const {widthProvider} = require('../layout/enhancers/gridLayout');

module.exports =
    compose(
        pure,
        defaultProps({
            breakpoints: { md: 480, xxs: 0 },
            cols: { md: 6, xxs: 1 }
        }),
        widthProvider({ overrideWidthProvider: true}),
        emptyState(
            ({widgets = []} = {}) => widgets.length === 0,
            ({loading}) => ({
                glyph: "dashboard",
                title: loading ? <Message msgId="loading" /> : <Message msgId="dashboard.emptyTitle" />
            })
        ),
        defaultProps({
            isWidgetSelectable: () => true
        }),
        withSelection
    )(require('../widgets/view/WidgetsView'));
