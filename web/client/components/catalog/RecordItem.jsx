/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import PropTypes from 'prop-types';
import assign from 'object-assign';
import uuidv1 from 'uuid/v1';
import {isObject, head, omit, isArray, trim } from 'lodash';
import {Image, Panel, Button as ButtonRB, Glyphicon} from 'react-bootstrap';

import {
    buildSRSMap,
    extractEsriReferences,
    extractOGCServicesReferences,
    esriToLayer,
    getRecordLinks,
    recordToLayer,
    removeParameters
} from '../../utils/CatalogUtils';
import CoordinatesUtils from '../../utils/CoordinatesUtils';
import ContainerDimensions from 'react-container-dimensions';
import ConfigUtils from '../../utils/ConfigUtils';
import HtmlRenderer from '../misc/HtmlRenderer';
import {parseCustomTemplate} from '../../utils/TemplateUtils';
import LocaleUtils from '../../utils/LocaleUtils';
import Message from '../I18N/Message';
import SharingLinks from './SharingLinks';
import SideCard from '../misc/cardgrids/SideCard';
import Toolbar from '../misc/toolbar/Toolbar';
import tooltip from '../misc/enhancers/tooltip';
const Button = tooltip(ButtonRB);

import defaultThumb from './img/default.jpg';

const BackgroundDialog = require('../background/BackgroundDialog');

class RecordItem extends React.Component {
    static propTypes = {
        addAuthentication: PropTypes.bool,
        authkeyParamNames: PropTypes.array,
        buttonSize: PropTypes.string,
        catalogURL: PropTypes.string,
        catalogType: PropTypes.string,
        crs: PropTypes.string,
        currentLocale: PropTypes.string,
        hideThumbnail: PropTypes.bool,
        hideExpand: PropTypes.bool,
        hideIdentifier: PropTypes.bool,
        layerBaseConfig: PropTypes.object,
        onCopy: PropTypes.func,
        onError: PropTypes.func,
        onLayerAdd: PropTypes.func,
        onZoomToExtent: PropTypes.func,
        record: PropTypes.object,
        showGetCapLinks: PropTypes.bool,
        zoomToLayer: PropTypes.bool,
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
        removeThumbnail: PropTypes.func,
        clearModal: PropTypes.func,
        showTemplate: PropTypes.bool
    };

    static defaultProps = {
        modalParams: {showModal: false},
        buttonSize: "small",
        crs: "EPSG:3857",
        currentLocale: 'en-US',
        onUpdateThumbnail: () => {},
        onAddBackgroundProperties: () => {},
        hideThumbnail: false,
        hideIdentifier: false,
        hideExpand: false,
        layerBaseConfig: {},
        onCopy: () => {},
        onError: () => {},
        onLayerAdd: () => {},
        onZoomToExtent: () => {},
        onPropertiesChange: () => {},
        onLayerChange: () => {},
        removeThumbnail: () => {},
        clearModal: () => {},
        style: {},
        showGetCapLinks: false,
        zoomToLayer: true,
        layers: [],
        onAdd: () => {},
        source: 'metadataExplorer',
        record: {},
        showTemplate: false
    };
    state = {
        visibleExpand: false
    }

    static contextTypes = {
        messages: PropTypes.object
    };

