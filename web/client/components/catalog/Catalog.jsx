/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const Message = require('../I18N/Message');
const LocaleUtils = require('../../utils/LocaleUtils');
const AutocompleteListItem = require('../data/query/AutocompleteListItem');
const ComboboxReact = require('react-widgets').Combobox;
const assign = require('object-assign');

const {FormControl, FormGroup, Alert, Pagination, Button, Panel, Form, Col, InputGroup, ControlLabel, Glyphicon} = require('react-bootstrap');
const Spinner = require('react-spinkit');

const RecordGrid = require('./RecordGrid');

class Catalog extends React.Component {
    static propTypes = {
        active: PropTypes.bool,
        addAuthentication: PropTypes.bool,
        buttonClassName: PropTypes.string,
        buttonStyle: PropTypes.object,
        chooseCatalogUrl: PropTypes.bool,
        displayURL: PropTypes.bool,
        formats: PropTypes.array,
        format: PropTypes.string,
        gridOptions: PropTypes.object,
        initialCatalogURL: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        includeAddServiceButton: PropTypes.bool,
        includeBackToViewButton: PropTypes.bool,
        includeSearchButton: PropTypes.bool,
        includeResetButton: PropTypes.bool,
        loadingError: PropTypes.object,
        layerError: PropTypes.string,
        mode: PropTypes.string,
        newService: PropTypes.object,
        onAddService: PropTypes.func,
        onChangeCatalogMode: PropTypes.func,
        onChangeFormat: PropTypes.func,
        onChangeNewTitle: PropTypes.func,
        onChangeNewType: PropTypes.func,
        onChangeNewUrl: PropTypes.func,
        onChangeSelectedService: PropTypes.func,
        onError: PropTypes.func,
        onFocusServicesList: PropTypes.func,
        onLayerAdd: PropTypes.func,
        onReset: PropTypes.func,
        onSearch: PropTypes.func,
        onZoomToExtent: PropTypes.func,
        openCatalogServiceList: PropTypes.bool,
        pageSize: PropTypes.number,
        records: PropTypes.array,
        result: PropTypes.object,
        searchOnStartup: PropTypes.bool,
        searchOptions: PropTypes.object,
        selectedService: PropTypes.string,
        services: PropTypes.object,
        showGetCapLinks: PropTypes.bool,
        wrapOptions: PropTypes.bool,
        zoomToLayer: PropTypes.bool
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        buttonClassName: "search-button",
        buttonStyle: {
            marginBottom: "10px",
            marginRight: "5px"
        },
        chooseCatalogUrl: true,
        formats: [{name: 'csw', label: 'CSW'}],
        format: 'csw',
        includeSearchButton: true,
        includeResetButton: false,
        includeBackToViewButton: true,
        includeAddServiceButton: true,
        mode: "view",
        newService: {
            title: "",
            type: "wms",
            url: ""
        },
        onAddService: () => {},
        onChangeCatalogMode: () => {},
        onChangeFormat: () => {},
        onChangeNewTitle: () => {},
        onChangeNewType: () => {},
        onChangeNewUrl: () => {},
        onChangeSelectedService: () => {},
        onError: () => {},
        onFocusServicesList: () => {},
        onLayerAdd: () => {},
        onReset: () => {},
        onSearch: () => {},
        onZoomToExtent: () => {},
        openCatalogServiceList: false,
        pageSize: 4,
        records: [],
        services: {},
        wrapOptions: false,
        zoomToLayer: true
    };

    state = {
        loading: false,
        catalogURL: null
    };

    componentDidMount() {
        if (this.props.searchOnStartup) {
            this.props.onSearch(this.props.format, this.getCatalogUrl(), 1, this.props.pageSize, "");
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps !== this.props) {
            this.setState({
                loading: false
            });
        }
    }

    onSearchTextChange = (event) => {
        this.setState({searchText: event.target.value});
    };

    onKeyDown = (event) => {
        if (event.keyCode === 13) {
            this.search();
        }
    };

    getCatalogUrl = () => {
        return this.state.catalogURL || this.props.searchOptions && this.props.searchOptions.url ||
         (this.props.initialCatalogURL && this.props.initialCatalogURL[this.props.format] || this.props.initialCatalogURL);
    };

    renderResult = () => {
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
    };

    renderError = (error) => {
        return (<Alert bsStyle="danger">
            <Message msgId={error || 'catalog.error'} />
          </Alert>);
    };

    renderLoading = () => {
        return this.state.loading ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/> : null;
    };

