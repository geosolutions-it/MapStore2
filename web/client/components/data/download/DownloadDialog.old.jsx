/**
  * Copyright 2020, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import React from 'react';
import PropTypes from 'prop-types';
import { findIndex } from 'lodash';
import assign from 'object-assign';
import { Glyphicon } from 'react-bootstrap';
import Spinner from 'react-spinkit';

import Loader from '../../misc/Loader';
import Dialog from '../../misc/Dialog';
import Portal from '../../misc/Portal';
import Message from '../../I18N/Message';
import EmptyView from '../../misc/EmptyView';
import DownloadOptions from './DownloadOptions';
import Button from '../../misc/Button';
import {getAttributesList} from "../../../utils/FeatureGridUtils";

/**
 * @prop {Array<{
 *   name: string,               // MIME type of the format (e.g., 'application/json')
 *   label: string,              // Human-readable label shown in the UI (e.g., 'GeoJSON')
 *   type: 'vector' | 'raster',  // Type of data format, used to filter or group options
 *   validServices: string[]     // List of services this format is valid for (e.g., ['wps', 'wfs'])
 * }>} formats -
 * List of available export formats. Each format defines the MIME type, display label,
 * type of data (vector or raster), and the services (e.g., WPS, WFS) that support it.
 * ABOUT MIME TYPES: 'application/wfs-collection-1.0' AND 'application/wfs-collection-1.1'

    There is no direct 1:1 mapping, but if you want to export the same feature content using GML, the equivalent output formats would be:

    JSON Format	GML Equivalent MIME Type	Notes
    wfs-collection-1.0	text/xml; subtype=gml/2.1.2	Similar to WFS 1.0 with GML 2
    wfs-collection-1.1	text/xml; subtype=gml/3.1.1	Similar to WFS 1.1 with GML 3.1

    refer: https://docs.geoserver.org/main/en/user/services/wfs/outputformats.html
 */
class DownloadDialog extends React.Component {
    static propTypes = {
        filterObj: PropTypes.object,
        closeGlyph: PropTypes.string,
        url: PropTypes.string,
        wpsAvailable: PropTypes.bool,
        service: PropTypes.string,
        defaultSelectedService: PropTypes.string,
        enabled: PropTypes.bool,
        loading: PropTypes.bool,
        checkingWPSAvailability: PropTypes.bool,
        onClose: PropTypes.func,
        onExport: PropTypes.func,
        onCheckWPSAvailability: PropTypes.func,
        setService: PropTypes.func,
        onDownloadOptionChange: PropTypes.func,
        onClearDownloadOptions: PropTypes.func,
        onFormatOptionsFetch: PropTypes.func,
        downloadOptions: PropTypes.object,
        wfsFormats: PropTypes.array,
        formats: PropTypes.array,
        srsList: PropTypes.array,
        defaultSrs: PropTypes.string,
        layer: PropTypes.object,
        formatsLoading: PropTypes.bool,
        virtualScroll: PropTypes.bool,
        customAttributeSettings: PropTypes.object,
        attributes: PropTypes.array,
        hideServiceSelector: PropTypes.bool
    };

    static defaultProps = {
        onExport: () => {},
        onClose: () => {},
        onCheckWPSAvailability: () => {},
        setService: () => {},
        onDownloadOptionChange: () => {},
        onClearDownloadOptions: () => {},
        onFormatOptionsFetch: () => {},
        checkingWPSAvailability: false,
        layer: {},
        closeGlyph: "1-close",
        wpsAvailable: false,
        service: 'wfs',
        defaultSelectedService: 'wps',
        wfsFormats: [],
        formats: [
            {name: 'image/tiff', label: 'TIFF', type: 'raster', validServices: ['wps']},
            {name: 'application/arcgrid', label: 'ArcGrid', type: 'raster', validServices: ['wps']},
            {name: 'application/json', label: 'GeoJSON', type: 'vector', validServices: ['wps']},
            {name: 'application/zip', label: 'Shapefile', type: 'vector', validServices: ['wps']},
            {name: 'text/csv', label: 'CSV', type: 'vector', validServices: ['wps']},
            {name: 'application/wfs-collection-1.0', label: 'GML2', type: 'vector', validServices: ['wps']},
            {name: 'application/wfs-collection-1.1', label: 'GML3', type: 'vector', validServices: ['wps']}
        ],
        formatsLoading: false,
        srsList: [
            {name: "native", label: "Native"},
            {name: "EPSG:4326", label: "WGS84"}
        ],
        virtualScroll: true,
        downloadOptions: {},
        hideServiceSelector: false
    };

