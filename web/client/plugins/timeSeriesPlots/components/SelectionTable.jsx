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
import PropTypes from 'prop-types';
import uuid from 'uuid';
import localizedProps from '@mapstore/components/misc/enhancers/localizedProps';


class BaseTable extends React.Component {

    constructor(props) {
        super(props);
    }

    COLUMNS = [{
        key: 'selectionName',
        sortable: true,
        width: 140,
        name: 'Selection Name',
        resizable: true
    }, {
        key: 'selectionType',
        sortable: true,
        width: 140,
        name: 'Selection Type',
        resizable: true
    },{
        key: 'action',
        width: 50,
        resizable: true
    }];

    getCellActions (column, row) {
        const cellActions = [{
            icon:  <Glyphicon glyph="remove"/>,
            callback: () => {
                this.props.onRemoveTableSelectionRow(row.selectionId)
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
                    getCellActions={this.getCellActions.bind(this)}
                />
            </div>
        );
    }
}

export const SelectionTable = localizedProps('columns', 'name')(BaseTable);