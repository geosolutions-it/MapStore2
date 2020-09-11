const PropTypes = require('prop-types');
const React = require('react');
const {Button, Glyphicon} = require('react-bootstrap');
const Spinner = require('react-spinkit');

const Dialog = require('../../misc/Dialog');
const Message = require('../../I18N/Message');
const DownloadOptions = require('./DownloadOptions');
const assign = require('object-assign');

class DownloadDialog extends React.Component {
    static propTypes = {
        filterObj: PropTypes.object,
        closeGlyph: PropTypes.string,
        url: PropTypes.string,
        onMount: PropTypes.func,
        onUnmount: PropTypes.func,
        enabled: PropTypes.bool,
        loading: PropTypes.bool,
        onClose: PropTypes.func,
        onExport: PropTypes.func,
        onDownloadOptionChange: PropTypes.func,
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
        onDownloadOptionChange: () => {},
        onFormatOptionsFetch: () => {},
        layer: {},
        closeGlyph: "1-close",
        wfsFormats: [],
        formats: [],
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

    onClose = () => {
        this.props.onClose();
    };

    renderIcon = () => {
        return this.props.loading ? <div style={{"float": "left"}}><Spinner spinnerName="circle" noFadeIn/></div> : <Glyphicon glyph="download" />;
    };

    render() {
        return (<Dialog id="mapstore-export" style={{display: this.props.enabled ? "block" : "none"}} draggable={false} modal>
            <span role="header">
                <span className="about-panel-title"><Message msgId="wfsdownload.title" /></span>
                <button onClick={this.props.onClose} className="settings-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button>
            </span>
            <div role="body">
                <DownloadOptions
                    downloadOptions={this.props.downloadOptions}
                    onChange={this.props.onDownloadOptionChange}
                    formatOptionsFetch={this.props.onFormatOptionsFetch}
                    formatsLoading={this.props.formatsLoading}
                    wfsFormats={this.props.wfsFormats}
                    formats={this.props.formats}
                    srsList={this.props.srsList}
                    defaultSrs={this.props.defaultSrs}
                    layer={this.props.layer}
                    virtualScroll={this.props.virtualScroll}/>
            </div>
            <div role="footer">
                <Button
                    bsStyle="primary"
                    className="download-button"
                    disabled={!this.props.downloadOptions.selectedFormat || this.props.loading}
                    onClick={this.handleExport}>
                    {this.renderIcon()} <Message msgId="wfsdownload.export" />
                </Button>
            </div>
        </Dialog>);
    }
    handleExport = () => {
        const {url, filterObj, downloadOptions, defaultSrs, srsList, onExport} = this.props;
        const selectedSrs = downloadOptions && downloadOptions.selectedSrs || defaultSrs || (srsList[0] || {}).name;
        onExport(url, filterObj, assign({}, downloadOptions, {selectedSrs}));
    }
}

module.exports = DownloadDialog;
