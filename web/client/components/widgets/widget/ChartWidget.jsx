/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Message = require('../../I18N/Message');
const TableView = require('./TableView');
const ChartView = require('./ChartView');
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
    headerStyle,
    data = [],
    series = [],
    loading,
    showTable,
    canEdit = true,
    confirmDelete= false,
    toggleTableView= () => {},
    toggleDeleteConfirm= () => {},
    exportCSV = () => {},
    exportImage = () => {},
    onEdit= () => {},
    onDelete=() => {},
    ...props}) =>
    (<WidgetContainer
        id={`widget-chart-${id}`}
        headerStyle={headerStyle}
        title={title}
        topLeftItems={renderHeaderLeftTopItem({loading, title, description, showTable, toggleTableView})}
        confirmDelete={confirmDelete}
        onDelete={onDelete}
        toggleDeleteConfirm = {toggleDeleteConfirm}
        topRightItems={showTable
            ? null : <ButtonToolbar>
            <DropdownButton pullRight bsStyle="default" className="widget-menu" title={<Glyphicon glyph="option-vertical" />} noCaret id="dropdown-no-caret">
                <MenuItem onClick={() => toggleTableView()} eventKey="1"><Glyphicon glyph="features-grid"/>&nbsp;<Message msgId="widgets.widget.menu.showChartData" /></MenuItem>
                {canEdit
                    ? [
                        <MenuItem onClick={() => onEdit()} eventKey="3"><Glyphicon glyph="pencil"/>&nbsp;<Message msgId="widgets.widget.menu.edit" /></MenuItem>,
                        <MenuItem onClick={() => toggleDeleteConfirm(true)} eventKey="2"><Glyphicon glyph="trash"/>&nbsp;<Message msgId="widgets.widget.menu.delete" /></MenuItem>]
                    : null}
                <MenuItem onClick={() => exportCSV({data, title})} eventKey="4"><Glyphicon className="exportCSV" glyph="download"/>&nbsp;<Message msgId="widgets.widget.menu.downloadData" /></MenuItem>
                <MenuItem onClick={() => exportImage({widgetDivId: `widget-chart-${id}`, title})} eventKey="4"><Glyphicon className="exportImage" glyph="download"/>&nbsp;<Message msgId="widgets.widget.menu.exportImage" /></MenuItem>
            </DropdownButton>
        </ButtonToolbar>}
        >
        {showTable
            ? <TableView data={data} {...props}/>
        : <ChartView id={id} isAnimationActive={!loading} loading={loading} data={data} series={series} iconFit {...props} />}
        </WidgetContainer>

);
