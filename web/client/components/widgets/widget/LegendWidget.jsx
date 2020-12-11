/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import emptyLegendState from '../enhancers/emptyLegendState';
import LegendViewComp from './LegendView';
import WidgetContainer from './WidgetContainer';

const LegendView = emptyLegendState()(LegendViewComp);

export default ({
    toggleDeleteConfirm = () => {},
    id, title,
    icons,
    headerStyle,
    confirmDelete = false,
    topRightItems,
    dataGrid = {},
    onDelete = () => {},
    ...props
} = {}) =>
    (<WidgetContainer id={`widget-text-${id}`} title={title} confirmDelete={confirmDelete} onDelete={onDelete} toggleDeleteConfirm={toggleDeleteConfirm} headerStyle={headerStyle}
        icons={icons}
        topRightItems={topRightItems}
        isDraggable={dataGrid.isDraggable}
    >
        <LegendView {...props} />
    </WidgetContainer>

    );
