/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const PropTypes = require('prop-types');
const SharingLinks = require('./SharingLinks');
const Message = require('../I18N/Message');
const {Image, Panel, Button: ButtonRB, Glyphicon} = require('react-bootstrap');
const {isObject, head} = require('lodash');
const assign = require('object-assign');
const uuidv1 = require('uuid/v1');
const CoordinatesUtils = require('../../utils/CoordinatesUtils');
const ContainerDimensions = require('react-container-dimensions').default;
const ConfigUtils = require('../../utils/ConfigUtils');
const {getRecordLinks, recordToLayer, extractOGCServicesReferences, buildSRSMap, extractEsriReferences, esriToLayer, removeParameters} = require('../../utils/CatalogUtils');

const tooltip = require('../misc/enhancers/tooltip');
const Button = tooltip(ButtonRB);
const defaultThumb = require('./img/default.jpg');

const ModalMock = require('../background/ModalMock');

class RecordItem extends React.Component {
    static propTypes = {
        addAuthentication: PropTypes.bool,
        buttonSize: PropTypes.string,
        crs: PropTypes.string,
        currentLocale: PropTypes.string,
        onCopy: PropTypes.func,
        onError: PropTypes.func,
        onLayerAdd: PropTypes.func,
        onZoomToExtent: PropTypes.func,
        record: PropTypes.object,
        authkeyParamNames: PropTypes.array,
        showGetCapLinks: PropTypes.bool,
        zoomToLayer: PropTypes.bool,
        catalogURL: PropTypes.string,
        catalogType: PropTypes.string,
        hideThumbnail: PropTypes.bool,
        hideIdentifier: PropTypes.bool,
        hideExpand: PropTypes.bool,
        onPropertiesChange: PropTypes.func,
        onLayerChange: PropTypes.func,
        layers: PropTypes.array,
        onAdd: PropTypes.func,
        source: PropTypes.string,
        modalParams: PropTypes.object,
        onAddBackgroundProperties: PropTypes.func,
        onUpdateThumbnail: PropTypes.func,
        unsavedChanges: PropTypes.bool,
        deletedId: PropTypes.string,
        removeThumbnail: PropTypes.func

    };

    static defaultProps = {
        modalParams: {showModal: false},
        buttonSize: "small",
        crs: "EPSG:3857",
        currentLocale: 'en-US',
        onUpdateThumbnail: () => {},
        onAddBackgroundProperties: () => {},
        onCopy: () => {},
        onError: () => {},
        onLayerAdd: () => {},
        onZoomToExtent: () => {},
        onPropertiesChange: () => {},
        onLayerChange: () => {},
        removeThumbnail: () => {},
        style: {},
        showGetCapLinks: false,
        zoomToLayer: true,
        hideThumbnail: false,
        hideIdentifier: false,
        hideExpand: true,
        layers: [],
        onAdd: () => {},
        source: 'metadataExplorer',
        record: {}
    };

    state = {};

    componentWillMount() {
        document.addEventListener('click', this.handleClick, false);
    }

    componentWillUnmount() {

        document.removeEventListener('click', this.handleClick, false);
    }

    getTitle = (title) => {
        return isObject(title) ? title[this.props.currentLocale] || title.default : title || '';
    };

    renderThumb = (thumbURL, record) => {
        let thumbSrc = thumbURL || defaultThumb;

        return (<Image className="preview" src={thumbSrc} alt={record && this.getTitle(record.title)}/>);

    };

