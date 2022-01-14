/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import ReactDataGrid from 'react-data-grid';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import localizedProps from '@mapstore/components/misc/enhancers/localizedProps';


class BaseTable extends React.Component {

    constructor(props) {
        super(props);
        this.getCellActions.bind(this);
    }

    COLUMNS = [{
        key: 'selectionId',
        sortable: true,
        width: 80,
        name: 'Selection ID',
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

    // COLUMNS = [
    //     { key: "id", name: "ID", editable: true },
    //     { key: "title", name: "Title", editable: true },
    //     { key: "complete", name: "Complete", editable: true },
    //     { key: "action", name: "Action" }
    // ];

    rows = [
        { selectionId: "AOI 1", selectionType: "Area"},
        { selectionId: "AOI 2", selectionType: "Area"},
        { selectionId: "Point 1234", selectionType: "Point"}
      ]
    //   rows = [
    //     { index: 0, id: 0, title: "Task 1", complete: 20 },
    //     { index: 1, id: 1, title: "Task 2", complete: 40 },
    //     { index: 2, id: 2, title: "Task 3", complete: 60 }
    //   ]
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
                    // rowKey="selectionId"
                    // headerRowHeight={100} 
                    columns={this.COLUMNS}
                    rowGetter={(i) => this.rows[i]}
                    rowsCount={this.rows.length}
                    getCellActions={this.getCellActions}
                />
            </div>
        );
    }
}

export const SelectionTable = localizedProps('columns', 'name')(BaseTable);