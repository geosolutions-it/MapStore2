/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const { isNil, has, omit } = require("lodash");
const assign = require("object-assign");
const PropTypes = require("prop-types");
const React = require("react");
const { FormControl, FormGroup, Alert, Pagination, Button, Panel, Form, InputGroup, ControlLabel, Glyphicon } = require("react-bootstrap");

const Select = require("react-select").default;

const BorderLayout = require("../layout/BorderLayout");
const LocaleUtils = require("../../utils/LocaleUtils");
const Message = require("../I18N/Message");
const RecordGrid = require("./RecordGrid");
const Loader = require('../misc/Loader');

class Catalog extends React.Component {
    static propTypes = {
        active: PropTypes.bool,
        searchText: PropTypes.string,
        addAuthentication: PropTypes.bool,
        buttonClassName: PropTypes.string,
        buttonStyle: PropTypes.object,
        currentLocale: PropTypes.string,
        loading: PropTypes.bool,
        format: PropTypes.string,
        crs: PropTypes.string,
        gridOptions: PropTypes.object,
        includeSearchButton: PropTypes.bool,
        includeResetButton: PropTypes.bool,
        loadingError: PropTypes.object,
        layerError: PropTypes.string,
        mode: PropTypes.string,
        onChangeCatalogMode: PropTypes.func,
        onChangeText: PropTypes.func,
        onChangeFormat: PropTypes.func,
        onChangeSelectedService: PropTypes.func,
        onPropertiesChange: PropTypes.func,
        onError: PropTypes.func,
        onLayerAdd: PropTypes.func,
        onReset: PropTypes.func,
        onSearch: PropTypes.func,
        onAddBackground: PropTypes.func,
        pageSize: PropTypes.number,
        records: PropTypes.array,
        authkeyParamNames: PropTypes.array,
        recordItem: PropTypes.element,
        result: PropTypes.object,
        searchOptions: PropTypes.object,
        selectedService: PropTypes.string,
        services: PropTypes.object,
        showGetCapLinks: PropTypes.bool,
        wrapOptions: PropTypes.bool,
        zoomToLayer: PropTypes.bool,
        hideThumbnail: PropTypes.bool,
        hideIdentifier: PropTypes.bool,
        hideExpand: PropTypes.bool,
        source: PropTypes.string,
        onAddBackgroundProperties: PropTypes.func,
        modalParams: PropTypes.object,
        layers: PropTypes.array,
        clearModal: PropTypes.func,
        formatOptions: PropTypes.array,
        layerBaseConfig: PropTypes.object
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
        currentLocale: "en-US",
        format: "csw",
        includeSearchButton: true,
        includeResetButton: false,
        mode: "view",
        onChangeCatalogMode: () => { },
        onChangeFormat: () => { },
        onChangeText: () => { },
        onChangeSelectedService: () => { },
        onPropertiesChange: () => { },
        onError: () => { },
        onLayerAdd: () => { },
        onReset: () => { },
        onSearch: () => { },
        changeLayerProperties: () => { },
        pageSize: 4,
        records: [],
        loading: false,
        services: {},
        wrapOptions: false,
        zoomToLayer: true,
        formatOptions: [{
            label: 'image/png',
            value: 'image/png'
        }, {
            label: 'image/png8',
            value: 'image/png8'
        }, {
            label: 'image/jpeg',
            value: 'image/jpeg'
        }, {
            label: 'image/vnd.jpeg-png',
            value: 'image/vnd.jpeg-png'
        }, {
            label: 'image/gif',
            value: 'image/gif'
        }],
        layerBaseConfig: {},
        crs: "EPSG:3857"
    };

    state = {
        catalogURL: null
    };

    componentDidMount() {
        if (this.props.selectedService &&
            this.isValidServiceSelected() &&
            this.props.services[this.props.selectedService].autoload) {
            this.search({ services: this.props.services, selectedService: this.props.selectedService, searchText: this.props.searchText });
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps !== this.props) {
            if (((nextProps.mode === "view" && this.props.mode === "edit") || nextProps.services !== this.props.services || nextProps.selectedService !== this.props.selectedService) &&
                nextProps.active && this.props.active &&
                nextProps.selectedService &&
                nextProps.services[nextProps.selectedService] &&
                nextProps.services[nextProps.selectedService].autoload) {
                this.search({ services: nextProps.services, selectedService: nextProps.selectedService, searchText: nextProps.searchText });
            }
            if (nextProps.active && this.props.active === false &&
                nextProps.selectedService &&
                nextProps.services[nextProps.selectedService] &&
                nextProps.services[nextProps.selectedService].autoload) {
                this.search({ services: nextProps.services, selectedService: nextProps.selectedService, searchText: nextProps.searchText });
            }
        }
    }

