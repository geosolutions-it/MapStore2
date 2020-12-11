/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import TableView from './TableView';
import ChartView from './ChartView';

import WidgetContainer from './WidgetContainer';
import {
    Glyphicon
} from 'react-bootstrap';

const renderHeaderLeftTopItem = ({ showTable, toggleTableView = () => {}} = {}) => {
    if (showTable) {
        return <Glyphicon onClick={() => {toggleTableView(); }} glyph="arrow-left pull-left"/>;
    }
    return null;
};

const ChartWidget = ({
    id,
    title,
    description,
    headerStyle,
    data = [],
    series = [],
    loading,
    icons,
    showTable,
    topRightItems,
    confirmDelete = false,
    dataGrid = {},
    onDelete = () => {},
    toggleTableView = () => {},
    toggleDeleteConfirm = () => {},
    ...props}) =>
    (<WidgetContainer
        id={`widget-chart-${id}`}
        headerStyle={headerStyle}
        isDraggable={dataGrid.isDraggable}
        title={title}
        icons={icons}
        topLeftItems={renderHeaderLeftTopItem({loading, title, description, showTable, toggleTableView})}
        confirmDelete={confirmDelete}
        onDelete={onDelete}
        toggleDeleteConfirm = {toggleDeleteConfirm}
        topRightItems={topRightItems}
    >
        {showTable
            ? <TableView data={data} {...props}/>
            : <ChartView id={id} isAnimationActive={!loading} loading={loading} data={data} series={series} iconFit {...props} />}
    </WidgetContainer>

    );

export default ChartWidget;
