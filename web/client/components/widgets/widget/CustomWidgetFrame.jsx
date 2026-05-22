/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { compose } from 'recompose';

import WidgetContainer from './WidgetContainer';
import { hidableWidget, defaultIcons, withHeaderTools } from '../enhancers/tools';

/**
 * Base frame for custom widgets.
 * Renders WidgetContainer with the custom Component as children.
 * Uses the shared header enhancers for visibility and header tools.
 */
const CustomWidgetFrameBase = ({
    Component,
    id,
    title,
    headerStyle,
    icons,
    topLeftItems,
    topRightItems,
    dataGrid = {},
    options = {},
    ...rest
}) => (
    <WidgetContainer
        id={`widget-custom-${id}`}
        title={title}
        headerStyle={headerStyle}
        isDraggable={dataGrid.isDraggable}
        icons={icons}
        topLeftItems={topLeftItems}
        topRightItems={topRightItems}
        options={options}
    >
        <Component {...rest} id={id} title={title} />
    </WidgetContainer>
);

CustomWidgetFrameBase.displayName = 'CustomWidgetFrame';

const CustomWidgetFrame = compose(
    hidableWidget(),
    defaultIcons(),
    withHeaderTools()
)(CustomWidgetFrameBase);

export default CustomWidgetFrame;