    renderButtons = (record) => {
        if ((!record || !record.references) && record.group !== 'background') {
            // we don't have a valid record so no buttons to add
            return null;
        }
        // let's extract the references we need
        const {wms, wmts} = record.group === 'background' && {} || extractOGCServicesReferences(record);
        // let's extract the esri
        const {esri} = extractEsriReferences(record);

        // let's create the buttons
        let buttons = [];
        const buttonText = this.props.source === 'backgroundSelector' ? 'Add Background' : 'Add To Map';
        // TODO addLayer and addwmtsLayer do almost the same thing and they should be unified
        if (record.group === 'background') {
            buttons.push(
                <Button
                    key="wms-button"
                    className="record-button"
                    bsStyle="primary"
                    bsSize={this.props.buttonSize}
                    onClick={() => {
                        this.props.onLayerAdd({...record, id: record.id, visibility: true});
                        this.props.onLayerChange('currentLayer', {...record});
                        this.props.onLayerChange('tempLayer', {...record});
                        this.props.onPropertiesChange(record.id, {visibility: true});
                        // this.props.onAdd();
                    }}
                    key="addlayer">
                        <Glyphicon glyph="plus" />&nbsp;{buttonText}
                </Button>
            );
        }
        if (wms) {
            buttons.push(
                <Button
                    key="wms-button"
                    className="record-button"
                    bsStyle="primary"
                    bsSize={this.props.buttonSize}
                    onClick={() => {
                        const id = uuidv1();
                        if (this.props.source === 'backgroundSelector') {

                            const modalFeatures = {showModal: assign({}, wms, {type: 'wms'}), id};
                            this.props.onAddBackgroundProperties(modalFeatures, true);
                        } else {
                            this.addLayer(wms);
                        }


                    }}
                    key="addlayer">
                        <Glyphicon glyph="plus" />&nbsp;{buttonText}
                </Button>
            );
        }
        if (wmts) {
            buttons.push(
                <Button
                    key="wmts-button"
                    className="record-button"
                    bsStyle="primary"
                    bsSize={this.props.buttonSize}
                    onClick={() => {
                        const id = uuidv1();
                        if (this.props.source === 'backgroundSelector') {
                            const modalFeatures = {showModal: assign({}, wmts, {type: 'wmts'}), id};
                            this.props.onAddBackgroundProperties(modalFeatures, true);
                        } else {
                            this.addwmtsLayer(wmts, id);
                        }

                    }}
                    key="addwmtsLayer">
                        <Glyphicon glyph="plus" />&nbsp;{buttonText}
                </Button>
            );
        }
        if (esri) {
            buttons.push(
                <Button
                    key="wmts-button"
                    className="record-button"
                    bsStyle="primary"
                    bsSize={this.props.buttonSize}
                    onClick={() => {
                        const id = uuidv1();
                        if (this.props.source === 'backgroundSelector') {
                            const modalFeatures = {showModal: assign({}, esri, {type: 'esri'}), id};
                            this.props.onAddBackgroundProperties(modalFeatures, true);
                        } else {
                            this.addEsriLayer();
                        }
                    }}
                    key="addwmtsLayer">
                        <Glyphicon glyph="plus" />&nbsp;<Message msgId="catalog.addToMap"/>
                </Button>
            );
        }
        // create get capabilities links that will be used to share layers info
        if (this.props.showGetCapLinks) {
            let links = getRecordLinks(record);
            if (links.length > 0) {
                buttons.push(<SharingLinks key="sharing-links" popoverContainer={this} links={links}
                    onCopy={this.props.onCopy} buttonSize={this.props.buttonSize} addAuthentication={this.props.addAuthentication}/>);
            }
        }

        return (
            <div className="record-buttons">
                {buttons}
            </div>
        );
    };

    renderDescription = (record) => {
        if (!record) {
            return null;
        }
        if (typeof record.description === "string") {
            return record.description;
        } else if (Array.isArray(record.description)) {
            return record.description.join(", ");
        }
    };

    render() {
        let record = this.props.record;
        const {wms, wmts} = record && record.group === 'background' && {} || record && record.references && extractOGCServicesReferences(record) || {};
        const disabled = record && record.group === 'background' && head((this.props.layers || []).filter(lay => lay.id === record.id));
        const {esri} = record && record.references && extractEsriReferences(record) || {};
        return (
            <Panel className="record-item" style={{opacity: disabled ? 0.4 : 1.0}}>
                {!this.props.hideThumbnail && <div className="record-item-thumb">
                    {this.renderThumb(record && (record.thumbnail || record.thumbUrl), record)}
                </div>}
                <div className="record-item-content">
                    <div className="record-item-title">
                        <h4>{record && this.getTitle(record.title)}</h4>
                        {!this.props.hideExpand && <ContainerDimensions>
                            {({width}) => this.displayExpand(width) &&
                            <Button
                                tooltipPosition="left"
                                tooltipId={!this.state.truncateText ? 'catalog.showDescription' : 'catalog.hideDescription'}
                                className={`square-button-md ${!this.state.truncateText ? '' : ' ms-collapsed'}`} onClick={() => this.setState({truncateText: !this.state.truncateText})}>
                                <Glyphicon glyph="chevron-left"/>
                            </Button>}
                        </ContainerDimensions>}
                    </div>
                    <div className={`record-item-info${this.state.truncateText ? '' : ' record-item-truncate-text'}`}>
                        {!this.props.hideIdentifier && <h4><small>{record && record.identifier}</small></h4>}
                        <p className="record-item-description">{this.renderDescription(record)}</p>
                    </div>
                    {!wms && !wmts && !esri && !(record.group === 'background') && <small className="text-danger"><Message msgId="catalog.missingReference"/></small>}
                    {!this.props.hideExpand && <div
                    className="ms-ruler"
                    style={{visibility: 'hidden', height: 0, whiteSpace: 'nowrap', position: 'absolute' }}
                    ref={ruler => { this.descriptionRuler = ruler; }}>{this.renderDescription(record)}</div>}
                    {!disabled ? this.renderButtons(record) : 'Added to background selector'}
                </div>
                <ModalMock
                    deletedId = {this.props.deletedId}
                    unsavedChanges = {this.props.unsavedChanges}
                    thumbURL ={this.props.modalParams && this.props.modalParams.CurrentNewThumbnail}
                    add
                    onUpdate= { parameter => this.props.onAddBackgroundProperties(parameter, true)}
                    modalParams={this.props.modalParams}
                    onClose={() => this.props.onAddBackgroundProperties(null, false)}
                    onSave={() => {
                        if (this.props.modalParams.showModal.type === 'wms') {
                            this.addLayer(this.props.modalParams.showModal, this.props.modalParams.id);
                        }

                        if (this.props.modalParams.showModal.type === 'wmts') {
                            this.addwmtsLayer(this.props.modalParams.showModal, this.props.modalParams.id, this.props.modalParams.showModal.title);
                        }
                        this.props.onPropertiesChange(this.props.modalParams.id, this.props.modalParams.showModal);
                        this.props.onLayerChange('currentLayer', assign({}, this.props.modalParams.showModal, {id: this.props.modalParams.id}));
                        this.props.onLayerChange('tempLayer', this.props.modalParams.showModal);
                        this.props.onPropertiesChange( this.props.modalParams.id, {visibility: true});
                        this.props.onUpdateThumbnail(this.props.modalParams.newThumbnail, this.props.modalParams.thumbnailData, false, this.props.modalParams.id);

                    }}
                    updateThumbnail={(data, url) => !data && !url ? this.props.removeThumbnail(this.props.modalParams.id) : this.props.onUpdateThumbnail(data, url, true, this.props.modalParams.id)}
                   />
            </Panel>
        );
    }

