const PropTypes = require('prop-types');
const React = require('react');
const {Button, Glyphicon} = require('react-bootstrap');
const Spinner = require('react-spinkit');

const Dialog = require('../../misc/Dialog');
const Message = require('../../I18N/Message');
const DownloadOptions = require('./DownloadOptions');

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
        downloadOptions: PropTypes.object,
        formats: PropTypes.array
    };

    static defaultProps = {
        onMount: () => {},
        onUnmount: () => {},
        onExport: () => {},
        onClose: () => {},
        onDownloadOptionChange: () => {},
        closeGlyph: "1-close",
        formats: [
            {name: "csv", label: "csv"},
            {name: "shape-zip", label: "shape-zip"}
        ]
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
                    className="download-button"
                    disabled={!this.props.downloadOptions.selectedFormat || this.props.loading}
                    onClick={() => this.props.onExport(this.props.url, this.props.filterObj, this.props.downloadOptions)}>
                     {this.renderIcon()} <Message msgId="wfsdownload.export" />
                </Button>
            </div>
        </Dialog>);
    }
}

module.exports = DownloadDialog;
