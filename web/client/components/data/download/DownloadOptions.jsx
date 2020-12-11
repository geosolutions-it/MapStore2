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
import { get, head } from 'lodash';

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
        downloadOptions: PropTypes.object,
        formatOptionsFetch: PropTypes.func,
        formats: PropTypes.array,
        srsList: PropTypes.array,
        onChange: PropTypes.func,
        defaultSrs: PropTypes.string,
        wpsOptionsVisible: PropTypes.bool,
        wpsAdvancedOptionsVisible: PropTypes.bool,
        downloadFilteredVisible: PropTypes.bool,
        layer: PropTypes.object,
        formatsLoading: PropTypes.bool,
        virtualScroll: PropTypes.bool
    };

    static defaultProps = {
        downloadOptions: {},
        formatsLoading: false,
        formats: [],
        srsList: [],
        wpsOptionsVisible: false,
        wpsAdvancedOptionsVisible: false,
        downloadFilteredVisible: false,
        virtualScroll: true
    };

    getSelectedFormat = () => {
        return get(this.props, "downloadOptions.selectedFormat");
    };
    getSelectedSRS = () => {
        return get(this.props, "downloadOptions.selectedSrs") || this.props.defaultSrs || get(head(this.props.srsList), "name");
    };

    render() {
        return (<form>
            <label><Message msgId="layerdownload.format" /></label>
            <Select
                clearable={false}
                isLoading={this.props.formatsLoading}
                onOpen={() => this.props.formatOptionsFetch(this.props.layer)}
                value={this.props.downloadOptions?.selectedFormat}
                noResultsText={<Message msgId="layerdownload.format" />}
                onChange={(sel) => this.props.onChange("selectedFormat", sel.value)}
                options={this.props.formats.map(f => ({value: f.name, label: f.label || f.name}))} />
            <label><Message msgId="layerdownload.srs" /></label>
            <Select
                clearable={false}
                value={this.getSelectedSRS()}
                onChange={(sel) => this.props.onChange("selectedSrs", sel.value)}
                options={this.props.srsList.map(f => ({value: f.name, label: f.label || f.name}))} />
            {this.props.wpsOptionsVisible &&
                <DownloadWPSOptions
                    cropDataSetVisible
                    donwloadFilteredVisible={this.props.downloadFilteredVisible}
                    advancedOptionsVisible={this.props.wpsAdvancedOptionsVisible}
                    cropDataSetEnabled={this.props.downloadOptions.cropDataSet}
                    downloadFilteredEnabled={this.props.downloadOptions.downloadFilteredDataSet}
                    selectedCompression={this.props.downloadOptions.compression}
                    quality={this.props.downloadOptions.quality}
                    tileWidth={this.props.downloadOptions.tileWidth}
                    tileHeight={this.props.downloadOptions.tileHeight}
                    onChange={this.props.onChange}/>}
            {/* TODO for the future remove the virtualScroll prop since is no longer used*/}
            {this.props.virtualScroll ? null : <Checkbox checked={this.props.downloadOptions.singlePage} onChange={() => this.props.onChange("singlePage", !this.props.downloadOptions.singlePage ) }>
                <Message msgId="layerdownload.downloadonlycurrentpage" />
            </Checkbox>}
        </form>);
    }
}

export default DownloadOptions;
