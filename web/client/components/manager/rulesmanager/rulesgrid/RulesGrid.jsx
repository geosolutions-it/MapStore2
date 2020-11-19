/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';

import PropTypes from 'prop-types';
import RuleRenderer from './renderers/RuleRenderer';
import EmptyView from '../../../misc/EmptyView';
import { Draggable } from 'react-data-grid-addons';
import DataGrid from '../../../data/grid/DataGrid';
const { Container: DraggableContainer, DropTargetRowContainer: dropTargetRowContainer } = Draggable;
import PriorityActionCell from './renderers/PriorityActionCell';
const RowRenderer = dropTargetRowContainer(RuleRenderer);

class RulesGrid extends React.Component {
    static propTypes = {
        rowKey: PropTypes.string.isRequired,
        width: PropTypes.number,
        height: PropTypes.number,
        rows: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
        rowsCount: PropTypes.number,
        columns: PropTypes.array,
        onSelect: PropTypes.func,
        selectedIds: PropTypes.array,
        rowGetter: PropTypes.func,
        onGridScroll: PropTypes.func,
        onAddFilter: PropTypes.func,
        onReorderRows: PropTypes.func,
        isEditing: PropTypes.bool
    };
    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        rowKey: 'id',
        rows: [],
        onSort: () => {},
        onSelect: () => {},
        selectedIds: [],
        columns: [],
        isEditing: false
    };

    componentDidMount() {
        if (this.props.rowsCount > 0) {
            this.grid.scrollListener();
        }
    }
    componentDidUpdate = ({rowsCount, isEditing}) => {
        if (this.props.rowsCount > 0 && rowsCount !== this.props.rowsCount || (isEditing && !this.props.isEditing)) {
            this.grid.scrollListener();
        }
    }
    componentWillUnmount() {
        this.grid = null;
    }
    onRowsSelected = (rows) => {
        const selectedRules = this._getSelectedRow(this.props.rowKey, this.props.selectedIds, this.props.rows).concat(rows.map(({row}) => row).filter(({id}) => id !== "empty_row"));
        if (selectedRules.length > 0) {
            this.props.onSelect(selectedRules);
        }
    }
    onRowsDeselected = (rows) => {
        let rowIds = rows.map(r => r.row[this.props.rowKey]);
        const selectedIds = this.props.selectedIds.filter(i => rowIds.indexOf(i) === -1);
        this.props.onSelect(this._getSelectedRow(this.props.rowKey, selectedIds, this.props.rows));
    }
    render() {
        return (
            <DraggableContainer>
                <DataGrid
                    displayFilters
                    ref={(grid) => { this.grid = grid; }}
                    enableCellSelection={false}
                    emptyRowsView={() => <EmptyView glyph="inbox" />}
                    rowActionsCell={PriorityActionCell}
                    columns={this.props.columns}
                    rowGetter={this.props.rowGetter}
                    rowsCount={this.props.rowsCount}
                    rows={this.props.rows}
                    minHeight={this.props.height}
                    minWidth={this.props.width}
                    rowRenderer={<RowRenderer onRowDrop={this.reorderRows}/>}
                    virtualScroll
                    onGridScroll={this.props.onGridScroll}
                    onAddFilter={this.props.onAddFilter}
                    rowSelection={{
                        showCheckbox: true,
                        enableShiftSelect: true,
                        onRowsSelected: this.onRowsSelected,
                        onRowsDeselected: this.onRowsDeselected,
                        selectBy: {
                            keys: {rowKey: this.props.rowKey, values: this.props.selectedIds}
                        }}}/>
            </DraggableContainer>);
    }

    isDraggedRowSelected = (selectedRows, rowDragSource) => {
        if (selectedRows && selectedRows.length > 0) {
            let key = this.props.rowKey;
            return selectedRows.filter(r => r[key] === rowDragSource.data[key]).length > 0;
        }
        return false;
    };
    _getSelectedRow = ( rowKey = [], selectedKeys = [], rows = {}) => Object.keys(rows).reduce((sel, key) => sel.concat(rows[key].filter(row => selectedKeys.indexOf(row[rowKey]) !== -1)), [])

    reorderRows = (e) => {
        if (e.rowSource.data[this.props.rowKey] === "empty_row" || e.rowTarget.data[this.props.rowKey] === "empty_row") {
            return;
        } else if (e.rowSource.idx === e.rowTarget.idx) {
            return;
        }
        let selectedRows = this._getSelectedRow(this.props.rowKey, this.props.selectedIds, this.props.rows);
        let draggedRows = this.isDraggedRowSelected(selectedRows, e.rowSource) ? selectedRows : [e.rowSource.data];
        this.props.onReorderRows({rules: draggedRows, targetPriority: e.rowTarget.data.priority});
    };
}

export default RulesGrid;
