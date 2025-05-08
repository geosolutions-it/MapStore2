/*
 * Copyright 2025, GeoSolutions Sas.
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
import Message from '../../../I18N/Message';
const RowRenderer = dropTargetRowContainer(RuleRenderer);

class GSInstancesGrid extends React.Component {
    static propTypes = {
        rowKey: PropTypes.string.isRequired,
        width: PropTypes.number,
        height: PropTypes.number,
        rows: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
        rowsCount: PropTypes.number,
        columns: PropTypes.array,
        onSelect: PropTypes.func,
        selectedGSInstanceIds: PropTypes.array,
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
        selectedGSInstanceIds: [],
        columns: [
            { key: 'name', name: <Message msgId={"rulesmanager.gsInstanceGrid.name"} />, filterable: true, filterRenderer: false},
            { key: 'url', name: <Message msgId={"rulesmanager.gsInstanceGrid.url"} />, filterable: true, filterRenderer: false},
            { key: 'description', name: <Message msgId={"rulesmanager.gsInstanceGrid.description"} />, filterable: false}
        ],
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
        const selectedGSInstances = this._getSelectedRow(this.props.rowKey, this.props.selectedGSInstanceIds, this.props.rows).concat(rows.map(({row}) => row).filter(({id}) => id !== "empty_row"));
        if (selectedGSInstances.length > 0) {
            this.props.onSelect(selectedGSInstances);
        }
    }
    onRowsDeselected = (rows) => {
        let rowIds = rows.map(r => r.row[this.props.rowKey]);
        const selectedGSInstanceIds = this.props.selectedGSInstanceIds.filter(i => rowIds.indexOf(i) === -1);
        this.props.onSelect(this._getSelectedRow(this.props.rowKey, selectedGSInstanceIds, this.props.rows));
    }
    render() {
        return (
            <DraggableContainer>
                <DataGrid
                    ref={(grid) => { this.grid = grid; }}
                    enableCellSelection={false}
                    emptyRowsView={() => <EmptyView glyph="inbox" />}
                    columns={this.props.columns}
                    rowGetter={this.props.rowGetter}
                    rowsCount={this.props.rowsCount}
                    rows={this.props.rows}
                    minHeight={this.props.height}
                    minWidth={this.props.width}
                    rowRenderer={<RowRenderer />}
                    virtualScroll
                    onGridScroll={this.props.onGridScroll}
                    // onAddFilter={this.props.onAddFilter}
                    rowSelection={{
                        showCheckbox: true,
                        enableShiftSelect: true,
                        onRowsSelected: this.onRowsSelected,
                        onRowsDeselected: this.onRowsDeselected,
                        selectBy: {
                            keys: {rowKey: this.props.rowKey, values: this.props.selectedGSInstanceIds}
                        }}}/>
            </DraggableContainer>);
    }
    _getSelectedRow = ( rowKey = [], selectedKeys = [], rows = {}) => Object.keys(rows).reduce((sel, key) => sel.concat(rows[key].filter(row => selectedKeys.indexOf(row[rowKey]) !== -1)), [])
}

export default GSInstancesGrid;
