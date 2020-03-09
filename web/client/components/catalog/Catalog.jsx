/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const {isNil, has, omit} = require("lodash");
const assign = require("object-assign");
const PropTypes = require("prop-types");
const React = require("react");
const {FormControl, FormGroup, Alert, Pagination, Checkbox, Button, Panel, Form, Col, InputGroup, ControlLabel, Glyphicon, Tooltip} = require("react-bootstrap");
const ReactQuill = require("react-quill");
const Select = require("react-select");
const Spinner = require("react-spinkit");

const BorderLayout = require("../layout/BorderLayout");
const LocaleUtils = require("../../utils/LocaleUtils");
const Message = require("../I18N/Message");
const OverlayTrigger = require('../misc/OverlayTrigger');
const RecordGrid = require("./RecordGrid");
const SwitchPanel = require("../misc/switch/SwitchPanel");
const Loader = require('../misc/Loader');

require('react-select/dist/react-select.css');
require('react-quill/dist/quill.snow.css');

class Catalog extends React.Component {
    static propTypes = {
        active: PropTypes.bool,
        addAuthentication: PropTypes.bool,
        buttonClassName: PropTypes.string,
        buttonStyle: PropTypes.object,
        currentLocale: PropTypes.string,
        formats: PropTypes.array,
        format: PropTypes.string,
        crs: PropTypes.string,
        gridOptions: PropTypes.object,
        includeSearchButton: PropTypes.bool,
        includeResetButton: PropTypes.bool,
        loadingError: PropTypes.object,
        layerError: PropTypes.string,
        mode: PropTypes.string,
        newService: PropTypes.object,
        onAddService: PropTypes.func,
        onChangeAutoload: PropTypes.func,
        onChangeCatalogMode: PropTypes.func,
        onChangeServiceFormat: PropTypes.func,
        onChangeMetadataTemplate: PropTypes.func,
        onChangeTitle: PropTypes.func,
        onChangeText: PropTypes.func,
        onChangeType: PropTypes.func,
        onChangeUrl: PropTypes.func,
        onChangeFormat: PropTypes.func,
        onChangeSelectedService: PropTypes.func,
        onDeleteService: PropTypes.func,
        onToggleTemplate: PropTypes.func,
        onToggleAdvancedSettings: PropTypes.func,
        onToggleThumbnail: PropTypes.func,
        onPropertiesChange: PropTypes.func,
        onError: PropTypes.func,
        onLayerAdd: PropTypes.func,
        onReset: PropTypes.func,
        onSearch: PropTypes.func,
        onZoomToExtent: PropTypes.func,
        onAddBackground: PropTypes.func,
        pageSize: PropTypes.number,
        records: PropTypes.array,
        authkeyParamNames: PropTypes.array,
        recordItem: PropTypes.element,
        result: PropTypes.object,
        saving: PropTypes.bool,
        searchOptions: PropTypes.object,
        selectedService: PropTypes.string,
        services: PropTypes.object,
        showGetCapLinks: PropTypes.bool,
        wrapOptions: PropTypes.bool,
        zoomToLayer: PropTypes.bool,
        hideIdentifier: PropTypes.bool,
        hideExpand: PropTypes.bool,
        source: PropTypes.string,
        onAddBackgroundProperties: PropTypes.func,
        modalParams: PropTypes.object,
        layers: PropTypes.array,
        onUpdateThumbnail: PropTypes.func,
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
        formats: [{name: "csw", label: "CSW"}],
        format: "csw",
        includeSearchButton: true,
        includeResetButton: false,
        mode: "view",
        newService: {
            title: "",
            type: "wms",
            url: "",
            format: "image/png"
        },
        onAddService: () => {},
        onChangeAutoload: () => {},
        onChangeCatalogMode: () => {},
        onChangeFormat: () => {},
        onChangeMetadataTemplate: () => {},
        onChangeTitle: () => {},
        onChangeText: () => {},
        onChangeType: () => {},
        onChangeUrl: () => {},
        onChangeServiceFormat: () => {},
        onChangeSelectedService: () => {},
        onToggleTemplate: () => {},
        onToggleAdvancedSettings: () => {},
        onToggleThumbnail: () => {},
        onDeleteService: () => {},
        onPropertiesChange: () => {},
        onError: () => {},
        onLayerAdd: () => {},
        onReset: () => {},
        onSearch: () => {},
        onZoomToExtent: () => {},
        changeLayerProperties: () => {},
        pageSize: 4,
        records: [],
        saving: false,
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
            this.search({services: this.props.services, selectedService: this.props.selectedService, searchText: this.props.searchText});
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps !== this.props) {
            if (((nextProps.mode === "view" && this.props.mode === "edit") || nextProps.services !== this.props.services || nextProps.selectedService !== this.props.selectedService) &&
                nextProps.active && this.props.active &&
                nextProps.selectedService &&
                nextProps.services[nextProps.selectedService] &&
                nextProps.services[nextProps.selectedService].autoload) {
                this.search({services: nextProps.services, selectedService: nextProps.selectedService, searchText: nextProps.searchText});
            }
            if (nextProps.active && this.props.active === false &&
                nextProps.selectedService &&
                nextProps.services[nextProps.selectedService] &&
                nextProps.services[nextProps.selectedService].autoload) {
                this.search({services: nextProps.services, selectedService: nextProps.selectedService, searchText: nextProps.searchText});
            }
        }
    }

    onSearchTextChange = (event) => {
        this.props.onChangeText(event.target.value);
    };

    onKeyDown = (event) => {
        if (event.keyCode === 13) {
            this.search({services: this.props.services, selectedService: this.props.selectedService, searchText: this.props.searchText});
        }
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

    renderSaving = () => {
        return this.props.saving ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/> : null;
    };

    renderPagination = () => {
        if (this.props.result) {
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
                        ? { ...record, metadataTemplate}
                        : record)}
                clearModal={this.props.clearModal}
                onUpdateThumbnail = {this.props.onUpdateThumbnail}
                layers={this.props.layers}
                modalParams= {this.props.modalParams}
                onAddBackgroundProperties={this.props.onAddBackgroundProperties}
                source={this.props.source}
                authkeyParamNames={this.props.authkeyParamNames}
                catalogURL={this.isValidServiceSelected() && this.props.services[this.props.selectedService].url || ""}
                catalogType={this.props.services[this.props.selectedService] && this.props.services[this.props.selectedService].type}
                showTemplate={this.props.services[this.props.selectedService].showTemplate}
                onLayerAdd={this.props.onLayerAdd}
                onPropertiesChange={this.props.onPropertiesChange}
                onZoomToExtent={this.props.onZoomToExtent}
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
                    this.search({services: this.props.services, selectedService: this.props.selectedService});
                }}
            />
        </div>);
    };

    renderButtons = () => {
        const buttons = [];
        if (this.props.mode === "view" ) {
            if (this.props.includeSearchButton) {
                buttons.push(<Button bsStyle="primary" style={this.props.buttonStyle} onClick={() => this.search({services: this.props.services, selectedService: this.props.selectedService, searchText: this.props.searchText})}
                    className={this.props.buttonClassName} key="catalog_search_button" disabled={this.props.loading || !this.isValidServiceSelected()}>
                    <Message msgId="catalog.search"/>
                </Button>);
            }
            if (this.props.includeResetButton) {
                buttons.push(<Button style={this.props.buttonStyle} onClick={this.reset} key="catalog_reset_button">
                    <Message msgId="catalog.reset"/>
                </Button>);
            }
        }
        if (this.props.mode === "edit") {
            buttons.push(<Button style={this.props.buttonStyle} disabled={this.props.saving} onClick={() => this.props.onAddService()} key="catalog_add_service_button">
                {this.renderSaving()} <Message msgId="save"/>
            </Button>);
            if (!this.props.newService.isNew) {
                buttons.push(<Button style={this.props.buttonStyle} onClick={() => this.props.onDeleteService()} key="catalog_delete_service_button">
                    <Message msgId="catalog.delete"/>
                </Button>);
            }
            buttons.push(<Button style={this.props.buttonStyle} disabled={this.props.saving} onClick={() => this.props.onChangeCatalogMode("view")} key="catalog_back_view_button">
                <Message msgId="cancel"/>
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
            onKeyDown={this.onKeyDown}/>);
        return this.props.wrapOptions ? (<Panel collapsible defaultExpanded={false} header={LocaleUtils.getMessageById(this.context.messages, "catalog.options")}>
            {textSearch}
        </Panel>) : textSearch;
    }
    renderFormats = () => {
        return this.props.formats.map((format) => <option value={format.name} key={format.name}>{format.label}</option>);
    };

    getServices = () => {
        const startKeys = has(this.props.services, 'default_map_backgrounds') ? ['default_map_backgrounds'] : [];
        return startKeys.concat(Object.keys(omit(this.props.services, 'default_map_backgrounds'))).map(s => {
            return assign({}, this.props.services[s], {
                label: LocaleUtils.getMessageById(this.context.messages, this.props.services[s].title), value: s
            });
        });
    };

    render() {
        const showTemplate = !isNil(this.props.newService.showTemplate) ? this.props.newService.showTemplate : false;
        return (
            this.isViewMode(this.props.mode) ? (
                <BorderLayout
                    key="catalog-BorderLayout"
                    bodyClassName="ms2-border-layout-body catalog"
                    header={(<Form>
                        <FormGroup controlId="labelService" key="labelService">
                            <ControlLabel><Message msgId="catalog.service"/></ControlLabel>
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
                                    <Glyphicon glyph="pencil"/>
                                </InputGroup.Addon>) : null}
                                <InputGroup.Addon className="btn" onClick={() => this.props.onChangeCatalogMode("edit", true)}>
                                    <Glyphicon glyph="plus"/>
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
                    { this.props.loading ? this.renderLoading() : this.renderResult() }
                </BorderLayout>
            ) : (
                <BorderLayout
                    bodyClassName="ms2-border-layout-body catalog"
                    header={<Form horizontal >
                        <FormGroup>
                            <Col xs={12}>
                                <ControlLabel><Message msgId="catalog.url"/></ControlLabel>
                                <FormControl
                                    ref="url"
                                    type="text"
                                    style={{
                                        textOverflow: "ellipsis"
                                    }}
                                    placeholder={LocaleUtils.getMessageById(this.context.messages, "catalog.urlPlaceholder")}
                                    value={this.props.newService && this.props.newService.url}
                                    onChange={(e) => this.props.onChangeUrl(e.target.value)}/>
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="title" key="title">
                            <Col xs={12} sm={3} md={3}>
                                <ControlLabel><Message msgId="catalog.type"/></ControlLabel>
                                <FormControl
                                    onChange={(e) => this.props.onChangeType(e.target.value)}
                                    value={this.props.newService && this.props.newService.type}
                                    componentClass="select">
                                    {this.renderFormats()}
                                </FormControl>
                            </Col>
                            <Col xs={12} sm={9} md={9}>
                                <ControlLabel><Message msgId="catalog.serviceTitle"/></ControlLabel>
                                <FormControl
                                    ref="title"
                                    type="text"
                                    style={{
                                        textOverflow: "ellipsis"
                                    }}
                                    placeholder={LocaleUtils.getMessageById(this.context.messages, "catalog.serviceTitlePlaceholder")}
                                    value={this.props.newService && this.props.newService.title}
                                    onChange={(e) => this.props.onChangeTitle(e.target.value)}/>
                            </Col>
                        </FormGroup>
                    </Form>}>
                    <Form >
                        <SwitchPanel
                            useToolbar
                            title={<Message msgId="catalog.advancedSettings"/>}
                            expanded={!isNil(this.props.newService.showAdvancedSettings) ? this.props.newService.showAdvancedSettings : false}
                            onSwitch={this.props.onToggleAdvancedSettings}>
                            <div>
                                <FormGroup controlId="autoload" key="autoload">
                                    <Col xs={12}>
                                        <Checkbox value="autoload" onChange={(e) => this.props.onChangeAutoload(e.target.checked)}
                                            checked={!isNil(this.props.newService.autoload) ? this.props.newService.autoload : false}>
                                            <Message msgId="catalog.autoload"/>
                                        </Checkbox>
                                    </Col>
                                </FormGroup>
                                <FormGroup controlId="thumbnail" key="thumbnail">
                                    <Col xs={12}>
                                        <Checkbox
                                            onChange={() => this.props.onToggleThumbnail()}
                                            checked={!isNil(this.props.newService.hideThumbnail) ? !this.props.newService.hideThumbnail : true}>
                                            <Message msgId="catalog.showPreview"/>
                                        </Checkbox>
                                    </Col>
                                </FormGroup>
                                {(!isNil(this.props.newService.type) ? this.props.newService.type === "csw" : false) && (<FormGroup controlId="metadata-template" key="metadata-template" className="metadata-template-editor">
                                    <Col xs={12}>
                                        <Checkbox
                                            onChange={() => this.props.onToggleTemplate()}
                                            checked={showTemplate}>
                                            <Message msgId="catalog.showTemplate"/>
                                        </Checkbox>
                                        <br/>
                                    </Col>
                                    {showTemplate &&
                                        (<Col xs={12}>
                                            <span>
                                                <p>
                                                    <Message msgId="layerProperties.templateFormatInfoAlert2" msgParams={{ attribute: "{ }"}}/>
                                                    &nbsp;&nbsp;
                                                    <OverlayTrigger
                                                        placement="top"
                                                        key={"overlay-trigger." + this.props.id}
                                                        overlay={<Tooltip id="metadata-tooltip">
                                                            <Message msgId="catalog.templateMetadataAvailable"/>
                                                        </Tooltip>}>
                                                        <Glyphicon glyph="question-sign"/>
                                                    </OverlayTrigger>
                                                </p>
                                                <pre>
                                                    <Message msgId="catalog.templateFormatDescriptionExample"/>{ " ${ description }"}
                                                </pre>
                                            </span>
                                        </Col>)}
                                    <Col xs={12}>
                                        {showTemplate && <ReactQuill
                                            modules={{
                                                toolbar: [
                                                    [{ "size": ["small", false, "large", "huge"] }, "bold", "italic", "underline", "blockquote"],
                                                    [{ "list": "bullet" }, { "align": [] }],
                                                    [{ "color": [] }, { "background": [] }, "clean"], ["link"]
                                                ]
                                            }}
                                            value={this.props.newService.metadataTemplate || ""}
                                            onChange={(metadataTemplate) => {
                                                if (metadataTemplate && metadataTemplate !== "<p><br></p>") {
                                                    this.props.onChangeMetadataTemplate(metadataTemplate);
                                                } else {
                                                    // TODO think about this
                                                    this.props.onChangeMetadataTemplate("");
                                                }
                                            }}/>
                                        }
                                    </Col>
                                </FormGroup>)}
                                <FormGroup style={{display: 'flex', alignItems: 'center', paddingTop: 15, borderTop: '1px solid #ddd'}}>
                                    <Col xs={6}>
                                        <ControlLabel>Format</ControlLabel>
                                    </Col >
                                    <Col xs={6}>
                                        <Select
                                            value={this.props.newService && this.props.newService.format}
                                            clearable
                                            options={this.props.formatOptions}
                                            onChange={event => this.props.onChangeServiceFormat(event && event.value)}/>
                                    </Col >
                                </FormGroup>
                            </div>
                        </SwitchPanel>
                        <FormGroup controlId="buttons" key="butStons">
                            <Col xs={12}>
                                {this.renderButtons()}
                            </Col>
                        </FormGroup>
                    </Form>
                </BorderLayout>
            )
        );
    }

    isValidServiceSelected = () => {
        return this.props.services[this.props.selectedService] !== undefined;

    };
    search = ({services, selectedService, start = 1, searchText = ""} = {}) => {
        const url = services[selectedService].url;
        const type = services[selectedService].type;
        this.props.onSearch({format: type, url, startPosition: start, maxRecords: this.props.pageSize, text: searchText || ""});
    };

    isViewMode = (mode) => {
        return mode === "view";
    }

    reset = () => {
        if (this.refs.catalogURL) {
            this.refs.catalogURL.refs.input.value = "";
        }
        if (this.refs.searchText) {
            this.refs.searchText.refs.input.value = "";
        }
        this.props.onReset();
    };

    handlePage = (eventKey) => {
        if (eventKey) {
            let start = (eventKey - 1) * this.props.pageSize + 1;
            this.search({services: this.props.services, selectedService: this.props.selectedService, start, searchText: this.props.searchText});
        }
    };
}

module.exports = Catalog;
