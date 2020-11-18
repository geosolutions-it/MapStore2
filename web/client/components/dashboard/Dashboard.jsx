/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { compose, defaultProps, pure } from 'recompose';

import Message from '../I18N/Message';
import { widthProvider } from '../layout/enhancers/gridLayout';
import emptyState from '../misc/enhancers/emptyState';
import withSelection from '../widgets/view/enhancers/withSelection';
import WidgetsView from '../widgets/view/WidgetsView';

export default compose(
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
)(WidgetsView);