    componentDidMount() {
        const notAvailable = LocaleUtils.getMessageById(this.context.messages, "catalog.notAvailable");
        const record = this.props.record;
        this.setState({visibleExpand: !this.props.hideExpand &&
            (
                this.displayExpand() ||
                // show expand if the template is not empty
                !!(this.props.showTemplate && record && record.metadataTemplate && parseCustomTemplate(record.metadataTemplate, record.metadata, (attribute) => `${trim(attribute.substring(2, attribute.length - 1))} ${notAvailable}`))
            )
        });
    }
    UNSAFE_componentWillMount() {
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
        const {esri} = record.group === 'background' && {} || extractEsriReferences(record);

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
        // TODO addWmsLayer and addwmtsLayer do almost the same thing and they should be unified
        if (wms) {
            buttons.push(
                <Button
                    key="wms-button"
                    tooltipId="catalog.addToMap"
                    className="square-button-md"
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
                        /*this.addWmsLayer(wms);*/

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
                    tooltipId="catalog.addToMap"
                    className="square-button-md"
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
                    tooltipId="catalog.addToMap"
                    className="square-button-md"
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
                    <Glyphicon glyph="plus" />
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

        return buttons;
    };

    renderDescription = (record) => {
        if (!record) {
            return null;
        }
        const notAvailable = LocaleUtils.getMessageById(this.context.messages, "catalog.notAvailable");
        return this.state.fullText && record.metadataTemplate
            ? (<div className="catalog-metadata ql-editor">
                <HtmlRenderer html={parseCustomTemplate(record.metadataTemplate, record.metadata, (attribute) => `${trim(attribute.substring(2, attribute.length - 1))} ${notAvailable}`)}/>
            </div>)
            : record.metadataTemplate ? '' : (isArray(record.description) ? record.description.join(", ") : record.description);
    };

    render() {
        let record = this.props.record;
        const {wms, wmts} = record && record.group === 'background' && {} || record && record.references && extractOGCServicesReferences(record) || {};
        const disabled = record && record.group === 'background' && head((this.props.layers || []).filter(lay => lay.id === record.id));
        const {esri} = record && record.group === 'background' && record && record.references && extractEsriReferences(record) || {};
        // the preview and toolbar width depends on the values defined in the theme (variable.less)
        // IMPORTANT: if those values are changed then this defaults needs to change too
        return record ? (<div>
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
                <BackgroundDialog
                    deletedId = {this.props.deletedId}
                    unsavedChanges = {this.props.unsavedChanges}
                    thumbURL ={this.props.modalParams && this.props.modalParams.CurrentNewThumbnail}
                    add
                    onUpdate= { parameter => this.props.onAddBackgroundProperties(parameter, true)}
                    modalParams={this.props.modalParams}
                    onClose={() => {
                        this.props.onAddBackgroundProperties(null, false);
                        this.props.removeThumbnail(undefined);
                        this.props.clearModal();
                    }}
                    onSave={(layerModal, extraParams) => {
                        const savedLayer = this.updatedLayer(layerModal);
                        if (savedLayer.type === 'wms') {
                            this.addLayer(savedLayer, this.props.modalParams.id, extraParams);
                        }

                        if (savedLayer.type === 'wmts') {
                            this.addwmtsLayer(savedLayer, this.props.modalParams.id, extraParams);
                        }
                        this.props.onPropertiesChange(this.props.modalParams.id, this.updatedLayer(layerModal));
                        this.props.onLayerChange('currentLayer', assign({}, savedLayer, {id: this.props.modalParams.id}));
                        this.props.onLayerChange('tempLayer', savedLayer);
                        // this.props.onPropertiesChange( this.props.modalParams.id, {visibility: true});
                        this.props.onUpdateThumbnail(this.props.modalParams.newThumbnail, this.props.modalParams.thumbnailData, false, this.props.modalParams.id);
                        this.props.clearModal();

                    }}
                    updateThumbnail={(data, url) => !data && !url ? this.props.removeThumbnail(this.props.modalParams.id) : this.props.onUpdateThumbnail(data, url, true, this.props.modalParams.id)}
                   />
            </Panel>
            <SideCard
                style={{transform: "none"}}
                fullText={this.state.fullText}
                preview={!this.props.hideThumbnail && this.renderThumb(record && record.thumbnail, record)}
                title={record && this.getTitle(record.title)}
                description={<div className ref={sideCardDesc => {
                    this.sideCardDesc = sideCardDesc;
                }}>{this.renderDescription(record)}</div>}
                caption={
                    <div>
                        {!this.props.hideIdentifier && <div className="identifier">{record && record.identifier}</div>}
                        <div>{!wms && !wmts && !esri && <small className="text-danger"><Message msgId="catalog.missingReference"/></small>}</div>
                        {!this.props.hideExpand &&
                                <div
                                    className="ms-ruler"
                                    style={{visibility: 'hidden', height: 0, whiteSpace: 'nowrap', position: 'absolute' }}
                                    ref={ruler => { this.descriptionRuler = ruler; }}>{this.renderDescription(record)}
                                </div>
                        }
                    </div>
                }
                tools={
                    <Toolbar
                        btnDefaultProps={{
                            className: 'square-button-md',
                            bsStyle: 'primary'
                        }}
                        btnGroupProps={{
                            style: {
                                margin: 10
                            }
                        }}
                        buttons={[
                            ...(record && this.renderButtons(record) || []).map(Element => ({ Element: () => Element })),
                            {
                                glyph: this.state.fullText ? 'chevron-down' : 'chevron-left',
                                visible: this.state.visibleExpand,
                                tooltipId: this.state.fullText ? 'collapse' : 'expand',
                                onClick: () => this.setState({ fullText: !this.state.fullText })
                            }
                        ]}/>
                }/>
        </div>) : null;
    }

    isLinkCopied = (key) => {
        return this.state[key];
    };

    setLinkCopiedStatus = (key, status) => {
        this.setState({[key]: status});
    };

    addLayer = (wms, id, extraParameters = {}) => {
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
            let layerProperties = assign({}, properties, assign({}, LayerGroup, extraParameters ? {additionalParams: extraParameters} : {}));

            this.props.onLayerAdd(
                recordToLayer(this.props.record, "wms", layerProperties));
            if (this.props.record.boundingBox && this.props.zoomToLayer) {
                let extent = this.props.record.boundingBox.extent;
                let crs = this.props.record.boundingBox.crs;
                this.props.onZoomToExtent(extent, crs);
            }
        }
    };

    addwmtsLayer = (wmts, id, extraParameters = {}) => {
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
            let layerProperties = assign({}, properties, assign({}, LayerGroup, extraParameters ? {additionalParams: extraParameters} : {}));
            this.props.onLayerAdd(recordToLayer(this.props.record, "wmts", layerProperties, this.props.layerBaseConfig));
            if (this.props.record.boundingBox && this.props.zoomToLayer) {
                let extent = this.props.record.boundingBox.extent;
                let crs = this.props.record.boundingBox.crs;
                this.props.onZoomToExtent(extent, crs);
            }
        }
    };
    addEsriLayer = () => {
        this.props.onLayerAdd(esriToLayer(this.props.record, this.props.layerBaseConfig));
        if (this.props.record.boundingBox && this.props.zoomToLayer) {
            let extent = this.props.record.boundingBox.extent;
            let crs = this.props.record.boundingBox.crs;
            this.props.onZoomToExtent(extent, crs);
        }
    };
    /**
     * it manages visibility of expand button.
     * it checks if the width of descriptionRuler is higher than the width of the desc-section
     * @return {boolean} the value of the check
    */
    displayExpand = () => {

        const descriptionRulerWidth = this.descriptionRuler ? this.descriptionRuler.clientWidth : 0;
        const descriptionWidth = this.sideCardDesc ? this.sideCardDesc.clientWidth : 0;
        return descriptionRulerWidth > descriptionWidth;
    };
    updatedLayer = (layer) => {
        // add the newly created Thumbnail url (if existed)
        const output = assign({}, this.props.modalParams.showModal, {source: layer.CurrentNewThumbnail || layer.source } );
        return omit(output, ['CurrentThumbnailData', 'CurrentNewThumbnail']);
    };
}

export default RecordItem;
