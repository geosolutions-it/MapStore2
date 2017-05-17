/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDataGrid = require('react-data-grid');
const {Button, ButtonToolbar, Glyphicon} = require('react-bootstrap');

/**
 * Component for rendering a feature grid.
 * @memberof components.featuredockedgrid
 * @class
 * @prop {object} [columns] the columns rendered in the header. Each object is composed by key,name,resizable
 * @prop {number} headerRowHeight the height in pixels of the rows in the header
 * @prop {number} minHeight the min height of the grid container
 * @prop {number} minWidth the min width of the grid container
 * @prop {function} onRowsSelected. The method to call when checkbox is checked.
 * @prop {function} onRowsDeselected. The method to call when checkbox is un-checked.
 * @prop {string} position the position of the docked panel where this component is wrapped
 * @prop {string} refDataGrid the reference to the react-data-grid-component
 * @prop {number} rowHeight the height of the rows in the grid
 * @prop {string} rowKey the key used to distinguish rows
 * @prop {object} rows. The features passed to the grid
 * @prop {object} selectBy. It contains the selected rows
 * @prop {number} size. The size of the dock panel wrapping this component
 * @prop {object} style. The style of a wrapper div
 * @prop {object} toolbar. The tools of the grid
 * @prop {object} [tools] The tools of the grid
 *
 */
const FeatureDockedGrid = React.createClass({
    propTypes: {
        columns: React.PropTypes.array.isRequired,
        headerRowHeight: React.PropTypes.number,
        minHeight: React.PropTypes.number.isRequired,
        minWidth: React.PropTypes.number.isRequired,
        onRowsDeselected: React.PropTypes.func,
        onRowsSelected: React.PropTypes.func,
        position: React.PropTypes.string,
        refDataGrid: React.PropTypes.string,
        rowHeight: React.PropTypes.number.isRequired,
        rowKey: React.PropTypes.string,
        rows: React.PropTypes.array.isRequired,
        selectBy: React.PropTypes.object,
        size: React.PropTypes.number,
        style: React.PropTypes.object,
        toolbar: React.PropTypes.object,
        tools: React.PropTypes.array
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            headerRowHeight: 55,
            rowHeight: 30,
            minHeight: 250,
            minWidth: 600,
            onRowsDeselected: () => {},
            onRowsSelected: () => {},
            refDataGrid: "grid",
            rows: [],
            rowKey: "id",
            tools: [],
            columns: [],
            toolbar: {},
            selectBy: {},
            style: { height: "400px", width: "800px" }
        };
    },
    getInitialState() {
        return {
            minHeight: this.props.minHeight
        };
    },
    componentWillReceiveProps(newProps) {
        if (this.props.size !== newProps.size) {
            const pos = newProps.position;
            if (pos === "right" || pos === "left") {
                this.setState({minWidth: this.getWidth(this.refs.grid)});
            }
            if (pos === "top" || pos === "bottom") {
                this.setState({minHeight: this.getHeight(this.refs.grid)});
            }
        }
    },
    getHeight(element) {
        return element && element.getDataGridDOMNode().clientHeight || this.props.minHeight;
    },
    getWidth(element) {
        return element && element.getDataGridDOMNode().clientWidth;
    },
    render() {
        let tools = [];
        if (this.props.toolbar.zoom) {
            tools.push(<Button key="zoom" onClick={this.zoomToFeatures}><Glyphicon glyph="zoom-in"/></Button>);
        }
        const rowText = this.props.selectBy.keys.values.length === 1 ? 'row' : 'rows';
        const rowsSelected = this.props.selectBy.keys.values.length || 0;
        tools = [...tools, this.props.tools];

        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                height: "calc(100% - 40px)"
            }}>
                <div id="FeatureDockedGrid" style={this.props.style}>
                    <ReactDataGrid
                        ref={this.props.refDataGrid}
                        rowKey={this.props.rowKey}
                        columns={this.props.columns}
                        rowGetter={this.rowGetter}
                        rowsCount={this.props.rows.length}
                        headerRowHeight={this.props.headerRowHeight}
                        rowHeight={this.props.rowHeight}
                        minHeight={this.state.minHeight || this.props.minHeight}
                        minWidth={this.state.minWidth || this.props.minWidth}
                        rowSelection={{
                            showCheckbox: true,
                            enableShiftSelect: true,
                            onRowsSelected: this.props.onRowsSelected,
                            onRowsDeselected: this.props.onRowsDeselected,
                            selectBy: this.props.selectBy
                        }}
                    />
                </div>
                <div id="feature-grid-toolbar">
                    <div style={{ position: "absolute",
                        left: 2,
                        bottom: 2}}>
                        <span>{rowsSelected} {rowText} selected</span>
                    </div>
                    <ButtonToolbar className="featuregrid-tools" style={{marginLeft: "0px", flex: "none", marginBottom: "2px", marginRight: "2px"}} bsSize="sm">
                        {tools.map((tool) => tool)}
                        <Button key="save" value="save">Save</Button>
                        <Button key="reset" value="reset">Reset</Button>
                    </ButtonToolbar>
                </div>
            </div>);
    },

    rowGetter(i) {
        return this.props.rows[i];
    }

});

module.exports = FeatureDockedGrid;
