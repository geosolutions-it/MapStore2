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
import ColorSelector from '@mapstore/components/style/ColorSelector';
import ReactDataGrid from 'react-data-grid';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import localizedProps from '@mapstore/components/misc/enhancers/localizedProps';


class BaseTable extends React.Component {

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
    },
    {
        key: 'color',
        name: 'Chart Trace Color',
        width: 140,
        formatter: (props) => {
            const { traceColor, selectionId, onChangeTraceColor } = props.row;
            return(
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

    render() {
        return(
            <div>
                <ReactDataGrid
                    rowKey="selectionId"
                    columns={this.COLUMNS}
                    rowGetter={(i) => ({ ...(this.props?.timeSeriesFeaturesSelections[i] || {}), onChangeTraceColor: this.props?.onChangeTraceColor } || {})}
                    rowsCount={this.props?.timeSeriesFeaturesSelections.length || 0}
                    getCellActions={this.getCellActions.bind(this)}
                />
            </div>
        );
    }
}

export const SelectionTable = localizedProps('columns', 'name')(BaseTable);