    onSearchTextChange = (event) => {
        this.props.onChangeText(event.target.value);
    };

    onKeyDown = (event) => {
        if (event.keyCode === 13) {
            this.search({ services: this.props.services, selectedService: this.props.selectedService, searchText: this.props.searchText });
        }
    };
    getServices = () => {
        const startKeys = has(this.props.services, 'default_map_backgrounds') ? ['default_map_backgrounds'] : [];
        return startKeys.concat(Object.keys(omit(this.props.services, 'default_map_backgrounds'))).map(s => {
            return assign({}, this.props.services[s], {
                label: LocaleUtils.getMessageById(this.context.messages, this.props.services[s].title), value: s
            });
        });
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
        return null;
    };

    renderError = (error) => {
        return (<Alert bsStyle="danger">
            <Message msgId={error || "catalog.error"} />
        </Alert>);
    };

    renderLoading = () => {
        return (<div className="catalog-results loading"><Loader size={176} /></div>);
    }

    renderPagination = () => {
        if (this.props.result) {
            let total = this.props.result.numberOfRecordsMatched;
            let returned = this.props.result.numberOfRecordsReturned;
            let start = this.props.searchOptions.startPosition;
            // let next = this.props.result.nextRecord;
            let pageSize = this.props.pageSize;
            let page = Math.floor(start / pageSize);
            let pageN = Math.ceil(total / pageSize);
            return (<div className="catalog-pagination"><Pagination
                prev next first last ellipsis boundaryLinks
                bsSize="small"
                items={pageN}
                maxButtons={5}
                activePage={page + 1}
                onSelect={this.handlePage} />
            <div className="push-right">
                <Message msgId="catalog.pageInfo" msgParams={{ start, end: start + returned - 1, total }} />
            </div>
            </div>);
        }
        return null;
    };

    renderRecords = () => {
        // defaults for recordItem elements
        let metadataTemplate = "";
        let showTemplate = false;
        let hideThumbnail = false;

        if (this.props.services && this.props.services[this.props.selectedService]) {
            const selectedService = this.props.services[this.props.selectedService];
            // check for configured metadata
            if (!isNil(selectedService.metadataTemplate) &&
                !isNil(selectedService.showTemplate)) {
                showTemplate = selectedService.showTemplate;
                metadataTemplate = selectedService.metadataTemplate;
            }
            // check for configured thumbnail
            if (!isNil(selectedService.hideThumbnail)) {
                hideThumbnail = selectedService.hideThumbnail;
            }
        }

        return (<div className="catalog-results">
            <RecordGrid
                {...this.props.gridOptions}
                crs={this.props.crs}
                key="records"
                hideThumbnail={hideThumbnail}
                records={this.props.records.map(
                    (record) => showTemplate && metadataTemplate
                        ? { ...record, metadataTemplate }
                        : record)}
                clearModal={this.props.clearModal}
                layers={this.props.layers}
                modalParams={this.props.modalParams}
                onAddBackgroundProperties={this.props.onAddBackgroundProperties}
                source={this.props.source}
                authkeyParamNames={this.props.authkeyParamNames}
                catalogURL={this.isValidServiceSelected() && this.props.services[this.props.selectedService].url || ""}
                service={this.props.services[this.props.selectedService]}
                catalogType={this.props.services[this.props.selectedService] && this.props.services[this.props.selectedService].type}
                showTemplate={this.props.services[this.props.selectedService].showTemplate}
                onLayerAdd={this.props.onLayerAdd}
                onPropertiesChange={this.props.onPropertiesChange}
                zoomToLayer={this.props.zoomToLayer}
                onError={this.props.onError}
                showGetCapLinks={this.props.showGetCapLinks}
                addAuthentication={this.props.addAuthentication}
                currentLocale={this.props.currentLocale}
                recordItem={this.props.recordItem}
                hideIdentifier={this.props.hideIdentifier}
                hideExpand={this.props.hideExpand}
                onAddBackground={this.props.onAddBackground}
                defaultFormat={this.props.services[this.props.selectedService] && this.props.services[this.props.selectedService].format}
                formatOptions={this.props.formatOptions}
                layerBaseConfig={this.props.layerBaseConfig}
                onAdd={() => {
                    this.search({ services: this.props.services, selectedService: this.props.selectedService });
                }}
            />
        </div>);
    };

