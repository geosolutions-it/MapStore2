/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const assign = require('object-assign');
const {cswToCatalogSelector} = require("../selectors/cswtocatalog");
const {createDefaultMemorizeSelector} = require("../selectors/common");
const {Glyphicon, Input, Alert, Pagination} = require('react-bootstrap');
const Spinner = require('react-spinkit');
const {textSearch} = require("../actions/catalog");
const {addLayer} = require("../actions/layers");
const {zoomToExtent} = require("../actions/map");
const Message = require("../components/I18N/Message");
require('./metadataexplorer/css/style.css');

const memorizedCswToCatalogSelector = createDefaultMemorizeSelector([cswToCatalogSelector], (records) => {return {records}; });
const RecordGrid = connect(memorizedCswToCatalogSelector, {
    // add layer action to pass to the layers
    onZoomToExtent: zoomToExtent
})(require("../components/catalog/RecordGrid"));


const MetadataExplorerComponent = React.createClass({
    propTypes: {
        onSearch: React.PropTypes.func,
        onLayerAdd: React.PropTypes.func,
        pageSize: React.PropTypes.number,
        displayURL: React.PropTypes.bool,
        active: React.PropTypes.bool,
        initialCatalogURL: React.PropTypes.string,
        result: React.PropTypes.object,
        loadingError: React.PropTypes.object,
        searchOptions: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            active: false,
            pageSize: 6,
            onSearch: () => {},
            onLayerAdd: () => {}

        };
    },
    getInitialState() {
        return {
            loading: false
        };
    },
    componentWillReceiveProps(nextProps) {
        if (nextProps !== this.props) {
            this.setState({
                loading: false
            });
        }
    },
    onKeyDown(event) {
        if (event.keyCode === 13) {
            this.props.onSearch(this.getCatalogUrl(), 1, this.props.pageSize, this.refs.searchText.getValue());
            this.setState({
                loading: true
            });
        }
    },
    getCatalogUrl() {
        return this.props.searchOptions && this.props.searchOptions.url || this.props.initialCatalogURL;
    },
    renderResult() {
        if (this.props.result) {
            if (this.props.result.numberOfRecordsMatched === 0) {
                return (<div>
                    <Message msgId="catalog.noRecordsMatched" />
                </div>);
            }
            return this.renderRecords();
        } else if (this.props.loadingError) {
            return this.renderError();
        }
    },
    renderError() {
        return (<Alert bsStyle="danger">
            <Message msgId="catalog.error" />
          </Alert>);
    },
    renderLoading() {
        return (<div><Spinner spinnerName="circle"/></div>);

    },
    renderPagination() {
        let total = this.props.result.numberOfRecordsMatched;
        let returned = this.props.result.numberOfRecordsReturned;
        let start = this.props.searchOptions.startPosition;
        // let next = this.props.result.nextRecord;
        let pageSize = this.props.pageSize;
        let page = Math.floor( start / pageSize);
        let pageN = Math.ceil(total / pageSize);
        return (<div><Pagination
          prev next first last ellipsis boundaryLinks
          bsSize="small"
          items={pageN}
          maxButtons={5}
          activePage={page + 1}
          onSelect={this.handlePage} />
        <div className="push-right">
            <Message msgId="catalog.pageInfo" msgParams={{start, end: start + returned - 1, total}} />
        </div>
  </div>);
    },
    renderRecords() {
        return (<div>
                <RecordGrid key="records"
                    catalogURL={this.getCatalogUrl() }
                    onLayerAdd={this.props.onLayerAdd}
                />
                {this.renderPagination()}
        </div>);
    },
    render() {
        return (
             <div>
                 <div>
                     <Input
                         ref="searchText"
                         type="text"
                         style={{
                             textOverflow: "ellipsis"
                         }}
                         placeholder={"text to search..."}
                         onKeyDown={this.onKeyDown}/>
                 </div>
                 <div>
                    {this.state.loading ? this.renderLoading() : this.renderResult()}
                 </div>
             </div>
        );
    },
    handlePage(mouseEvent, pageEvent) {
        if (pageEvent && pageEvent.eventKey !== undefined) {
            let start = ((pageEvent.eventKey - 1) * this.props.pageSize) + 1;
            this.props.onSearch(this.getCatalogUrl(), start, this.props.pageSize, this.props.searchOptions.text);
            this.setState({
                loading: true
            });
        }
    }
});
const MetadataExplorerPlugin = connect((state) => ({
    searchOptions: state.catalog && state.catalog.searchOptions,
    result: state.catalog && state.catalog.result,
    loadingError: state.catalog && state.catalog.loadingError,
    active: state.controls && state.controls.toolbar && state.controls.toolbar.active === "metadataexplorer"
}), {
    onSearch: textSearch,
    onLayerAdd: addLayer
})(MetadataExplorerComponent);

module.exports = {
    MetadataExplorerPlugin: assign(MetadataExplorerPlugin, {
        Toolbar: {
            name: 'metadataexplorer',
            position: 10,
            exclusive: true,
            panel: true,
            tooltip: "catalog.tooltip",
            wrap: true,
            title: 'catalog.title',
            icon: <Glyphicon glyph="folder-open" />
        }
    }),
    reducers: {catalog: require('../reducers/catalog')}
};
