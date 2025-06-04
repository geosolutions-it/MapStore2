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
import { Checkbox } from 'react-bootstrap';
import { get, head, isObject, isEmpty, isEqual} from 'lodash';
import InfoPopover from '../../widgets/widget/InfoPopover';

import Message from '../../I18N/Message';
import DownloadWPSOptions from './DownloadWPSOptions';

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
        wpsAvailable: PropTypes.bool,
        wfsAvailable: PropTypes.bool,
        service: PropTypes.string,
        downloadOptions: PropTypes.object,
        formatOptionsFetch: PropTypes.func,
        formats: PropTypes.array,
        srsList: PropTypes.array,
        onSetService: PropTypes.func,
        onChange: PropTypes.func,
        onClearDownloadOptions: PropTypes.func,
        defaultSrs: PropTypes.string,
        wpsOptionsVisible: PropTypes.bool,
        wpsAdvancedOptionsVisible: PropTypes.bool,
        downloadFilteredVisible: PropTypes.bool,
        layer: PropTypes.object,
        formatsLoading: PropTypes.bool,
        virtualScroll: PropTypes.bool,
        services: PropTypes.arrayOf(PropTypes.object),
        hideServiceSelector: PropTypes.bool
    };

    static defaultProps = {
        wpsAvailable: false,
        wfsAvailable: true,
        service: 'wps',
        downloadOptions: {},
        onChange: () => {},
        onClearDownloadOptions: ()=> {},
        formatsLoading: false,
        formats: [],
        srsList: [],
        wpsOptionsVisible: false,
        wpsAdvancedOptionsVisible: false,
        downloadFilteredVisible: false,
        virtualScroll: true,
        services: [
            { value: "wps", label: <Message msgId="layerdownload.services.wps.title" /> },
            { value: "wfs", label: <Message msgId="layerdownload.services.wfs.title" /> }
        ],
        hideServiceSelector: false
    };

    constructor(props) {
        super(props);
    }

    componentDidMount = () => {
        this.props.onClearDownloadOptions();
        const format = get(this.props, "downloadOptions.selectedFormat") || head(this.props.formats);
        const srs = get(this.props, "downloadOptions.selectedSrs") || get(this.props, "defaultSrs") || get(head(this.props.srsList), "name");
        const filter = get(this.props, "layer.layerFilter");
        const filtered = isObject(filter) && !isEmpty(filter);
        this.props.onChange("selectedFormat", format);
        this.props.onChange("selectedSrs", srs);
        this.props.onChange("downloadFilteredDataSet", filtered);
    };

    componentWillReceiveProps = (newProps) => {
        if ( !isEqual( this.props.formats, newProps.formats) ) {
            // this.props.onClearDownloadOptions();
            const format = get(newProps, "downloadOptions.selectedFormat") || head(newProps.formats);
            newProps.onChange("selectedFormat", format);
        }
        if ( !isEqual( this.props.srsList, newProps.srsList) ) {
            // this.props.onClearDownloadOptions();
            const srs = get(newProps, "downloadOptions.selectedSrs") || get(newProps, "defaultSrs") || get(head(newProps.srsList), "name");
            newProps.onChange("selectedSrs", srs);
        }
    }

    compocomponentWillUnmount = () => {
        this.props.onClearDownloadOptions();
    }

    render() {

        const rasterOptionsVisibile = this.props.formats.some(item => item.type === 'raster');

        return (<form>
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
                cropDataSetVisible
                advancedOptionsVisible
                wpsOptionsVisible={this.props.service === 'wps'}
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
