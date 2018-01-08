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
const {head, memoize, isObject} = require('lodash');
const assign = require('object-assign');

const CoordinatesUtils = require('../../utils/CoordinatesUtils');
const ConfigUtils = require('../../utils/ConfigUtils');

const defaultThumb = require('./img/default.jpg');

const buildSRSMap = memoize((srs) => {
    return srs.reduce((previous, current) => {
        return assign(previous, {[current]: true});
    }, {});
});

const removeParameters = (url, skip) => {
    const urlparts = url.split('?');
    const params = {};
    if (urlparts.length >= 2 && urlparts[1]) {
        const pars = urlparts[1].split(/[&;]/g);
        pars.forEach((par) => {
            const param = par.split('=');
            if (skip.indexOf(param[0].toLowerCase()) === -1) {
                params[param[0]] = param[1];
            }
        });
    }
    return {url: urlparts[0], params};
};

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
        catalogURL: PropTypes.string
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

    getLinks = (record) => {
        let wmsGetCap = head(record.references.filter(reference => reference.type &&
            reference.type.indexOf("OGC:WMS") > -1 && reference.type.indexOf("http-get-capabilities") > -1));
        let wfsGetCap = head(record.references.filter(reference => reference.type &&
            reference.type.indexOf("OGC:WFS") > -1 && reference.type.indexOf("http-get-capabilities") > -1));
        let wmtsGetCap = head(record.references.filter(reference => reference.type &&
            reference.type.indexOf("OGC:WMTS") > -1 && reference.type.indexOf("http-get-capabilities") > -1));
        let links = [];
        if (wmsGetCap) {
            links.push({
                type: "WMS_GET_CAPABILITIES",
                url: wmsGetCap.url,
                labelId: 'catalog.wmsGetCapLink'
            });
        }
        if (wmtsGetCap) {
            links.push({
                type: "WMTS_GET_CAPABILITIES",
                url: wmtsGetCap.url,
                labelId: 'catalog.wmtsGetCapLink'
            });
        }
        if (wfsGetCap) {
            links.push({
                type: "WFS_GET_CAPABILITIES",
                url: wfsGetCap.url,
                labelId: 'catalog.wfsGetCapLink'
            });
        }
        return links;
    };

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
        let wms = head(record.references.filter(reference => reference.type && (reference.type === "OGC:WMS"
            || reference.type.indexOf("OGC:WMS") > -1 && reference.type.indexOf("http-get-map") > -1)));
        let wmts = head(record.references.filter(reference => reference.type && (reference.type === "OGC:WMTS"
            || reference.type.indexOf("OGC:WMTS") > -1 && reference.type.indexOf("http-get-map") > -1)));
        // let's create the buttons
        let buttons = [];
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
        // creating get capbilities links that will be used to share layers info
        if (this.props.showGetCapLinks) {
            let links = this.getLinks(record);
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
                    <p className="truncateText record-item-description">{this.renderDescription(record)}</p>
                </div>
                  {this.renderButtons(record)}
            </Panel>
        );
    }

    isLinkCopied = (key) => {
        return this.state[key];
    };

    setLinkCopiedStatus = (key, status) => {
        this.setState({[key]: status});
    };

    addLayer = (wms) => {
        const {url, params} = removeParameters(ConfigUtils.cleanDuplicatedQuestionMarks(wms.url), ["request", "layer", "service", "version"].concat(this.props.authkeyParamNames));
        const allowedSRS = buildSRSMap(wms.SRS);
        if (wms.SRS.length > 0 && !CoordinatesUtils.isAllowedSRS(this.props.crs, allowedSRS)) {
            this.props.onError('catalog.srs_not_allowed');
        } else {
            this.props.onLayerAdd({
                type: "wms",
                url: url,
                visibility: true,
                dimensions: this.props.record.dimensions || [],
                name: wms.params && wms.params.name,
                title: this.props.record.title || wms.params && wms.params.name,
                description: this.props.record.description || "",
                bbox: {
                    crs: this.props.record.boundingBox.crs,
                    bounds: {
                        minx: this.props.record.boundingBox.extent[0],
                        miny: this.props.record.boundingBox.extent[1],
                        maxx: this.props.record.boundingBox.extent[2],
                        maxy: this.props.record.boundingBox.extent[3]
                    }
                },
                links: this.getLinks(this.props.record),
                params: params,
                allowedSRS: allowedSRS,
                catalogURL: this.props.catalogURL + "?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=" + this.props.record.identifier
            });
            if (this.props.record.boundingBox && this.props.zoomToLayer) {
                let extent = this.props.record.boundingBox.extent;
                let crs = this.props.record.boundingBox.crs;
                this.props.onZoomToExtent(extent, crs);
            }
        }
    };

    addwmtsLayer = (wmts) => {
        const {url, params} = removeParameters(ConfigUtils.cleanDuplicatedQuestionMarks(wmts.url), ["request", "layer"].concat(this.props.authkeyParamNames));
        const allowedSRS = buildSRSMap(wmts.SRS);
        if (wmts.SRS.length > 0 && !CoordinatesUtils.isAllowedSRS(this.props.crs, allowedSRS)) {
            this.props.onError('catalog.srs_not_allowed');
        } else {
            this.props.onLayerAdd({
                type: "wmts",
                url: url,
                visibility: true,
                name: wmts.params && wmts.params.name,
                title: this.props.record.title || wmts.params && wmts.params.name,
                matrixIds: this.props.record.matrixIds || [],
                description: this.props.record.description || "",
                tileMatrixSet: this.props.record.tileMatrixSet || [],
                bbox: {
                    crs: this.props.record.boundingBox.crs,
                    bounds: {
                        minx: this.props.record.boundingBox.extent[0],
                        miny: this.props.record.boundingBox.extent[1],
                        maxx: this.props.record.boundingBox.extent[2],
                        maxy: this.props.record.boundingBox.extent[3]
                    }
                },
                links: this.getLinks(this.props.record),
                params: params,
                allowedSRS: allowedSRS
            });
            if (this.props.record.boundingBox && this.props.zoomToLayer) {
                let extent = this.props.record.boundingBox.extent;
                let crs = this.props.record.boundingBox.crs;
                this.props.onZoomToExtent(extent, crs);
            }
        }
    };
}

module.exports = RecordItem;
