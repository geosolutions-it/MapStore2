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
    canEdit = true,
    toggleTableView= () => {},
    toggleDeleteConfirm= () => {},
    onEdit= () => {},
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
        topRightItems={canEdit
            ? (<ButtonToolbar>
            <DropdownButton pullRight bsStyle="default" className="widget-menu" title={<Glyphicon glyph="option-vertical" />} noCaret id="dropdown-no-caret">
                <MenuItem onClick={() => onEdit()} eventKey="3"><Glyphicon glyph="pencil"/>&nbsp;<Message msgId="widgets.widget.menu.edit" /></MenuItem>
                <MenuItem onClick={() => toggleDeleteConfirm(true)} eventKey="2"><Glyphicon glyph="trash"/>&nbsp;<Message msgId="widgets.widget.menu.delete" /></MenuItem>
            </DropdownButton>
        </ButtonToolbar>) : null}>
        <CounterView id={id} isAnimationActive={!loading} loading={loading} data={data} series={series} iconFit {...props} />
    </WidgetContainer>);
