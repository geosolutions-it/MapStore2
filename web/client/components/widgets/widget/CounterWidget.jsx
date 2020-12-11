/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import CounterView from './CounterView';
import WidgetContainer from './WidgetContainer';
import { Glyphicon } from 'react-bootstrap';

const renderHeaderLeftTopItem = ({showTable, toggleTableView = () => {}} = {}) => {
    if (showTable) {
        return <Glyphicon onClick={() => {toggleTableView(); }} glyph="arrow-left pull-left"/>;
    }
    return null;
};


export default ({
    id,
    title,
    description,
    data = [],
    series = [],
    loading,
    showTable,
    confirmDelete = false,
    headerStyle,
    icons,
    topRightItems,
    dataGrid = {},
    toggleTableView = () => {},
    toggleDeleteConfirm = () => {},
    onDelete = () => {},
    ...props}) =>
    (<WidgetContainer
        className="counter-widget"
        id={`widget-chart-${id}`}
        title={title}
        isDraggable={dataGrid.isDraggable}
        icons={icons}
        topLeftItems={renderHeaderLeftTopItem({loading, title, description, showTable, toggleTableView})}
        confirmDelete={confirmDelete}
        onDelete={onDelete}
        toggleDeleteConfirm = {toggleDeleteConfirm}
        headerStyle={headerStyle}
        topRightItems={topRightItems}>
        <CounterView id={id} isAnimationActive={!loading} loading={loading} data={data} series={series} iconFit {...props} />
    </WidgetContainer>);
