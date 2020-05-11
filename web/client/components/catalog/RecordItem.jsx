/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import PropTypes from 'prop-types';
import {isObject, head, isArray, trim } from 'lodash';
import {Image, Button as ButtonRB, Glyphicon} from 'react-bootstrap';

import {
    buildSRSMap,
    extractEsriReferences,
    extractOGCServicesReferences,
    esriToLayer,
    getRecordLinks,
    recordToLayer,
    wfsToLayer
} from '../../utils/CatalogUtils';
import CoordinatesUtils from '../../utils/CoordinatesUtils';
import HtmlRenderer from '../misc/HtmlRenderer';
import {parseCustomTemplate} from '../../utils/TemplateUtils';
import LocaleUtils from '../../utils/LocaleUtils';
import Message from '../I18N/Message';
import SharingLinks from './SharingLinks';
import SideCard from '../misc/cardgrids/SideCard';
import Toolbar from '../misc/toolbar/Toolbar';
import tooltip from '../misc/enhancers/tooltip';
const Button = tooltip(ButtonRB);
import AddTMS from './buttons/AddTMS';
import AddTileProvider from './buttons/AddTileProvider';

import defaultThumb from './img/default.jpg';
import defaultBackgroundThumbs from '../../plugins/background/DefaultThumbs';

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
        record: PropTypes.object,
        showGetCapLinks: PropTypes.bool,
        zoomToLayer: PropTypes.bool,
        onPropertiesChange: PropTypes.func,
        onLayerChange: PropTypes.func,
        layers: PropTypes.array,
        onAdd: PropTypes.func,
        source: PropTypes.string,
        onAddBackgroundProperties: PropTypes.func,
        deletedId: PropTypes.string,
        clearModal: PropTypes.func,
        service: PropTypes.service,
        showTemplate: PropTypes.bool,
        defaultFormat: PropTypes.string,
        formatOptions: PropTypes.array
    };

    static defaultProps = {
        buttonSize: "small",
        crs: "EPSG:3857",
        currentLocale: 'en-US',
        onAddBackgroundProperties: () => {},
        hideThumbnail: false,
        hideIdentifier: false,
        hideExpand: false,
        layerBaseConfig: {},
        onCopy: () => {},
        onError: () => {},
        onLayerAdd: () => {},
        onPropertiesChange: () => {},
        onLayerChange: () => {},
        clearModal: () => {},
        style: {},
        showGetCapLinks: false,
        zoomToLayer: true,
        layers: [],
        onAdd: () => {},
        source: 'metadataExplorer',
        showTemplate: false,
        changeLayerProperties: () => {},
        defaultFormat: "image/png"
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

    renderButtons = (record, disabled) => {
        if (!record || !record.references) {
            // we don't have a valid record so no buttons to add
            return null;
        }
        // let's extract the references we need
        const {wms, wmts, tms, wfs}  = extractOGCServicesReferences(record);
        // let's extract the esri
        const {esri} = extractEsriReferences(record);
        const background = record && record.background;
        const tileProvider = record && record.type === "tileprovider" && record.provider;

        // let's create the buttons
        let buttons = [];
        if (background) {
            buttons.push(disabled ?
                <Message msgId="catalog.backgroundAlreadyAdded"/> :
                <Button
                    tooltipId="catalog.addToMap"
                    className="square-button-md"
                    bsStyle="primary"
                    bsSize={this.props.buttonSize}
                    onClick={() => {
                        const layer = {...background, id: background.name, visibility: false};
                        this.props.onLayerAdd(layer, { background });
                    }}
                    key="addlayer">
                    <Glyphicon glyph="plus" />
                </Button>
            );
        }
        if (wms || wmts) {
            const type = wms ? 'wms' : 'wmts';
            buttons.push(
                <Button
                    tooltipId="catalog.addToMap"
                    className="square-button-md"
                    bsStyle="primary"
                    bsSize={this.props.buttonSize}
                    onClick={() => {
                        const layer = this.makeLayer(type, wms || wmts, record.format && [record.format] || record.formats);
                        if (layer) {
                            this.addLayer(layer, {record});
                        }
                    }}
                    key={`add${type}layer`}>
                    <Glyphicon glyph="plus" />
                </Button>
            );
        }
        if (esri) {
            buttons.push(
                <Button
                    tooltipId="catalog.addToMap"
                    className="square-button-md"
                    bsStyle="primary"
                    bsSize={this.props.buttonSize}
                    onClick={() => {
                        this.addLayer(esriToLayer(this.props.record, this.props.layerBaseConfig));
                    }}
                    key={`addesrilayer`}>
                    <Glyphicon glyph="plus" />
                </Button>
            );
        }
        if (tms) {
            buttons.push(
                <AddTMS
                    service={this.props.service}
                    key="addTmsLayer"
                    tooltipId="catalog.addToMap"
                    className="square-button-md"
                    bsStyle="primary"
                    bsSize={this.props.buttonSize}
                    addLayer={this.addLayer}
                    record={this.props.record}>
                    <Glyphicon glyph="plus" />
                </AddTMS>
            );
        }
        if ( wfs ) {
            buttons.push(<Button
                tooltipId="catalog.addToMap"
                key="addWFSLayer"
                className="square-button-md"
                bsStyle="primary"
                bsSize={this.props.buttonSize}
                onClick={() => {
                    this.addLayer(wfsToLayer(this.props.record, this.props.layerBaseConfig));
                }}>
                <Glyphicon glyph="plus" />
            </Button>);
        }
        if (tileProvider) {
            buttons.push(
                <AddTileProvider
                    key="addTileProviderLayer"
                    service={this.props.service}
                    tooltipId="catalog.addToMap"
                    className="square-button-md"
                    bsStyle="primary"
                    bsSize={this.props.buttonSize}
                    addLayer={this.addLayer}
                    record={this.props.record}>
                    <Glyphicon glyph="plus" />
                </AddTileProvider>
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
        const record = this.props.record;
        const { wms, wmts, tms, wfs } = extractOGCServicesReferences(record);
        const {esri} = extractEsriReferences(record);
        const tileProvider = record && record.type === "tileprovider" && record.provider;
        const background = record && record.background;
        const disabled = background && head((this.props.layers || []).filter(layer => layer.id === background.name ||
            layer.type === background.type && layer.source === background.source && layer.name === background.name));
        // the preview and toolbar width depends on the values defined in the theme (variable.less)
        // IMPORTANT: if those values are changed then these defaults also have to change
        return record ? (<div>
            <SideCard
                style={{transform: "none", opacity: disabled ? 0.4 : 1}}
                fullText={this.state.fullText}
                preview={!this.props.hideThumbnail &&
                    this.renderThumb(record && record.thumbnail ||
                        background && defaultBackgroundThumbs[background.source][background.name], record)}
                title={record && this.getTitle(record.title)}
                description={<span><div className ref={sideCardDesc => {
                    this.sideCardDesc = sideCardDesc;
                }}>{this.renderDescription(record)}</div></span>}
                caption={
                    <div>
                        {!this.props.hideIdentifier && <div className="identifier">{record && record.identifier}</div>}
                        <div>{!wms && !wmts && !esri && !background && !tms && !tileProvider && !wfs && <small className="text-danger"><Message msgId="catalog.missingReference"/></small>}</div>
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
                            ...(record && this.renderButtons(record, disabled) || []).map(Element => ({ Element: () => Element })),
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

    getLayerFormat = (formats) => {
        if (formats.length === 0 || formats.filter(f => f === this.props.defaultFormat).length > 0) {
            return this.props.defaultFormat;
        }
        return formats[0];
    };

    makeLayer = (type, ogcReferences, formats = [this.props.defaultFormat]) => {
        const allowedSRS = buildSRSMap(ogcReferences.SRS);
        if (ogcReferences.SRS.length > 0 && !CoordinatesUtils.isAllowedSRS(this.props.crs, allowedSRS)) {
            this.props.onError('catalog.srs_not_allowed');
            return null;
        }

        const localizedLayerStyles = this.props.service && this.props.service.localizedLayerStyles;

        return recordToLayer(
            this.props.record,
            type,
            {
                removeParams: this.props.authkeyParamNames,
                ...(type === "wms"
                    ? {
                        catalogURL:
                            this.props.catalogType === "csw" &&
                            this.props.catalogURL
                                ? this.props.catalogURL +
                                "?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=" +
                                this.props.record.identifier
                                : null,
                        format: this.getLayerFormat(
                            formats.filter(f => f.indexOf("image/") === 0)
                        )
                    }
                    : {
                        format: this.getLayerFormat(
                            formats.filter(f => f.indexOf("image/") === 0)
                        )
                    })
            },
            this.props.layerBaseConfig,
            localizedLayerStyles
        );
    }

    addLayer = (layer, {background} = {}) => {
        // TODO: extenralize this switch
        if (this.props.source === 'backgroundSelector') {
            if (background) {
                // background
                this.props.onLayerAdd({...layer, group: 'background'}, { source: this.props.source });
                this.props.onAddBackground(layer.id);
            } else {
                this.props.onAddBackgroundProperties({
                    editing: false,
                    layer
                }, true);
            }
        } else {
            const zoomToLayer = this.props.zoomToLayer;
            this.props.onLayerAdd(layer, { zoomToLayer });
        }
    }
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
}

export default RecordItem;
