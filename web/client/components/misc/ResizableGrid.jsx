/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDataGrid = require('react-data-grid');
/**
 * Component for rendering a feature grid.
 * @memberof components.ResizableGrid
 * @class
 * @prop {boolean} autoHeight if true it calculates the available height for the grid
 * @prop {boolean} autoWidth if true it sets the minWidth available width for the grid
 * @prop {object[]} columns the columns rendered in the header. Each object is composed by key,name,resizable
 * @prop {number} headerRowHeight the height in pixels of the rows in the header
 * @prop {number} minHeight the min height of the grid container
 * @prop {number} minWidth the min width of the grid container
 * @prop {function} onRowsSelected. The method to call when checkbox is checked.
 * @prop {function} onRowsDeselected. The method to call when checkbox is un-checked.
 * @prop {string} refGrid the reference to the react-data-grid-component
 * @prop {number} rowHeight the height of the rows in the grid
 * @prop {string} rowKey the key used to distinguish rows
 * @prop {object} rows. The features passed to the grid
 * @prop {object} selectBy. It contains the selected rows
 * @prop {number} size. The size of the dock panel wrapping this component
 *
 */
const ResizableGrid = React.createClass({
    propTypes: {
        autoWidth: React.PropTypes.bool,
        autoHeight: React.PropTypes.bool,
        columns: React.PropTypes.array.isRequired,
        headerRowHeight: React.PropTypes.number,
        minHeight: React.PropTypes.number.isRequired,
        minWidth: React.PropTypes.number,
        onRowsDeselected: React.PropTypes.func,
        onRowsSelected: React.PropTypes.func,
        onMount: React.PropTypes.func,
        refGrid: React.PropTypes.string,
        rowHeight: React.PropTypes.number.isRequired,
        rowKey: React.PropTypes.string,
        rows: React.PropTypes.array.isRequired,
        selectBy: React.PropTypes.object,
        size: React.PropTypes.object
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            autoWidth: true,
            autoHeight: true,
            columns: [],
            headerRowHeight: 55,
            minHeight: 250,
            minWidth: null,
            onRowsDeselected: () => {},
            onRowsSelected: () => {},
            refGrid: "grid",
            rowHeight: 30,
            rowKey: "id",
            rows: [],
            selectBy: {keys: {values: []}},
            onMount: () => {}
        };
    },
    getInitialState() {
        return {
            minHeight: this.props.minHeight,
            minWidth: this.props.minWidth
        };
    },
    componentWillReceiveProps(newProps) {
        if (this.props.size !== newProps.size) {
            this.setState({
                minWidth: newProps.size.width ? this.getWidth(this.refs.grid) : null,
                minHeight: this.getHeight(this.refs.grid)}
            );
        }
    },
    getHeight(element) {
        return element && element.getDataGridDOMNode().clientHeight || this.props.minHeight;
    },
    getWidth(element) {
        return element && element.getDataGridDOMNode().clientWidth || this.props.minWidth;
    },
    render() {
        return (
            <ReactDataGrid
                columns={this.props.columns}
                headerRowHeight={this.props.headerRowHeight}
                minHeight={this.state.minHeight || this.props.minHeight}
                minWidth={this.state.minWidth || this.props.minWidth}
                ref={this.props.refGrid}
                rowGetter={this.rowGetter}
                rowHeight={this.props.rowHeight}
                rowKey={this.props.rowKey}
                rowSelection={{
                    showCheckbox: true,
                    enableShiftSelect: true,
                    onRowsSelected: this.props.onRowsSelected,
                    onRowsDeselected: this.props.onRowsDeselected,
                    selectBy: this.props.selectBy
                }}
                rowsCount={this.props.rows.length}
            />
        );
    },
    rowGetter(i) {
        return this.props.rows[i];
    }
});

module.exports = ResizableGrid;