    componentDidUpdate(oldProps) {
        if (this.props.enabled !== oldProps.enabled && this.props.enabled) {
            this.props.onClearDownloadOptions();
            if (this.props.layer.type === 'wms') {
                this.props.onCheckWPSAvailability(
                    this.props.url || this.props.layer.url,
                    this.props.defaultSelectedService
                );
            }
        }
    }

    onClose = () => {
        this.props.onClose();
    };

    renderIcon = () => {
        return this.props.loading ? <div style={{"float": "left"}}><Spinner spinnerName="circle" noFadeIn/></div> : <Glyphicon glyph="download" />;
    };

    render() {
        const findValidFormats  = fmt => this.props.formats.filter(({validServices, type = 'vector'}) =>
            (!validServices || findIndex(validServices, x => x === fmt) > -1) &&
            (type === 'vector' && this.props.layer.search?.url || type === 'raster' && !this.props.layer.search?.url));
        const validWFSFormats = findValidFormats('wfs');
        const validWPSFormats = findValidFormats('wps');
        const wfsFormats = validWFSFormats.length > 0 ?
            validWFSFormats.filter(f => this.props.wfsFormats.find(wfsF => wfsF.name.toLowerCase() === f.name.toLowerCase())) :
            this.props.wfsFormats;
        const wfsAvailable = Boolean(this.props.layer.search?.url);
        const formats = this.props.service === 'wfs' ? wfsFormats : validWPSFormats;

        return this.props.enabled ? (<Portal><Dialog id="mapstore-export" draggable={false} modal>
            <span role="header">
                <span className="modal-title  about-panel-title"><Message msgId="layerdownload.title" /></span>
                <button onClick={this.onClose} className="settings-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button>
            </span>
            <div role="body">
                {this.props.checkingWPSAvailability ?
                    <Loader size={100} style={{margin: '0 auto'}}/> :
                    !this.props.wpsAvailable && !wfsAvailable ?
                        <EmptyView title={<Message msgId="layerdownload.noSupportedServiceFound"/>}/> :
                        <DownloadOptions
                            wpsAvailable={this.props.wpsAvailable}
                            wfsAvailable={wfsAvailable}
                            service={this.props.service}
                            downloadOptions={this.props.downloadOptions}
                            setService={this.props.setService}
                            onChange={this.props.onDownloadOptionChange}
                            formatOptionsFetch={this.props.service === 'wfs' ? this.props.onFormatOptionsFetch : () => {}}
                            formatsLoading={this.props.formatsLoading}
                            formats={formats}
                            srsList={this.props.srsList}
                            defaultSrs={this.props.defaultSrs}
                            wpsAdvancedOptionsVisible={!this.props.layer.search?.url}
                            downloadFilteredVisible={!!this.props.layer.search?.url}
                            layer={this.props.layer}
                            virtualScroll={this.props.virtualScroll}
                            customAttributesSettings={this.props.customAttributeSettings}
                            attributes={this.props.attributes}
                            hideServiceSelector={this.props.hideServiceSelector}
                        />}
            </div>
            {!this.props.checkingWPSAvailability && <div role="footer">
                <Button
                    bsStyle="primary"
                    className="download-button"
                    disabled={this.props.loading || this.props.formats.length === 0}
                    onClick={this.handleExport}>
                    {this.renderIcon()} <Message msgId="layerdownload.export" />
                </Button>
            </div>}
        </Dialog></Portal>) : null;
    }
    handleExport = () => {
        const {url, filterObj, downloadOptions, defaultSrs, srsList, onExport, layer, attributes, customAttributeSettings} = this.props;
        const selectedSrs = downloadOptions && downloadOptions.selectedSrs || defaultSrs || (srsList[0] || {}).name;
        const propertyName = getAttributesList(attributes, customAttributeSettings);
        onExport(url || layer.url, filterObj, assign({}, downloadOptions, {selectedSrs}, {propertyName}));
    }
}

export default DownloadDialog;
