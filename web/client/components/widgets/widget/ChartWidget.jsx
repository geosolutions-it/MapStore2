/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const TableView = require('./TableView');
const ChartView = require('./ChartView');

const WidgetContainer = require('./WidgetContainer');
const {
    Glyphicon
} = require('react-bootstrap');

const renderHeaderLeftTopItem = ({ showTable, toggleTableView = () => {}} = {}) => {
    if (showTable) {
        return <Glyphicon onClick={() => {toggleTableView(); }} glyph="arrow-left pull-left"/>;
    }
    return null;
};


module.exports = ({
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
    onDelete = () => {},
    toggleTableView = () => {},
    toggleDeleteConfirm = () => {},
    ...props}) =>
    (<WidgetContainer
        id={`widget-chart-${id}`}
        headerStyle={headerStyle}
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
