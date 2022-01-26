/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import ColorSelector from '@mapstore/components/style/ColorSelector';
import { SELECTION_TYPES } from '../constants';
import ReactDataGrid from 'react-data-grid';
import { Editors } from "react-data-grid-addons";
import PropTypes from 'prop-types';
import localizedProps from '@mapstore/components/misc/enhancers/localizedProps';

const { DropDownEditor } = Editors;
const operationTypes = [
    { id: "Count", value: "COUNT"},
    { id: "Sum", value: "SUM"},
    { id: "Average", value: "AVG"},
    { id: "StdDev", value: "STDDEV"},
    { id: "Min", value: "MIN"},
    { id: "Max", value: "MAX"}
];
const OperationsTypeEditor = <DropDownEditor options={operationTypes} />;
class BaseTable extends React.Component {

    COLUMNS = [{
        key: 'selectionName',
        sortable: false,
        width: 140,
        name: 'Selection Name',
        resizable: true
    }, {
        key: 'selectionType',
        sortable: false,
        width: 140,
        name: 'Selection Type',
        resizable: true
    },
    {
        key: 'aggregateFunctionLabel',
        name: 'Operation Type',
        sortable: false,
        width: 140,
        editable: ({selectionType}) => selectionType !== SELECTION_TYPES.POINT,  
        editor:  OperationsTypeEditor,
        formatter: ({row}) => row.selectionType === SELECTION_TYPES.POINT ? <div>No Operation</div> : <div>{row.aggregateFunctionLabel}</div>
    },
    {
        key: 'color',
        name: 'Chart Trace Color',
        sortable: false,
        width: 140,
        formatter: (props) => {
            const { traceColor, selectionId, onChangeTraceColor } = props.row;
            return (
                <ColorSelector
                    key={traceColor}
                    color={traceColor}
                    disableAlpha
                    format="hex"
                    onChangeColor={(color) => {
                        onChangeTraceColor(selectionId, color)
                    }}
                />
            );
        }
    },
    {
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

    onGridRowsUpdated ({cellKey, rowIds, updated}) {
        if (cellKey === 'aggregateFunctionLabel') {
            rowIds.forEach(rowId => {
                const label = updated[cellKey];
                const value = operationTypes.filter(item => item.value === label)[0].id;
                this.props.onChangeAggregateFunction(rowId, { value, label } );
            });
        }
    }

    render() {
        return(
            <div>
                <ReactDataGrid
                    rowKey="selectionId"
                    columns={this.COLUMNS}
                    enableCellSelect={true}
                    rowGetter={(i) => ({
                        ...(this.props?.timeSeriesFeaturesSelections[i] || {}),
                        onChangeTraceColor: this.props?.onChangeTraceColor
                    } || {})}
                    rowsCount={this.props?.timeSeriesFeaturesSelections.length || 0}
                    getCellActions={this.getCellActions.bind(this)}
                    onGridRowsUpdated={this.onGridRowsUpdated.bind(this)}
                />
            </div>
        );
    }
}

export const SelectionTable = localizedProps('columns', 'name')(BaseTable);