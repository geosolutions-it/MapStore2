/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const Message = require('../I18N/Message');
const LocaleUtils = require('../../utils/LocaleUtils');

const {Input, Alert, Pagination, Button} = require('react-bootstrap');
const Spinner = require('react-spinkit');

const RecordGrid = require('./RecordGrid');

const Catalog = React.createClass({
    propTypes: {
        formats: React.PropTypes.array,
        format: React.PropTypes.string,
        onSearch: React.PropTypes.func,
        onChangeFormat: React.PropTypes.func,
        onLayerAdd: React.PropTypes.func,
        onZoomToExtent: React.PropTypes.func,
        pageSize: React.PropTypes.number,
        displayURL: React.PropTypes.bool,
        initialCatalogURL: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object]),
        result: React.PropTypes.object,
        loadingError: React.PropTypes.object,
        searchOptions: React.PropTypes.object,
        chooseCatalogUrl: React.PropTypes.bool,
        showGetCapLinks: React.PropTypes.bool,
        addAuthentication: React.PropTypes.bool,
        records: React.PropTypes.array,
        gridOptions: React.PropTypes.object,
        includeSearchButton: React.PropTypes.bool,
        buttonStyle: React.PropTypes.object
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            pageSize: 6,
            onSearch: () => {},
            onChangeFormat: () => {},
            onLayerAdd: () => {},
            onZoomToExtent: () => {},
            chooseCatalogUrl: true,
            records: [],
            formats: [{name: 'csw', label: 'CSW'}],
            format: 'csw',
            includeSearchButton: false,
            buttonStyle: {
                marginBottom: "10px"
            }
        };
    },
    getInitialState() {
        return {
            loading: false,
            catalogURL: null
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
            this.search();
        }
    },
    getCatalogUrl() {
        return this.state.catalogURL || (this.props.searchOptions && this.props.searchOptions.url) ||
         (this.props.initialCatalogURL && this.props.initialCatalogURL[this.props.format] || this.props.initialCatalogURL);
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
        return (<Spinner spinnerName="circle" noFadeIn/>);
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
            {this.state.loading ? this.renderLoading() : null}
        </div>
  </div>);
    },
    renderRecords() {
        return (<div>
                <RecordGrid {...this.props.gridOptions} key="records"
                    records={this.props.records}
                    catalogURL={this.getCatalogUrl() }
                    onLayerAdd={this.props.onLayerAdd}
                    onZoomToExtent={this.props.onZoomToExtent}
                    showGetCapLinks={this.props.showGetCapLinks}
                    addAuthentication={this.props.addAuthentication}
                />
                {this.renderPagination()}
        </div>);
    },
    renderURLInput() {
        if (!this.getCatalogUrl() || this.props.chooseCatalogUrl) {
            return (<Input
                ref="catalogURL"
                type="text"
                placeholder={LocaleUtils.getMessageById(this.context.messages, "catalog.catalogUrlPlaceholder")}
                onChange={this.setCatalogUrl}/>);
        }
    },
    renderSearchButton() {
        if (this.props.includeSearchButton) {
            return (<Button style={this.props.buttonStyle} onClick={this.search}>
                        <Message msgId="catalog.search"/>
                    </Button>);
        }
    },
    renderFormatChoice() {
        if (this.props.formats.length > 1) {
            return <Input onChange={(e) => this.props.onChangeFormat(e.target.value)} value={this.props.format} type="select">{this.renderFormats()}</Input>;
        }
        return null;
    },
    renderFormats() {
        return this.props.formats.map((format) => <option value={format.name}>{format.label}</option>);
    },
    render() {
        return (
             <div>
                 <div>
                     {this.renderFormatChoice()}
                     {this.renderURLInput()}
                     <Input
                         ref="searchText"
                         type="text"
                         style={{
                             textOverflow: "ellipsis"
                         }}
                         placeholder={LocaleUtils.getMessageById(this.context.messages, "catalog.textSearchPlaceholder")}
                         onKeyDown={this.onKeyDown}/>
                     {this.renderSearchButton()}
                 </div>
                 <div>
                    {this.renderResult()}
                 </div>
             </div>
        );
    },
    search() {
        this.props.onSearch(this.props.format, this.getCatalogUrl(), 1, this.props.pageSize, this.refs.searchText.getValue());
        this.setState({
            loading: true
        });
    },
    setCatalogUrl(e) {
        this.setState({catalogURL: e.target.value});
    },
    handlePage(mouseEvent, pageEvent) {
        if (pageEvent && pageEvent.eventKey !== undefined) {
            let start = ((pageEvent.eventKey - 1) * this.props.pageSize) + 1;
            this.props.onSearch(this.props.format, this.getCatalogUrl(), start, this.props.pageSize, this.props.searchOptions.text);
            this.setState({
                loading: true
            });
        }
    }
});

module.exports = Catalog;
