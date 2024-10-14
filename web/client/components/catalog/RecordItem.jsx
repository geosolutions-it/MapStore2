/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import PropTypes from 'prop-types';
import { isObject, head, isArray, trim, isEmpty } from 'lodash';
import { Image, SplitButton as SplitButtonT, Glyphicon, MenuItem } from 'react-bootstrap';
import tooltip from '../../components/misc/enhancers/tooltip';
import {
    buildSRSMap,
    getRecordLinks
} from '../../utils/CatalogUtils';
import { isAllowedSRS, isSRSAllowed } from '../../utils/CoordinatesUtils';
import HtmlRenderer from '../misc/HtmlRenderer';
import {parseCustomTemplate} from '../../utils/TemplateUtils';
import {getMessageById} from '../../utils/LocaleUtils';
import Message from '../I18N/Message';
import SharingLinks from './SharingLinks';
import SideCard from '../misc/cardgrids/SideCard';
import Toolbar from '../misc/toolbar/Toolbar';
import API from '../../api/catalog';

import defaultThumb from './img/default.jpg';
import defaultBackgroundThumbs from '../../plugins/background/DefaultThumbs';
import unknown from "../../plugins/background/assets/img/dafault.jpg";
import { getResolutions } from "../../utils/MapUtils";
import Loader from '../misc/Loader';
const SplitButton = tooltip(SplitButtonT);

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
        defaultFormat: PropTypes.string
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
        visibleExpand: false,
        loading: false
    }

    static contextTypes = {
        messages: PropTypes.object
    };

    componentDidMount() {
        const notAvailable = getMessageById(this.context.messages, "catalog.notAvailable");
        const record = this.props.record;
        this.setState({visibleExpand: !this.props.hideExpand &&  // eslint-disable-line -- TODO: need to be fixed
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

    isSRSNotAllowed = (record) => {
        if (record.serviceType !== 'cog') {
            const ogcReferences = record.ogcReferences || { SRS: [] };
            const allowedSRS = ogcReferences?.SRS?.length > 0 && buildSRSMap(ogcReferences.SRS);
            return allowedSRS && !isAllowedSRS(this.props.crs, allowedSRS);
        }
        const crs = record?.sourceMetadata?.crs;
        return crs && !isSRSAllowed(crs);
    }

    onAddToMap = (record, serviceType = record.serviceType) => {
        if (this.isSRSNotAllowed(record)) {
            return this.props.onError('catalog.srs_not_allowed');
        }
        this.setState({ loading: true });
        return API[serviceType].getLayerFromRecord(record, {
            fetchCapabilities: !!record.fetchCapabilities,
            service: {
                ...this.props.service,
                format: this.props?.service?.format ?? this.props.defaultFormat
            },
            layerBaseConfig: this.props.layerBaseConfig,
            removeParams: this.props.authkeyParamNames,
            catalogURL: this.props.catalogType === "csw" && this.props.catalogURL
                ? this.props.catalogURL +
                "?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=" +
                record.identifier
                : null,
            map: {
                projection: this.props.crs,
                resolutions: getResolutions()
            }
        }, true)
            .then((layer) => {
                if (layer) {
                    this.addLayer(layer, record);
                }
            }).finally(()=> {
                this.setState({ loading: false });
            });
    }

    getButtons = (record) => {
        const links = this.props.showGetCapLinks ? getRecordLinks(record) : [];
        const showServices = !isEmpty(record.additionalOGCServices);
        return [
            ...(showServices ? [{
                Element: () => (
                    <SplitButton
                        id="add-layer-button"
                        tooltipId="catalog.addToMap"
                        className="square-button-md"
                        bsStyle="primary"
                        title={this.state.loading ? <Loader className={'ms-loader ms-loader-primary'}/> : <Glyphicon glyph="plus" />}
                        onClick={() => this.onAddToMap(record)}
                        pullRight="left"
                        disabled={this.state.loading}
                    >
                        <MenuItem onClick={() => this.onAddToMap(record)}>
                            <Message msgId="catalog.additionalOGCServices.wms"/>
                        </MenuItem>
                        {
                            Object.keys(record.additionalOGCServices ?? {})
                                .map(serviceType => (
                                    <MenuItem id={`ogc-${serviceType}`}
                                        onClick={() => this.onAddToMap(record.additionalOGCServices[serviceType], serviceType)}>
                                        <Message msgId={`catalog.additionalOGCServices.${serviceType}`}/>
                                    </MenuItem>)
                                )
                        }
                    </SplitButton>
                )
            }] : [{
                tooltipId: 'catalog.addToMap',
                className: 'square-button-md',
                bsStyle: 'primary',
                disabled: this.state.loading,
                loading: this.state.loading,
                glyph: 'plus',
                onClick: () => this.onAddToMap(record)
            }]),
            ...(links.length > 0
                ? [{
                    Element: () => (
                        <SharingLinks
                            key="sharing-links"
                            popoverContainer={this}
                            links={links}
                            onCopy={this.props.onCopy}
                            buttonSize={this.props.buttonSize}
                            addAuthentication={this.props.addAuthentication}
                        />
                    )
                }]
                : [])
        ];
    };

    renderDescription = (record) => {
        if (!record) {
            return null;
        }
        const notAvailable = getMessageById(this.context.messages, "catalog.notAvailable");
        return this.state.fullText && record.metadataTemplate
            ? (<div className="catalog-metadata ql-editor">
                <HtmlRenderer html={parseCustomTemplate(record.metadataTemplate, record.metadata, (attribute) => `${trim(attribute.substring(2, attribute.length - 1))} ${notAvailable}`)}/>
            </div>)
            : record.metadataTemplate ? '' : (isArray(record.description) ? record.description.join(", ") : record.description);
    };

    render() {
        const record = this.props.record;
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
                        background && ((background.name || background.source) ? defaultBackgroundThumbs[background.source][background.name] : unknown), record)}
                title={record && this.getTitle(record.title)}
                description={<span><div className ref={sideCardDesc => {
                    this.sideCardDesc = sideCardDesc;
                }}>{this.renderDescription(record)}</div></span>}
                caption={
                    <div>
                        {!this.props.hideIdentifier && <div className="identifier">{record && record.identifier}</div>}
                        <div>{!record.isValid && <small className="text-danger"><Message msgId="catalog.missingReference"/></small>}</div>
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
                            {
                                visible: !!disabled,
                                Element: () => <Message msgId="catalog.backgroundAlreadyAdded"/>
                            },
                            ...(record?.references && !disabled
                                ? this.getButtons(record)
                                : []),
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
