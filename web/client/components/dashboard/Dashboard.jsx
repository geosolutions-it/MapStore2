/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { compose, defaultProps, pure, withProps } from 'recompose';

import Message from '../I18N/Message';
import { widthProvider } from '../layout/enhancers/gridLayout';
import emptyState from '../misc/enhancers/emptyState';
import withSelection from '../widgets/view/enhancers/withSelection';
import WidgetsView from '../widgets/view/WidgetsView';

const WIDGET_MOBILE_RIGHT_SPACE = 18;

export default compose(
    pure,
    defaultProps({
        breakpoints: { md: 480, xxs: 0 },
        cols: { md: 6, xxs: 1 },
        minLayoutWidth: 480
    }),
    widthProvider({ overrideWidthProvider: true }),
    withProps(({width, minLayoutWidth }) => ({
        width: width <= minLayoutWidth ? width - WIDGET_MOBILE_RIGHT_SPACE : width,
        toolsOptions: { showMaximize: true }
    })),
    withProps(({width, height, maximized, minLayoutWidth, cols} = {}) => {
        const maximizedStyle = maximized?.widget ? {
            width: '100%',
            height: '100%',
            marginTop: 0,
            bottom: 'auto',
            top: 0,
            left: 0,
            zIndex: 99
        } : {};
        const maximizedProps = maximized?.widget ? {
            width,
            useDefaultWidthProvider: false,
            rowHeight: height - 50,
            breakpoints: { xxs: 0 },
            cols: { xxs: 1 }
        } : {};

        return ({
            className: "on-map",
            breakpoints: { md: minLayoutWidth, xxs: 0 },
            cols: cols || { md: 6, xxs: 1 },
            style: {
                position: 'absolute',
                zIndex: 50,
                ...maximizedStyle
            },
            ...maximizedProps
        });
    }),
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
