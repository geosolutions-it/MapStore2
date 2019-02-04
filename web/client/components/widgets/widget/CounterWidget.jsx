/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Message = require('../../I18N/Message');

const CounterView = require('./CounterView');
const InfoPopover = require('./InfoPopover');
const WidgetContainer = require('./WidgetContainer');
const {
     Glyphicon,
     ButtonToolbar,
     DropdownButton,
     MenuItem
} = require('react-bootstrap');

const renderHeaderLeftTopItem = ({title, description, showTable, toggleTableView = () => {}} = {}) => {
    if (showTable) {
        return <Glyphicon onClick={() => {toggleTableView(); }} glyph="arrow-left pull-left"/>;
    }
    return title || description ? <InfoPopover placement="top" title={title} text={description}/> : null;
};


module.exports = ({
    id,
    title,
    description,
    data = [],
    series = [],
    loading,
    showTable,
    confirmDelete= false,
    headerStyle,
    topRightItems,
    toggleTableView= () => {},
    toggleDeleteConfirm= () => {},
    onDelete=() => {},
    ...props}) =>
    (<WidgetContainer
        className="counter-widget"
        id={`widget-chart-${id}`}
        title={title}
        topLeftItems={renderHeaderLeftTopItem({loading, title, description, showTable, toggleTableView})}
        confirmDelete={confirmDelete}
        onDelete={onDelete}
        toggleDeleteConfirm = {toggleDeleteConfirm}
        headerStyle={headerStyle}
        topRightItems={topRightItems}>
        <CounterView id={id} isAnimationActive={!loading} loading={loading} data={data} series={series} iconFit {...props} />
    </WidgetContainer>);