    renderButtons = () => {
        const buttons = [];
        if (this.props.includeSearchButton) {
            buttons.push(<Button bsStyle="primary" style={this.props.buttonStyle} onClick={() => this.search({ services: this.props.services, selectedService: this.props.selectedService, searchText: this.props.searchText })}
                className={this.props.buttonClassName} key="catalog_search_button" disabled={this.props.loading || !this.isValidServiceSelected()}>
                <Message msgId="catalog.search" />
            </Button>);
        }
        if (this.props.includeResetButton) {
            buttons.push(<Button style={this.props.buttonStyle} onClick={this.reset} key="catalog_reset_button">
                <Message msgId="catalog.reset" />
            </Button>);
        }

        return buttons;
    };

    renderTextSearch = () => {
        const textSearch = (<FormControl
            ref="searchText"
            type="text"
            style={{
                textOverflow: "ellipsis"
            }}
            value={this.props.searchText}
            placeholder={LocaleUtils.getMessageById(this.context.messages, "catalog.textSearchPlaceholder")}
            onChange={this.onSearchTextChange}
            onKeyDown={this.onKeyDown} />);
        return this.props.wrapOptions ? (<Panel collapsible defaultExpanded={false} header={LocaleUtils.getMessageById(this.context.messages, "catalog.options")}>
            {textSearch}
        </Panel>) : textSearch;
    }

    render() {
        return (
            <BorderLayout
                key="catalog-BorderLayout"
                bodyClassName="ms2-border-layout-body catalog"
                header={(<Form>
                    <FormGroup controlId="labelService" key="labelService">
                        <ControlLabel><Message msgId="catalog.service" /></ControlLabel>
                    </FormGroup>
                    <FormGroup controlId="service" key="service">
                        <InputGroup>
                            <Select
                                clearValueText={LocaleUtils.getMessageById(this.context.messages, "catalog.clearValueText")}
                                noResultsText={LocaleUtils.getMessageById(this.context.messages, "catalog.noResultsText")}
                                clearable
                                options={this.getServices()}
                                value={this.props.selectedService}
                                onChange={(val) => this.props.onChangeSelectedService(val && val.value ? val.value : "")}
                                placeholder={LocaleUtils.getMessageById(this.context.messages, "catalog.servicePlaceholder")} />
                            {this.isValidServiceSelected() && this.props.selectedService !== 'default_map_backgrounds' ? (<InputGroup.Addon className="btn"
                                onClick={() => this.props.onChangeCatalogMode("edit", false)}>
                                <Glyphicon glyph="pencil" />
                            </InputGroup.Addon>) : null}
                            <InputGroup.Addon className="btn" onClick={() => this.props.onChangeCatalogMode("edit", true)}>
                                <Glyphicon glyph="plus" />
                            </InputGroup.Addon>
                        </InputGroup>
                    </FormGroup>
                    <FormGroup controlId="searchText" key="searchText">
                        {this.renderTextSearch()}
                    </FormGroup>
                    <FormGroup controlId="buttons" key="buttons">
                        {this.renderButtons()}
                        {this.props.layerError ? this.renderError(this.props.layerError) : null}
                    </FormGroup>
                </Form>)}
                footer={this.renderPagination()}>
                {this.props.loading ? this.renderLoading() : this.renderResult()}
            </BorderLayout>
        );

    }

    isValidServiceSelected = () => {
        return this.props.services[this.props.selectedService] !== undefined;

    };
    search = ({ services, selectedService, start = 1, searchText = "" } = {}) => {
        const url = services[selectedService].url;
        const type = services[selectedService].type;
        this.props.onSearch({ format: type, url, startPosition: start, maxRecords: this.props.pageSize, text: searchText || "", options: { service: this.props.services[selectedService] } });
    };

    reset = () => {
        this.props.onReset();
    };

    handlePage = (eventKey) => {
        if (eventKey) {
            let start = (eventKey - 1) * this.props.pageSize + 1;
            this.search({ services: this.props.services, selectedService: this.props.selectedService, start, searchText: this.props.searchText });
        }
    };
}

module.exports = Catalog;
