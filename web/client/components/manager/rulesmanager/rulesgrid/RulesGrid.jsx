const React = require('react');
const PropTypes = require('prop-types');
const RuleRenderer = require('./renderers/RuleRenderer');
const AccessFormatter = require('./formatters/AccessFormatter');

const { Draggable} = require('react-data-grid-addons');

const DataGrid = require('../../../data/grid/DataGrid');
const { Container: DraggableContainer, RowActionsCell, DropTargetRowContainer: dropTargetRowContainer } = Draggable;

const Message = require('../../../I18N/Message');

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
        onReordeRows: PropTypes.func
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
        columns: [
            { key: 'rolename', name: <Message msgId={"rulesmanager.role"} />, filterable: true },
            { key: 'username', name: <Message msgId={"rulesmanager.user"} />, filterable: true },
            { key: 'ipaddress', name: 'IP', filterable: false},
            { key: 'service', name: <Message msgId={"rulesmanager.service"} />, filterable: true },
            { key: 'request', name: <Message msgId={"rulesmanager.request"} />, filterable: true },
            { key: 'workspace', name: <Message msgId={"rulesmanager.workspace"} />, filterable: true },
            { key: 'layer', name: <Message msgId={"rulesmanager.layer"} />, filterable: true },
            { key: 'grant', name: <Message msgId={"rulesmanager.access"} />, formatter: AccessFormatter, filterable: false }]
    };

    componentDidMount() {
        if (this.props.rowsCount > 0) {
            this.grid.scrollListener();
        }
    }
    componentDidUpdate = ({rowsCount}) => {
        if (this.props.rowsCount > 0 && rowsCount !== this.props.rowsCount) {
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
                    rowActionsCell={RowActionsCell}
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
        }
        let selectedRows = this._getSelectedRow(this.props.rowKey, this.props.selectedIds, this.props.rows);
        let draggedRows = this.isDraggedRowSelected(selectedRows, e.rowSource) ? selectedRows : [e.rowSource.data];
        this.props.onReordeRows({rules: draggedRows, targetPriority: e.rowTarget.data.priority});
    };
}

module.exports = RulesGrid;
