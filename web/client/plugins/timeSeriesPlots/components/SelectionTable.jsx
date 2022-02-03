/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon, Tooltip } from 'react-bootstrap';
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
import { getDefaultAggregationOperations } from '../../../utils/WidgetsUtils';
import { getMessageById } from '../../../utils/LocaleUtils';
import { getTooltip } from '../utils';

const { DropDownEditor } = Editors;
class BaseTable extends React.Component {

    static contextTypes = {
        messages: PropTypes.object
    };

    operationTypes = getDefaultAggregationOperations().map(({value, label}) => ({
        id: value, value: getMessageById(this.context.messages, label)
    }));
    
    OperationsTypeEditor = <DropDownEditor options={this.operationTypes} />;

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
            name: getMessageById(this.context.messages, 'timeSeriesPlots.selectionNameTHeader'),
            resizable: true
        }, 
        {
            key: 'selectionType',
            sortable: false,
            name: getMessageById(this.context.messages, 'timeSeriesPlots.selectionTypeTHeader'),
            resizable: true
        },
        {
            key: 'aggregateFunctionLabel',
            name: getMessageById(this.context.messages, 'timeSeriesPlots.operationTypeTHeader'),
            sortable: false,
            editable: ({selectionType}) => selectionType !== SELECTION_TYPES.POINT,  
            editor:  this.OperationsTypeEditor,
            formatter: ({row}) => row.selectionType === SELECTION_TYPES.POINT ? 
                <div><Message msgId="timeSeriesPlots.noOperationTCell"/></div> :
                <div>{row.aggregateFunctionLabel}</div>
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
                <OverlayTrigger placement="top" overlay={getTooltip("tsp-clear-all", "timeSeriesPlots.clearAllSelections")}>
                    <TButton
                        tButtonClass="clear-all-btn"
                        buttonSize="sm"
                        bsStyle="danger"
                        glyph="remove"
                        onClick={() => { this.props.onClearAllSelections() }} />
                </OverlayTrigger>
            }: {})
        }
    ];

    getCellActions (column, row) {
        const cellActions = {
            'remove': [{icon: 
            <OverlayTrigger placement="right" overlay={getTooltip("tsp-clear-selection", "timeSeriesPlots.clearSelection")}>
                <Glyphicon glyph="remove" />
            </OverlayTrigger> , callback: () => { this.props.onRemoveTableSelectionRow(row.selectionId) }}],
            'zoomTo': [
                {
                    icon: row.selectionGeometry ? 
                        <OverlayTrigger placement="top" overlay={getTooltip("tsp-zoom-object", "featuregrid.zoomObject")}>
                            <Glyphicon glyph="zoom-to" />
                        </OverlayTrigger> :
                        <OverlayTrigger placement="top" overlay={ getTooltip("tsp-save-features", "featuregrid.missingGeometry")}>
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
                    const value = this.operationTypes.filter(item => item.value === label)[0].id;
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