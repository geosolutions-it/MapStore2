/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { Checkbox, Glyphicon } from 'react-bootstrap';
import { get, head, isObject, isEmpty, isEqual} from 'lodash';
import InfoPopover from '../../widgets/widget/InfoPopover';

import Message from '../../I18N/Message';
import DownloadWPSOptions from './DownloadWPSOptions';
import { NETCDF_FORMAT } from '../../../utils/FileFormatUtils';
import { fetchTimeAttributes } from '../../../utils/LayerDownloadUtils';

/**
 * Download Options Form. Shows a selector of the options to perform a WFS download
 * @memberof components.data.download
 * @name DownloadOptions
 * @class
 * @prop {object} downloadOptions the options to set. e.g. `{singlePage: true|false, selectedFormat: "csv"}`
 * @prop {array} formats the selectable format options.
 * @prop {function} onChange the function to trigger when some option changes
 */
class DownloadOptions extends React.Component {
    static propTypes = {
        cropDataSetVisible: PropTypes.bool,
        defaultSelectedService: PropTypes.bool,
        defaultSrs: PropTypes.string,
        downloadFilteredVisible: PropTypes.bool,
        downloadOptions: PropTypes.object,
        formatOptionsFetch: PropTypes.func,
        formats: PropTypes.array,
        formatsLoading: PropTypes.bool,
        filterObj: PropTypes.object,
        hideServiceSelector: PropTypes.bool,
        layer: PropTypes.object,
        onChange: PropTypes.func,
        onClearDownloadOptions: PropTypes.func,
        onSetService: PropTypes.func,
        service: PropTypes.string,
        services: PropTypes.arrayOf(PropTypes.object),
        srsList: PropTypes.array,
        virtualScroll: PropTypes.bool,
        wfsAvailable: PropTypes.bool,
        wpsAdvancedOptionsVisible: PropTypes.bool,
        wpsAvailable: PropTypes.bool,
        wpsOptionsVisible: PropTypes.bool,
        hasTime: PropTypes.bool,
        isRange: PropTypes.bool,
        attributes: PropTypes.array
    };

    static defaultProps = {
        cropDataSetVisible: true,
        wpsAvailable: false,
        wfsAvailable: true,
        downloadOptions: {},
        formats: [],
        onChange: () => {},
        onClearDownloadOptions: ()=> {},
        formatOptionsFetch: ()=> {},
        formatsLoading: false,
        srsList: [],
        wpsOptionsVisible: false,
        wpsAdvancedOptionsVisible: false,
        downloadFilteredVisible: false,
        virtualScroll: true,
        services: [
            { value: "wps", label: <Message msgId="layerdownload.services.wps.title" /> },
            { value: "wfs", label: <Message msgId="layerdownload.services.wfs.title" /> }
        ],
        hideServiceSelector: false,
        hasTime: false,
        isRange: false,
        attributes: []
    };

    constructor(props) {
        super(props);
        this.state = {
            timeAttributes: []
        };
    }

    fetchTimeAttributes = (layer, hasTime, attributes) => {
        const layerId = layer?.id;
        this._fetchLayer = layerId;
        if (hasTime) {
            fetchTimeAttributes(layer, { attributes })
                .then(attrs => {
                    if (this._isMounted && this._fetchLayer === layerId) {
                        const timeAttributes = attrs || [];
                        this.setState({ timeAttributes });
                        if (timeAttributes.length === 1) {
                            this.props.onChange("timeAttribute", timeAttributes[0]);
                        } else if (timeAttributes.length > 1) {
                            const currentAttr = this.props.downloadOptions?.timeAttribute;
                            const selected = timeAttributes.includes(currentAttr) ? currentAttr : timeAttributes[0];
                            this.props.onChange("timeAttribute", selected);
                        }
                    }
                });
        } else if (this._fetchLayer === layerId) {
            this.setState({ timeAttributes: [] });
        }
    };

    componentDidMount = () => {
        this._isMounted = true;
        this.props.onClearDownloadOptions(this.props.service || this.props.defaultSelectedService);
        const currentFormat = get(this.props, "downloadOptions.selectedFormat");
        const isValidFormat = this.props.formats.some(f => f.name === currentFormat);
        const format = (isValidFormat ? currentFormat : null) || get(head(this.props.formats), "name");
        const srs = get(this.props, "downloadOptions.selectedSrs") || get(this.props, "defaultSrs") || get(head(this.props.srsList), "name");
        const filter = get(this.props, "layer.layerFilter"); // This will miss the widget filter
        const filtered = isObject(filter) && !isEmpty(filter) || this.props.filterObj;
        this.props.onChange("selectedFormat", format);
        this.props.onChange("selectedSrs", srs);
        this.props.onChange("downloadFilteredDataSet", filtered);
        this.props.formatOptionsFetch(this.props.layer);
        this.fetchTimeAttributes(this.props.layer, this.props.hasTime, this.props.attributes);
    };

