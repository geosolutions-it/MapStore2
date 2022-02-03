/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon, Tooltip} from 'react-bootstrap';
import ColorSelector from '@mapstore/components/style/ColorSelector';
import { SELECTION_TYPES } from '../constants';
import ReactDataGrid from 'react-data-grid';
import { Editors } from "react-data-grid-addons";
import PropTypes from 'prop-types';
import localizedProps from '@mapstore/components/misc/enhancers/localizedProps';
import bbox from '@turf/bbox';
import Message from '@mapstore/components/I18N/Message';
import OverlayTrigger from '@mapstore/components/misc/OverlayTrigger';
import TButton from './TButton';

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

    getColumns = () => [
        {
            name: '',
            key: "zoomTo",
            width: 35,
            frozen: true
        },
        {
            key: 'selectionName',
            editable: true,
            sortable: false,
            name: 'Selection Name',
            resizable: true
        }, {
            key: 'selectionType',
            sortable: false,
            name: 'Selection Type',
            resizable: true
        },
        {
            key: 'aggregateFunctionLabel',
            name: 'Operation Type',
            sortable: false,
            editable: ({selectionType}) => selectionType !== SELECTION_TYPES.POINT,  
            editor:  OperationsTypeEditor,
            formatter: ({row}) => row.selectionType === SELECTION_TYPES.POINT ? <div>No Operation</div> : <div>{row.aggregateFunctionLabel}</div>
        },
        {
            key: 'color',
            name: 'Chart Trace Color',
            sortable: false,
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
            key: 'remove',
            width: 40,
            ...(this.props?.timeSeriesFeaturesSelections && this.props.timeSeriesFeaturesSelections.length ? 
            {
                headerRenderer : 
                <TButton 
                    tButtonClass="clear-all-btn"
                    buttonSize="sm"
                    bsStyle="danger"
                    glyph="remove"
                    onClick={() => { this.props.onClearAllSelections() }} />
            }: {})
        }
    ];

    getCellActions (column, row) {
        const cellActions = {
            'remove': [{icon: <Glyphicon glyph="remove" />, callback: () => { this.props.onRemoveTableSelectionRow(row.selectionId) }}],
            'zoomTo': [
                {
                    icon: row.selectionGeometry ? 
                        <OverlayTrigger placement="top" overlay={<Tooltip id="fe-zoom-object"><Message msgId="featuregrid.zoomObject"/></Tooltip>}>
                            <Glyphicon glyph="zoom-to" />
                        </OverlayTrigger> :
                        <OverlayTrigger placement="top" overlay={<Tooltip id="fe-save-features"><Message msgId="featuregrid.missingGeometry"/></Tooltip>}>
                            <Glyphicon glyph="exclamation-mark" />
                        </OverlayTrigger>,
                    callback: () => {
                        const { extent = {}, coordinates = [], type = '', projection = 'EPSG:4326'} = row?.selectionGeometry;
                        if (type && type === 'Polygon') {
                            if (extent.length) {
                                this.props.onZoomToSelectionExtent(extent, projection);
                            }
                        } else if (type && type === 'Point') {
                            if (coordinates.length > 1) {
                                this.props.onZoomToSelectionPoint(coordinates, 21, projection);
                            }
                        }
                    }
                }
            ]
        }
        return cellActions[column.key] ?? null;
    }

    onGridRowsUpdated ({cellKey, rowIds, updated}) {
        switch(cellKey) {
            case 'aggregateFunctionLabel':
                rowIds.forEach(rowId => {
                    const label = updated[cellKey];
                    const value = operationTypes.filter(item => item.value === label)[0].id;
                    this.props.onChangeAggregateFunction(rowId, { value, label } );
                });
                break;
            case 'selectionName':
                rowIds.forEach(rowId => {
                    const selectionName = updated[cellKey];
                    this.props.onChangeSelectionName(rowId, selectionName );
                });
                break;
            default:
                break;
        }
    }

    render() {
        return(
            <div>
                <ReactDataGrid
                    rowKey="selectionId"
                    columns={this.getColumns()}
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