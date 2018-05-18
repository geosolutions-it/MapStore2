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
const {Image, Panel, Button, Glyphicon} = require('react-bootstrap');
const {isObject, truncate} = require('lodash');

const CoordinatesUtils = require('../../utils/CoordinatesUtils');
const ConfigUtils = require('../../utils/ConfigUtils');
const {getRecordLinks, recordToLayer, extractOGCServicesReferences, buildSRSMap, removeParameters} = require('../../utils/CatalogUtils');

const defaultThumb = require('./img/default.jpg');

require("./RecordItem.css");

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
        catalogType: PropTypes.string
    };

    static defaultProps = {
        buttonSize: "small",
        crs: "EPSG:3857",
        currentLocale: 'en-US',
        onCopy: () => {},
        onError: () => {},
        onLayerAdd: () => {},
        onZoomToExtent: () => {},
        style: {},
        showGetCapLinks: false,
        zoomToLayer: true
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
        if (!record || !record.references) {
            // we don't have a valid record so no buttons to add
            return null;
        }
        // let's extract the references we need
        const {wms, wmts} = extractOGCServicesReferences(record);
        // let's create the buttons
        let buttons = [];
        // TODO addLayer and addwmtsLayer do almost the same thing and they should be unified
        if (wms) {
            buttons.push(
                <Button
                    key="wms-button"
                    className="record-button"
                    bsStyle="primary"
                    bsSize={this.props.buttonSize}
                    onClick={() => { this.addLayer(wms); }}
                    key="addlayer">
                        <Glyphicon glyph="plus" />&nbsp;<Message msgId="catalog.addToMap"/>
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
                    onClick={() => { this.addwmtsLayer(wmts); }}
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
        return (
            <Panel className="record-item" style={{padding: 0}}>
                {this.renderThumb(record && record.thumbnail, record)}
                <div>
                    <h4 className="truncateText">{record && this.getTitle(record.title)}</h4>
                    <h4 className="truncateText"><small>{record && record.identifier}</small></h4>
                    <p className="truncateText record-item-description">{this.truncateDescription(this.renderDescription(record), 70)}</p>
                </div>
                  {this.renderButtons(record)}
            </Panel>
        );
    }

    truncateDescription =(description, size) => {
        return truncate(description, {'length': size, 'separator': /,? +/});
    }

    isLinkCopied = (key) => {
        return this.state[key];
    };

    setLinkCopiedStatus = (key, status) => {
        this.setState({[key]: status});
    };

    addLayer = (wms) => {
        const {url} = removeParameters(ConfigUtils.cleanDuplicatedQuestionMarks(wms.url), ["request", "layer", "service", "version"].concat(this.props.authkeyParamNames));
        const allowedSRS = buildSRSMap(wms.SRS);
        if (wms.SRS.length > 0 && !CoordinatesUtils.isAllowedSRS(this.props.crs, allowedSRS)) {
            this.props.onError('catalog.srs_not_allowed');
        } else {
            this.props.onLayerAdd(
                recordToLayer(this.props.record, "wms", {
                    url,
                    catalogURL: this.props.catalogType === 'csw' && this.props.catalogURL ? this.props.catalogURL + "?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=" + this.props.record.identifier : null
                }));
            if (this.props.record.boundingBox && this.props.zoomToLayer) {
                let extent = this.props.record.boundingBox.extent;
                let crs = this.props.record.boundingBox.crs;
                this.props.onZoomToExtent(extent, crs);
            }
        }
    };

    addwmtsLayer = (wmts) => {
        const {url} = removeParameters(ConfigUtils.cleanDuplicatedQuestionMarks(wmts.url), ["request", "layer"].concat(this.props.authkeyParamNames));
        const allowedSRS = buildSRSMap(wmts.SRS);
        if (wmts.SRS.length > 0 && !CoordinatesUtils.isAllowedSRS(this.props.crs, allowedSRS)) {
            this.props.onError('catalog.srs_not_allowed');
        } else {
            this.props.onLayerAdd(recordToLayer(this.props.record, "wmts", {
                url
            }));
            if (this.props.record.boundingBox && this.props.zoomToLayer) {
                let extent = this.props.record.boundingBox.extent;
                let crs = this.props.record.boundingBox.crs;
                this.props.onZoomToExtent(extent, crs);
            }
        }
    };
}

module.exports = RecordItem;