    renderPagination = () => {
        let total = this.props.result.numberOfRecordsMatched;
        let returned = this.props.result.numberOfRecordsReturned;
        let start = this.props.searchOptions.startPosition;
        // let next = this.props.result.nextRecord;
        let pageSize = this.props.pageSize;
        let page = Math.floor( start / pageSize);
        let pageN = Math.ceil(total / pageSize);
        return (<div className="catalog-pagination"><Pagination
          prev next first last ellipsis boundaryLinks
          bsSize="small"
          items={pageN}
          maxButtons={5}
          activePage={page + 1}
          onSelect={this.handlePage} />
            <div className="push-right">
                <Message msgId="catalog.pageInfo" msgParams={{start, end: start + returned - 1, total}} />
                {this.renderLoading()}
            </div>
          </div>);
    };

    renderRecords = () => {
        return (<div className="catalog-results">
                <RecordGrid {...this.props.gridOptions} key="records"
                    records={this.props.records}
                    catalogURL={this.getCatalogUrl() }
                    onLayerAdd={this.props.onLayerAdd}
                    onZoomToExtent={this.props.onZoomToExtent}
                    zoomToLayer={this.props.zoomToLayer}
                    onError={this.props.onError}
                    showGetCapLinks={this.props.showGetCapLinks}
                    addAuthentication={this.props.addAuthentication}
                />
                {this.renderPagination()}
        </div>);
    };

    renderURLInput = () => {
        if (!this.getCatalogUrl() || this.props.chooseCatalogUrl) {
            return (<FormGroup>
                <FormControl
                ref="catalogURL"
                type="text"
                placeholder={LocaleUtils.getMessageById(this.context.messages, "catalog.urlPlaceholder")}
                onChange={this.setCatalogUrl}
                onKeyDown={this.onKeyDown}/></FormGroup>);
        }
    };

    renderButtons = () => {
        const buttons = [];
        if (this.props.mode === "view" ) {
            if (this.props.includeSearchButton) {
                buttons.push(<Button bsStyle="primary" style={this.props.buttonStyle} onClick={this.search}
                            className={this.props.buttonClassName} key="catalog_search_button" disabled={!this.isValidServiceSelected()}>
                            {this.renderLoading()} <Message msgId="catalog.search"/>
                        </Button>);
            }
            if (this.props.includeResetButton) {
                buttons.push(<Button style={this.props.buttonStyle} onClick={this.reset} key="catalog_reset_button">
                            <Message msgId="catalog.reset"/>
                        </Button>);
            }
        }
        if (this.props.mode === "edit") {
            buttons.push(<Button style={this.props.buttonStyle} onClick={() => this.props.onAddService()} key="catalog_add_service_button">
                        <Message msgId="save"/>
                    </Button>);
            buttons.push(<Button style={this.props.buttonStyle} onClick={() => this.props.onChangeCatalogMode("view")} key="catalog_back_view_button">
                        <Message msgId="cancel"/>
                    </Button>);
        }
        return buttons;
    };

    renderFormatChoice = () => {
        if (this.props.formats.length > 1) {
            return <FormGroup><FormControl onChange={(e) => this.props.onChangeFormat(e.target.value)} value={this.props.format} componentClass="select">{this.renderFormats()}</FormControl></FormGroup>;
        }
        return null;
    };

