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
import Message from '../../I18N/Message';
import EmptyView from '../../misc/EmptyView';
import DownloadOptions from './DownloadOptions';
import Button from '../../misc/Button';

class DownloadDialog extends React.Component {
    static propTypes = {
        filterObj: PropTypes.object,
        closeGlyph: PropTypes.string,
        url: PropTypes.string,
        service: PropTypes.string,
        onMount: PropTypes.func,
        onUnmount: PropTypes.func,
        enabled: PropTypes.bool,
        loading: PropTypes.bool,
        checkingWPSAvailability: PropTypes.bool,
        onClose: PropTypes.func,
        onExport: PropTypes.func,
        onCheckWPSAvailability: PropTypes.func,
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
        virtualScroll: PropTypes.bool
    };

    static defaultProps = {
        onMount: () => {},
        onUnmount: () => {},
        onExport: () => {},
        onClose: () => {},
        onCheckWPSAvailability: () => {},
        onDownloadOptionChange: () => {},
        onClearDownloadOptions: () => {},
        onFormatOptionsFetch: () => {},
        checkingWPSAvailability: false,
        layer: {},
        closeGlyph: "1-close",
        service: 'wfs',
        wfsFormats: [],
        formats: [
            {name: 'application/json', label: 'GeoJSON', type: 'vector', validServices: ['wps']},
            {name: 'application/arcgrid', label: 'ArcGrid', type: 'raster', validServices: ['wps']},
            {name: 'image/tiff', label: 'TIFF', type: 'raster', validServices: ['wps']},
            {name: 'image/png', label: 'PNG', type: 'raster', validServices: ['wps']},
            {name: 'image/jpeg', label: 'JPEG', type: 'raster', validServices: ['wps']},
            {name: 'application/wfs-collection-1.0', label: 'wfs-collection-1.0', type: 'vector', validServices: ['wps']},
            {name: 'application/wfs-collection-1.1', label: 'wfs-collection-1.1', type: 'vector', validServices: ['wps']},
            {name: 'application/zip', label: 'Shapefile', type: 'vector', validServices: ['wps']},
            {name: 'text/csv', label: 'CSV', type: 'vector', validServices: ['wps']}
        ],
        formatsLoading: false,
        srsList: [
            {name: "native", label: "Native"},
            {name: "EPSG:4326", label: "WGS84"}
        ],
        virtualScroll: true,
        downloadOptions: {}
    };

    componentDidMount() {
        this.props.onMount();
    }

    componentWillUnmount() {
        this.props.onUnmount();
    }

    componentDidUpdate(oldProps) {
        if (this.props.enabled !== oldProps.enabled && this.props.enabled) {
            this.props.onClearDownloadOptions();
            if (this.props.layer.type === 'wms') {
                this.props.onCheckWPSAvailability(this.props.url || this.props.layer.url);
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

        return this.props.enabled ? (<Dialog id="mapstore-export" draggable={false} modal>
            <span role="header">
                <span className="about-panel-title"><Message msgId="layerdownload.title" /></span>
                <button onClick={this.onClose} className="settings-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button>
            </span>
            <div role="body">
                {this.props.checkingWPSAvailability ?
                    <Loader size={100} style={{margin: '0 auto'}}/> :
                    this.props.service === 'wfs' && !this.props.layer.search?.url ?
                        <EmptyView title={<Message msgId="layerdownload.noSupportedServiceFound"/>}/> :
                        <DownloadOptions
                            downloadOptions={this.props.downloadOptions}
                            onChange={this.props.onDownloadOptionChange}
                            formatOptionsFetch={this.props.service === 'wfs' ? this.props.onFormatOptionsFetch : () => {}}
                            formatsLoading={this.props.formatsLoading}
                            formats={this.props.service === 'wfs' ? wfsFormats : validWPSFormats}
                            srsList={this.props.srsList}
                            defaultSrs={this.props.defaultSrs}
                            wpsOptionsVisible={this.props.service === 'wps'}
                            wpsAdvancedOptionsVisible={!this.props.layer.search?.url}
                            downloadFilteredVisible={!!this.props.layer.search?.url}
                            layer={this.props.layer}
                            virtualScroll={this.props.virtualScroll}/>}
            </div>
            {!this.props.checkingWPSAvailability && <div role="footer">
                <Button
                    bsStyle="primary"
                    className="download-button"
                    disabled={!this.props.downloadOptions.selectedFormat || this.props.loading}
                    onClick={this.handleExport}>
                    {this.renderIcon()} <Message msgId="layerdownload.export" />
                </Button>
            </div>}
        </Dialog>) : null;
    }
    handleExport = () => {
        const {url, filterObj, downloadOptions, defaultSrs, srsList, onExport, layer} = this.props;
        const selectedSrs = downloadOptions && downloadOptions.selectedSrs || defaultSrs || (srsList[0] || {}).name;
        onExport(url || layer.url, filterObj, assign({}, downloadOptions, {selectedSrs}));
    }
}

export default DownloadDialog;
