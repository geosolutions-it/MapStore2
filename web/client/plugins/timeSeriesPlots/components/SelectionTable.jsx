/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { createStructuredSelector } from 'reselect';

import ReactDataGrid from 'react-data-grid';
import { connect } from 'react-redux';
import { timeSeriesFeaturesSelectionsSelector } from '../selectors/timeSeriesPlots';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import localizedProps from '@mapstore/components/misc/enhancers/localizedProps';


class BaseTable extends React.Component {

    constructor(props) {
        super(props);
        this.getCellActions.bind(this);
    }

    COLUMNS = [{
        key: 'selectionName',
        sortable: true,
        width: 80,
        name: 'Selection Name',
        resizable: true
    }, {
        key: 'selectionType',
        sortable: true,
        width: 80,
        name: 'Selection Type',
        resizable: true
    },{
        key: 'action',
        width: 80,
        resizable: true
    }];

    getCellActions (column, row) {
        const cellActions = [{
            icon:  <Glyphicon glyph="remove"/>,
            callback: () => {
                const rows = [...this.rows]
                rows.splice(row.index, 1);
            }
        }];
        return column.key === 'action' ? cellActions : null;
    }

    render() {
        return(
            <div>
                <ReactDataGrid 
                    rowKey="selectionId"
                    // headerRowHeight={100} 
                    columns={this.COLUMNS}
                    rowGetter={(i) => (this.props?.timeSeriesFeaturesSelections[i] || '')}
                    rowsCount={this.props?.timeSeriesFeaturesSelections.length || 0}
                    getCellActions={this.getCellActions}
                />
            </div>
        );
    }
}

export const SelectionTable = connect(createStructuredSelector({
    timeSeriesFeaturesSelections: timeSeriesFeaturesSelectionsSelector
}), () => {})(localizedProps('columns', 'name')(BaseTable));