    isLinkCopied = (key) => {
        return this.state[key];
    };

    setLinkCopiedStatus = (key, status) => {
        this.setState({[key]: status});
    };

    addLayer = (wms, id) => {
        const removeParams = ["request", "layer", "layers", "service", "version"].concat(this.props.authkeyParamNames);
        const { url } = removeParameters(ConfigUtils.cleanDuplicatedQuestionMarks(wms.url), removeParams );
        const allowedSRS = buildSRSMap(wms.SRS);
        if (wms.SRS.length > 0 && !CoordinatesUtils.isAllowedSRS(this.props.crs, allowedSRS)) {
            this.props.onError('catalog.srs_not_allowed');
        } else {
            const properties = {
                removeParams,
                url,
                id,
                title: wms.title,
                catalogURL: this.props.catalogType === 'csw' && this.props.catalogURL ? this.props.catalogURL + "?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=" + this.props.record.identifier : null
            };
            const LayerGroup = this.props.source === 'backgroundSelector' ? {group: 'background'} : {};
            let layerProperties = assign({}, properties, LayerGroup);

            this.props.onLayerAdd(
                recordToLayer(this.props.record, "wms", layerProperties));
            if (this.props.record.boundingBox && this.props.zoomToLayer) {
                let extent = this.props.record.boundingBox.extent;
                let crs = this.props.record.boundingBox.crs;
                this.props.onZoomToExtent(extent, crs);
            }
        }
    };

    addwmtsLayer = (wmts, id) => {
        const removeParams = ["request", "layer"].concat(this.props.authkeyParamNames);
        const { url } = removeParameters(ConfigUtils.cleanDuplicatedQuestionMarks(wmts.url), removeParams);
        const allowedSRS = buildSRSMap(wmts.SRS);
        if (wmts.SRS.length > 0 && !CoordinatesUtils.isAllowedSRS(this.props.crs, allowedSRS)) {
            this.props.onError('catalog.srs_not_allowed');
        } else {
            const properties = {
                removeParams,
                url,
                id,
                title: wmts.title
            };
            const LayerGroup = this.props.source === 'backgroundSelector' ? {group: 'background'} : {};
            let layerProperties = assign({}, properties, LayerGroup);
            this.props.onLayerAdd(recordToLayer(this.props.record, "wmts", layerProperties));
            if (this.props.record.boundingBox && this.props.zoomToLayer) {
                let extent = this.props.record.boundingBox.extent;
                let crs = this.props.record.boundingBox.crs;
                this.props.onZoomToExtent(extent, crs);
            }
        }
    };
    addEsriLayer = () => {
        this.props.onLayerAdd(esriToLayer(this.props.record));
        if (this.props.record.boundingBox && this.props.zoomToLayer) {
            let extent = this.props.record.boundingBox.extent;
            let crs = this.props.record.boundingBox.crs;
            this.props.onZoomToExtent(extent, crs);
        }
    };
    displayExpand = width => {
        const descriptionWidth = this.descriptionRuler ? this.descriptionRuler.clientWidth : 0;
        return descriptionWidth > width;
    };
}

module.exports = RecordItem;