    UNSAFE_componentWillReceiveProps = (newProps) => {
        if ( !isEqual( this.props.formats, newProps.formats)) {
            const currentFormat = get(newProps, "downloadOptions.selectedFormat");
            const isValidFormat = newProps.formats.some(f => f.name === currentFormat);
            const format = (isValidFormat ? currentFormat : null) || get(head(newProps.formats), "name");
            if (format !== currentFormat) {
                newProps.onChange("selectedFormat", format);
            }
        }
        if ( !isEqual( this.props.service, newProps.service) ) {
            newProps.formatOptionsFetch(newProps.layer);
        }
        if (!isEqual(this.props.layer, newProps.layer) || this.props.hasTime !== newProps.hasTime || !isEqual(this.props.attributes, newProps.attributes)) {
            const filter = get(newProps, "layer.layerFilter");
            const filtered = isObject(filter) && !isEmpty(filter) || newProps.filterObj;
            newProps.onChange("downloadFilteredDataSet", filtered);
            this.fetchTimeAttributes(newProps.layer, newProps.hasTime, newProps.attributes);
        }
        if ( !isEqual( this.props.srsList, newProps.srsList) ) {
            const srs = get(newProps, "downloadOptions.selectedSrs") || get(newProps, "defaultSrs") || get(head(newProps.srsList), "name");
            newProps.onChange("selectedSrs", srs);
        }
    }

    componentWillUnmount = () => {
        this._isMounted = false;
        this.props.onClearDownloadOptions(this.props.defaultSelectedService);
    }

    render() {
        const selectedFormat = this.props.downloadOptions?.selectedFormat;
        const rasterOptionsVisibile = selectedFormat !== NETCDF_FORMAT && this.props.formats.some(item => item.type === 'raster');
        const timeAttributes = this.state.timeAttributes || [];
        const showTimeAttributes = timeAttributes.length > 1;

        return (<form>
            {!isEmpty(timeAttributes) && <div className="mapstore-downloadoptions alert alert-info">
                <Glyphicon glyph="info-sign" />&nbsp;<Message msgId="layerdownload.visibleGranuleInfo" />
            </div>}
            {!this.props.hideServiceSelector && this.props.wpsAvailable && this.props.wfsAvailable &&

                <div className="mapstore-downloadoptions downloadMode">
                    <label>
                        <Message msgId="layerdownload.downloadMode" />
                    </label>
                    <div className="mapstore-downloadoptions-row">
                        <Select
                            clearable={false}
                            value={this.props.service}
                            onChange={(sel) => this.props.onSetService(sel.value)}
                            options={this.props.services} />
                            &nbsp;<InfoPopover text={<Message msgId={`layerdownload.services.${this.props.service}.tooltip`} />} />
                    </div>
                </div>
            }
            {showTimeAttributes && <div className="mapstore-downloadoptions">
                <label><Message msgId="layerdownload.timeAttribute" /></label>
                <div className="mapstore-downloadoptions-row">
                    <Select
                        clearable={false}
                        value={this.props.downloadOptions?.timeAttribute || this.state.timeAttributes[0]}
                        onChange={(sel) => this.props.onChange("timeAttribute", sel.value)}
                        options={this.state.timeAttributes.map(attr => ({value: attr, label: attr}))} />
                        &nbsp;<InfoPopover text={<Message msgId={`layerdownload.timeAttributeInfo`} />} />
                </div>
            </div>}
            <div className="mapstore-downloadoptions">
                <label><Message msgId="layerdownload.format" /></label>
                <Select
                    clearable={false}
                    isLoading={this.props.formatsLoading}
                    onOpen={() => this.props.formatOptionsFetch(this.props.layer)}
                    value={this.props.downloadOptions?.selectedFormat}
                    noResultsText={<Message msgId="layerdownload.format" />}
                    onChange={(sel) => this.props.onChange("selectedFormat", sel.value)}
                    options={this.props.formats.map(f => ({value: f.name, label: f.label || f.name}))} />
            </div>

            <DownloadWPSOptions
                srsList={this.props.srsList}
                selectedSrs={this.props.downloadOptions?.selectedSrs}
                cropDataSetVisible={this.props.cropDataSetVisible}
                advancedOptionsVisible
                wpsOptionsVisible
                rasterOptionsVisibile={rasterOptionsVisibile}
                downloadFilteredVisible={this.props.downloadFilteredVisible}
                downloadFilteredEnabled={this.props.downloadOptions.downloadFilteredDataSet}
                cropDataSetEnabled={this.props.downloadOptions.cropDataSet}
                selectedCompression={this.props.downloadOptions.compression}
                quality={this.props.downloadOptions.quality}
                tileWidth={this.props.downloadOptions.tileWidth}
                tileHeight={this.props.downloadOptions.tileHeight}
                onChange={this.props.onChange}/>
            {/* TODO for the future remove the virtualScroll prop since is no longer used*/}
            {this.props.virtualScroll ? null : <Checkbox checked={this.props.downloadOptions.singlePage} onChange={() => this.props.onChange("singlePage", !this.props.downloadOptions.singlePage ) }>
                <Message msgId="layerdownload.downloadonlycurrentpage" />
            </Checkbox>}
        </form>);
    }
}

export default DownloadOptions;
