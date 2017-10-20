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
const InfoPopover = require('./InfoPopover');
const BorderLayout = require('../../layout/BorderLayout');
const ConfirmModal = require('../../maps/modals/ConfirmModal');
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
    return <InfoPopover placement="top" title={title} text={description}/>;
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
    toggleTableView= () => {},
    toggleDeleteConfirm= () => {},
    onEdit= () => {},
    onDelete=() => {},
    ...props}) =>
    (<div className="mapstore-widget-card">
        <BorderLayout header={(<div className="mapstore-widget-info">
                    <div className="mapstore-widget-title">
                        {renderHeaderLeftTopItem({loading, title, description, showTable, toggleTableView})}
                        {title}
                        <span className="mapstore-widget-options">
                            {showTable
                                ? null : <ButtonToolbar>
                                <DropdownButton pullRight bsStyle="default" title={<Glyphicon glyph="option-vertical" />} noCaret id="dropdown-no-caret">
                                    <MenuItem onClick={() => toggleTableView()} eventKey="1"><Glyphicon glyph="features-grid"/>&nbsp;Show chart data</MenuItem>
                                    <MenuItem onClick={() => toggleDeleteConfirm(true)} eventKey="2"><Glyphicon glyph="trash"/>&nbsp;Delete</MenuItem>
                                    <MenuItem onClick={() => onEdit()} eventKey="3"><Glyphicon glyph="pencil"/>&nbsp;Edit</MenuItem>
                                    <MenuItem eventKey="4"><Glyphicon glyph="download"/>&nbsp;Download data</MenuItem>
                                </DropdownButton>
                            </ButtonToolbar>}
                        </span>
                    </div>
                </div>)}>
                {showTable
                    ? <TableView data={data} {...props}/>
                : <ChartView id={id} isAnimationActive={!loading} loading={loading} data={data} series={series} {...props} />}
                {confirmDelete ? <ConfirmModal
                    confirmText={'Delete'}
                    cancelText={'Cancel'}
                    titleText={'Delete Widget'}
                    body={'Delete Widget'}
                    show={confirmDelete}
                    onClose={() => toggleDeleteConfirm(false)}
                    onConfirm={() => onDelete(id) }/> : null}
        </BorderLayout>
    </div>
);
