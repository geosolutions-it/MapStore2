/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {AgGridReact, reactCellRendererFactory} = require('ag-grid-react');
const {keys, isEqual, isFunction} = require('lodash');
const ZoomToRenderer = require("./ZoomToFeatureRenderer");
const {ButtonToolbar} = require('react-bootstrap');
const assign = require("object-assign");

const mapUtils = require('../../../utils/MapUtils');
const configUtils = require('../../../utils/ConfigUtils');
const CoordinateUtils = require('../../../utils/CoordinatesUtils');

const img = require('./images/magnifier.png');

require("ag-grid/dist/styles/ag-grid.css");
require("ag-grid/dist/styles/theme-fresh.css");

const FeatureGrid = React.createClass({
    propTypes: {
        features: React.PropTypes.oneOfType([React.PropTypes.array, React.PropTypes.func]),
        columnDefs: React.PropTypes.array,
        changeMapView: React.PropTypes.func,
        selectFeatures: React.PropTypes.func,
        style: React.PropTypes.object,
        virtualPaging: React.PropTypes.bool,
        paging: React.PropTypes.bool,
        pageSize: React.PropTypes.number,
        overflowSize: React.PropTypes.number,
        agGridOptions: React.PropTypes.object,
        columnDefaultOptions: React.PropTypes.object,
        excludeFields: React.PropTypes.array,
        map: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            features: null,
            columnDefs: null,
            changeMapView: () => {},
            selectFeatures: () => {},
            style: {height: "400px", width: "800px"},
            virtualPaging: false,
            paging: false,
            overflowSize: 10,
            pageSize: 15,
            agGridOptions: {},
            columnDefaultOptions: {
                width: 125
            },
            excludeFields: [],
            map: {}
        };
    },
    shouldComponentUpdate(nextProps) {
        return !isEqual(nextProps, this.props);
    },
    onGridReady(params) {
        this.api = params.api;
        this.columnApi = params.columnApi;
    },
    // Internal function that simulate data source getRows for in memory data
    getRows(params) {
        let data = this.props.features;
        if (params.sortModel && params.sortModel.length > 0) {
            data = this.sortData(params.sortModel, data);
        }
        let rowsThisPage = data.slice(params.startRow, params.endRow);
        let lastRow = -1;
        if (data.length <= params.endRow) {
            lastRow = data.length;
        }
        params.successCallback(rowsThisPage, lastRow);
    },
    render() {
        let isPagingOrVirtual = (this.props.virtualPaging || this.props.paging);
        return (
            <div>
            <div fluid={false} style={this.props.style} className="ag-fresh">
                <AgGridReact
                    virtualPaging={this.props.virtualPaging}
                    columnDefs={this.setColumnDefs()}
                    rowData={(!isPagingOrVirtual) ? this.props.features : null}
                    datasource={(isPagingOrVirtual) ? this.setDataSource() : null}
                    enableServerSideSorting={(isPagingOrVirtual)}
                    // or provide props the old way with no binding
                    onSelectionChanged={this.selectFeatures}
                    rowSelection="multiple"
                    enableColResize={true}
                    enableSorting={(!isPagingOrVirtual)}
                    toolPanelSuppressValues={true}
                    toolPanelSuppressGroups={true}
                    showToolPanel={false}
                    rowDeselection={true}
                    localeText={{
                        next: '>',
                        last: '>|',
                        first: '|<',
                        previous: '<'}}
                    onGridReady={this.onGridReady}
                    {...this.props.agGridOptions}
                />
            </div>
            <ButtonToolbar style={{marginTop: "5px", marginLeft: "0px"}}bsSize="sm">
                    <button onClick={this.zoomToFeatures}><img src={img} width={16}/></button>
                    <button onClick={() => {this.api.exportDataAsCsv(); }}>Export</button>
                    <button onClick={() => {this.api.showToolPanel(!this.api.isToolPanelShowing()); }}>Tool Panel</button>
            </ButtonToolbar>
            </div>);
    },
    // If props.columnDefs is missing try to generate from features, add zoomTo as first column
    setColumnDefs() {
        let defs = this.props.columnDefs;
        let defaultOptions = this.props.columnDefaultOptions;
        let exclude = this.props.excludeFields;
        if (!defs) {
            defs = keys(this.props.features[0].properties).filter((val) => {
                return exclude.indexOf(val) === -1;
            }).map(function(key) {
                return assign({}, defaultOptions, {headerName: key, field: "properties." + key});
            });
        }
        return [
        {
            onCellClicked: this.zoomToFeature,
            headerName: '',
            cellRenderer: reactCellRendererFactory(ZoomToRenderer),
            suppressSorting: true,
            suppressMenu: true,
            pinned: true,
            width: 25,
            suppressResize: true
        }].concat(defs);

    },
    // Generate datasource for pagination or virtual paging and infinite scrolling
    setDataSource() {
        return {
            rowCount: (isFunction(this.props.features)) ? -1 : this.props.features.length,
            getRows: (isFunction(this.props.features)) ? this.props.features : this.getRows,
            pageSize: this.props.pageSize,
            overflowSize: this.props.overflowSize
        };
    },
    zoomToFeature(params) {
        this.changeMapView([params.data.geometry]);
    },
    zoomToFeatures() {
        let geometries = [];
        let model = this.api.getModel();
        model.forEachNode(function(node) {
            geometries.push(node.data.geometry);
        });
        this.changeMapView(geometries);
    },
    changeMapView(geometries) {
        let extent = geometries.reduce((prev, next) => {
            return CoordinateUtils.extendExtent(prev, CoordinateUtils.getGeoJSONExtent(next));
        }, CoordinateUtils.getGeoJSONExtent(geometries[0]));
        const mapSize = this.props.map.size;
        let newZoom = 1;
        let newCenter = this.props.map.center;
        const proj = this.props.map.projection || "EPSG:3857";
        if (extent) {
            extent = CoordinateUtils.reprojectBbox(extent, "EPSG:4326", proj);
            // zoom by the max. extent defined in the map's config
            newZoom = mapUtils.getZoomForExtent(extent, mapSize, 0, 21);

            // center by the max. extent defined in the map's config
            newCenter = mapUtils.getCenterForExtent(extent, proj);

            // do not reproject for 0/0
            if (newCenter.x !== 0 || newCenter.y !== 0) {
                // reprojects the center object
                newCenter = configUtils.getCenter(newCenter, "EPSG:4326");
            }
            // adapt the map view by calling the corresponding action
            this.props.changeMapView(newCenter, newZoom,
                this.props.map.bbox, this.props.map.size, null, proj);
        }

    },
    selectFeatures(params) {
        this.props.selectFeatures(params.selectedRows.slice());
    },
    sortData(sortModel, data) {
        // do an in memory sort of the data, across all the fields
        let resultOfSort = data.slice();
        resultOfSort.sort(function(a, b) {
            for (let k = 0; k < sortModel.length; k++) {
                let sortColModel = sortModel[k];
                let colId = sortColModel.colId.split(".");
                /*eslint-disable */
                let valueA = colId.reduce(function(d, key) {
                    return (d) ? d[key] : null;
                }, a);
                let valueB = colId.reduce(function(d, key) {
                    return (d) ? d[key] : null;
                }, b);
                /*eslint-enable */
                // this filter didn't find a difference, move onto the next one
                if (valueA === valueB) {
                    continue;
                }
                let sortDirection = sortColModel.sort === 'asc' ? 1 : -1;
                return (valueA > valueB) ? sortDirection : sortDirection * -1;

            }
            // no filters found a difference
            return 0;
        });
        return resultOfSort;
    }


});

module.exports = FeatureGrid;
