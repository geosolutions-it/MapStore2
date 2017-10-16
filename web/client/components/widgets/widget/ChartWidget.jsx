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
const {
     Glyphicon,
     ButtonToolbar,
     DropdownButton,
     MenuItem
} = require('react-bootstrap');

module.exports = ({
    title,
    description,
    data = [],
    series = [],
    loading,
    toggleTableView= () => {},
    deleteConfirm= () => {},
    ...props}) =>
    (<div className="mapstore-widget-card">
        <div className="mapstore-widget-info">
            <div className="mapstore-widget-title">
                {loading
                    ? <span className="mapstore-widget-loader"/>
                    : null}
                {props.showTable
                    ? <Glyphicon onClick={() => {toggleTableView(); }} glyph="arrow-left pull-left"/>
                        : null}
                {title}
                <span className="mapstore-widget-options">

                    {props.showTable
                        ? null : <ButtonToolbar>
                        <DropdownButton pullRight bsStyle="default" title={<Glyphicon glyph="option-vertical" />} noCaret id="dropdown-no-caret">
                            <MenuItem onClick={() => {toggleTableView(); }} eventKey="1"><Glyphicon glyph="features-grid"/>&nbsp;Show chart data</MenuItem>
                            <MenuItem onClick={() => {deleteConfirm(); }} eventKey="2"><Glyphicon glyph="trash"/>&nbsp;Delete</MenuItem>
                            <MenuItem eventKey="3"><Glyphicon glyph="pencil"/>&nbsp;Edit</MenuItem>
                            <MenuItem eventKey="3"><Glyphicon glyph="download"/>&nbsp;Download data</MenuItem>
                        </DropdownButton>
                    </ButtonToolbar>}
                </span>
            </div>
            <div className="mapstore-widget-layer">
                Layer Title
            </div>
            <div className="mapstore-widget-description">
                {description}
            </div>
            {description
                ? <div className="mapstore-widget-description">
                        {'Attribute: ' + description}
                    </div>
                : null}
        </div>
        {props.showTable
            ? <TableView data={data} />
        : <ChartView isAnimationActive={!loading} data={data} series={series} {...props}/>}
    </div>
);