    renderTextSearch = () => {
        const textSearch = (<FormControl
            ref="searchText"
            type="text"
            style={{
                textOverflow: "ellipsis"
            }}
            placeholder={LocaleUtils.getMessageById(this.context.messages, "catalog.textSearchPlaceholder")}
            onChange={this.onSearchTextChange}
            onKeyDown={this.onKeyDown}/>);
        return this.props.wrapOptions ? (<Panel collapsible defaultExpanded={false} header={LocaleUtils.getMessageById(this.context.messages, "catalog.options")}>
            {textSearch}
        </Panel>) : textSearch;
    }
    renderFormats = () => {
        return this.props.formats.map((format) => <option value={format.name} key={format.name}>{format.label}</option>);
    };
    renderServices = () => {
        return Object.keys(this.props.services).map((service) => {
            return service === this.props.selectedService ?
            <option value={service} selected key={service}>{service}</option>
            : <option value={service} key={service}>{service}</option>;
        });
    };
    render() {
        const services = Object.keys(this.props.services).map(s => {
            return assign({}, this.props.services[s], {label: this.props.services[s].title});
        });
        const serviceComboboxMessages = {
            emptyList: <Message msgId="queryform.attributefilter.autocomplete.emptyList"/>,
            open: <Message msgId="queryform.attributefilter.autocomplete.open"/>,
            emptyFilter: <Message msgId="queryform.attributefilter.autocomplete.emptyFilter"/>
    };
        return (
            <div>
                <div>
                {this.isViewMode(this.props.mode) ? (
                    <Form>
                        <FormGroup controlId="labelService" key="labelService">
                            <ControlLabel><Message msgId="catalog.service"/></ControlLabel>
                        </FormGroup>
                        <FormGroup controlId="service" key="service">
                            <InputGroup>
                                <ComboboxReact
                                    data={services}
                                    messages={serviceComboboxMessages}
                                    value={this.props.selectedService}
                                    open={this.props.openCatalogServiceList}
                                    onFocus={(e) => {
                                        if (!(e.target instanceof Node && e.target.nodeName === 'BUTTON')) {
                                            this.props.onFocusServicesList(true);
                                        }
                                    }}
                                    onToggle={() => this.props.onFocusServicesList(!this.props.openCatalogServiceList)}
                                    onBlur={(e) => {
                                        if (!this.props.services[e.target.value]) {
                                            this.props.onChangeSelectedService("");
                                        }
                                    }}
                                    onChange={(val) => this.props.onChangeSelectedService(val.title ? val.title : val)}
                                    onSelect={(service) => this.props.onChangeSelectedService(service.title)}
                                    itemComponent={AutocompleteListItem}
                                    valueField="title"
                                    textField="title"
                                    filter="contains"
                                    placeholder={LocaleUtils.getMessageById(this.context.messages, "catalog.servicePlaceholder")}
                                    />

                              <InputGroup.Addon onClick={() => this.props.onChangeCatalogMode("edit", this.isServiceEmpty())}>
                                    <Glyphicon glyph={this.isServiceEmpty() ? "pencil-add" : "pencil"}/>
                                </InputGroup.Addon>
                            </InputGroup>
                        </FormGroup>
                        <FormGroup controlId="searchText" key="searchText">
                            {this.renderTextSearch()}
                        </FormGroup>
                        <FormGroup controlId="buttons" key="buttons">
                            {this.renderButtons()}
                        </FormGroup>
                    </Form>
                ) : (
                        <Form horizontal >
                            <FormGroup>
                                <Col xs={12} sm={3} md={3}>
                                    <ControlLabel><Message msgId="catalog.type"/></ControlLabel>
                                    <FormControl
                                        onChange={(e) => this.props.onChangeNewType(e.target.value)}
                                        value={this.props.newService && this.props.newService.type}
                                        componentClass="select">
                                        {this.renderFormats()}
                                    </FormControl>
                                </Col>
                                <Col xs={12} sm={9} md={9}>
                                    <ControlLabel><Message msgId="catalog.url"/></ControlLabel>
                                <FormControl
                                    ref="url"
                                    type="text"
                                    style={{
                                        textOverflow: "ellipsis"
                                    }}
                                    placeholder={LocaleUtils.getMessageById(this.context.messages, "catalog.urlPlaceholder")}
                                    value={this.props.newService && this.props.newService.url}
                                    onChange={(e) => this.props.onChangeNewUrl(e.target.value)}
                                    onKeyDown={this.onKeyDown}/>
                                </Col>
                            </FormGroup>
                            <FormGroup controlId="title" key="title">
                                <Col xs={12}>
                                    <ControlLabel><Message msgId="catalog.serviceTitle"/></ControlLabel>
                                <FormControl
                                    ref="title"
                                    type="text"
                                    style={{
                                        textOverflow: "ellipsis"
                                    }}
                                    placeholder={LocaleUtils.getMessageById(this.context.messages, "catalog.serviceTitlePlaceholder")}
                                    value={this.props.newService && this.props.newService.title}
                                    onChange={(e) => this.props.onChangeNewTitle(e.target.value)}
                                    onKeyDown={this.onKeyDown}/>
                                </Col>
                            </FormGroup>
                            <FormGroup controlId="buttons" key="butStons">
                                <Col xs={12}>
                                    {this.renderButtons()}
                                </Col>
                            </FormGroup>
                        </Form>
                    )}
                    </div>
                <div>
                    {this.renderResult()}
                    {this.props.layerError ? this.renderError(this.props.layerError) : null}
                </div>
            </div>
        );
    }

    isServiceEmpty = () => {
        return this.props.selectedService === "";
    };

    isValidServiceSelected = () => {
        return this.props.services[this.props.selectedService] !== undefined;
    };
    search = () => {
        const url = this.props.services[this.props.selectedService].url;
        const type = this.props.services[this.props.selectedService].type;
        this.props.onSearch(type, url, 1, this.props.pageSize, this.state && this.state.searchText || "");
        this.setState({
            loading: true
        });
    };

    isViewMode = (mode) => {
        return mode === "view";
    }

    reset = () => {
        if (this.refs.catalogURL) {
            this.refs.catalogURL.refs.input.value = '';
        }
        if (this.refs.searchText) {
            this.refs.searchText.refs.input.value = '';
        }
        this.props.onReset();
    };

    setCatalogUrl = (e) => {
        this.setState({catalogURL: e.target.value});
    };

    handlePage = (eventKey) => {
        if (eventKey) {
            let start = (eventKey - 1) * this.props.pageSize + 1;
            this.props.onSearch(this.props.format, this.getCatalogUrl(), start, this.props.pageSize, this.props.searchOptions.text);
            this.setState({
                loading: true
            });
        }
    };
}

module.exports = Catalog;
