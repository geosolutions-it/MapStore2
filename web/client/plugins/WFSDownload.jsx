/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {Button, Glyphicon} = require('react-bootstrap');
const Spinner = require('react-spinkit');

const {downloadFeatures, onDownloadOptionChange} = require('../actions/wfsdownload');
const {toggleControl, setControlProperty} = require('../actions/controls');

const {createSelector} = require('reselect');
const {wfsURL, wfsFilter} = require('../selectors/query');

const Dialog = require('../components/misc/Dialog');
const Message = require('../components/I18N/Message');
const DownloadOptions = require('../components/data/download/DownloadOptions');
/**
 * Provides advanced export functionalities using WFS.
 * @memberof plugins
 * @class
 * @prop {object[]} formats An array of name-label objects for the allowed formats avaliable.
 * @prop {string} closeGlyph The icon to use for close the dialog
 * @example
 * {
 *  "name": "WFSDownload",
 *  "cfg": {
 *    "formats": [
 *            {"name": "csv", "label": "csv"},
 *            {"name": "shape-zip", "label": "shape-zip"},
 *            {"name": "excel", "label": "excel"},
 *            {"name": "excel2007", "label": "excel2007"},
 *            {"name": "dxf-zip", "label": "dxf-zip"}
 *    ]
 *  }
 * }
 */
const WFSDownload = React.createClass({
    propTypes: {
        filterObj: React.PropTypes.object,
        closeGlyph: React.PropTypes.string,
        url: React.PropTypes.string,
        onMount: React.PropTypes.func,
        onUnmount: React.PropTypes.func,
        enabled: React.PropTypes.bool,
        loading: React.PropTypes.bool,
        onClose: React.PropTypes.func,
        onExport: React.PropTypes.func,
        onDownloadOptionChange: React.PropTypes.func,
        downloadOptions: React.PropTypes.object,
        formats: React.PropTypes.array
    },
    getDefaultProps() {
        return {
            onExport: () => {},
            onClose: () => {},
            onDownloadOptionChange: () => {},
            closeGlyph: "1-close",
            formats: [
                {name: "csv", label: "csv"},
                {name: "shape-zip", label: "shape-zip"}
            ]
        };
    },
    componentDidMount() {
        this.props.onMount();
    },
    componentWillUnmount() {
        this.props.onUnmount();
    },
    onClose() {
        this.props.onClose();
    },
    renderIcon() {
        return this.props.loading ? <div style={{"float": "left"}}><Spinner spinnerName="circle" noFadeIn/></div> : <Glyphicon glyph="download" />;
    },
    render() {
        return (<Dialog id="mapstore-export" style={{display: this.props.enabled ? "block" : "none"}}>
            <span role="header">
                <span className="about-panel-title"><Message msgId="wfsdownload.title" /></span>
                <button onClick={this.props.onClose} className="settings-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button>
                </span>
            <div role="body">
                <DownloadOptions
                    downloadOptions={this.props.downloadOptions}
                    onChange={this.props.onDownloadOptionChange}
                    formats={this.props.formats}/>
                </div>
            <div role="footer">
                <Button
                    bsStyle="primary"
                    disabled={!this.props.downloadOptions.selectedFormat || this.props.loading}
                    onClick={() => this.props.onExport(this.props.url, this.props.filterObj, this.props.downloadOptions)}>
                     {this.renderIcon()} <Message msgId="wfsdownload.export" />
                </Button>
            </div>
        </Dialog>);
    }
});

module.exports = {
    WFSDownloadPlugin: connect(createSelector(
            wfsURL,
            wfsFilter,
            state => state && state.controls && state.controls.wfsdownload && state.controls.wfsdownload.enabled,
            state => state && state.wfsdownload && state.wfsdownload.downloadOptions,
            state => state && state.wfsdownload && state.wfsdownload.loading,
            (url, filterObj, enabled, downloadOptions, loading) => ({
                url,
                filterObj,
                enabled,
                downloadOptions,
                loading
            })
    ), {
        onExport: downloadFeatures,
        onDownloadOptionChange,
        onMount: () => setControlProperty("wfsdownload", "avaliable", true),
        onUnmount: () => setControlProperty("wfsdownload", "avaliable", false),
        onClose: () => toggleControl("wfsdownload")
    }
    )(WFSDownload),
    epics: require('../epics/wfsdownload'),
    reducers: {
        wfsdownload: require('../reducers/wfsdownload')
    }
};
