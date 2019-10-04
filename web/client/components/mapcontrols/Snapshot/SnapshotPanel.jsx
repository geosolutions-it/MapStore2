const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Button, Col, Grid, Row, Image, Glyphicon, Table, Panel, Alert} = require('react-bootstrap');
const {DateFormat} = require('../../I18N/I18N');
require("./css/snapshot.css");

const ConfigUtils = require('../../../utils/ConfigUtils');
const shotingImg = require('./shoting.gif');
const notAvailable = require('./not-available.png');
const {isEqual} = require('lodash');
let SnapshotSupport;
const BasicSpinner = require('../../misc/spinners/BasicSpinner/BasicSpinner');
const Dialog = require('../../misc/Dialog');

const Message = require('../../I18N/Message');
const Portal = require('../../misc/Portal');

/**
 * SnapshotPanel allow to export a snapshot of the current map, showing a
 * preview of the snapshot, with some info about the map.
 * It prevent the user to Export snapshot with Google or Bing backgrounds.
 * It shows also the status of the current snapshot generation queue.
 */
class SnapshotPanel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        name: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        saveBtnText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        map: ConfigUtils.PropTypes.config,
        layers: PropTypes.array,
        img: PropTypes.object,
        snapshot: PropTypes.object,
        active: PropTypes.bool,
        status: PropTypes.string,
        browser: PropTypes.object,
        onStatusChange: PropTypes.func,
        onCreateSnapshot: PropTypes.func,
        downloadImg: PropTypes.func,
        serviceBoxUrl: PropTypes.string,
        dateFormat: PropTypes.object,
        googleBingErrorMsg: PropTypes.node,
        downloadingMsg: PropTypes.node,
        timeout: PropTypes.number,
        mapType: PropTypes.string,
        wrap: PropTypes.bool,
        wrapWithPanel: PropTypes.bool,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        toggleControl: PropTypes.func,
        style: PropTypes.object,
        closeGlyph: PropTypes.string,
        buttonStyle: PropTypes.string
    };

    static defaultProps = {
        id: "snapshot_panel",
        layers: [],
        snapshot: { state: "DISABLED", img: {}},
        browser: {},
        icon: <Glyphicon glyph="camera"/>,
        onStatusChange: () => {},
        onCreateSnapshot: () => {},
        toggleControl: () => {},
        downloadImg: () => {},
        saveBtnText: "snapshot.save",
        serviceBoxUrl: null,
        dateFormat: {day: "numeric", month: "long", year: "numeric"},
        googleBingErrorMsg: "snapshot.googleBingError",
        downloadingMsg: "snapshot.downloadingSnapshots",
        timeout: 1000,
        mapType: 'leaflet',
        wrap: false,
        wrapWithPanel: false,
        panelStyle: {
            minWidth: "720px",
            zIndex: 100,
            position: "absolute",
            overflow: "auto",
            top: "60px",
            right: "100px"
        },
        panelClassName: "snapshot-panel",
        closeGlyph: "1-close",
        buttonStyle: "primary",
        bounds: '#container'
    };

    UNSAFE_componentWillMount() {
        SnapshotSupport = require('./SnapshotSupport')(this.props.mapType);
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.mapType !== this.props.mapType) {
            SnapshotSupport = require('./SnapshotSupport')(newProps.mapType);
        }
    }

    shouldComponentUpdate(nextProps) {
        return !isEqual(nextProps.layers, this.props.layers) || nextProps.active !== this.props.active || nextProps.map !== this.props.map || this.props.snapshot !== nextProps.snapshot;
    }

    renderLayers = () => {
        let items = this.props.layers.map((layer, i) => {
            if (layer.visibility) {
                return <li key={i}>{layer.title}</li>;
            }
            return null;
        });
        return items;
    };

    renderButton = (enabled) => {
        return (<Button bsStyle={this.props.buttonStyle} bsSize="xs" disabled={!enabled}
            onClick={this.onClick}>
            <Glyphicon glyph="floppy-save" disabled={{}}/>&nbsp;<Message msgId={this.props.saveBtnText}/>
        </Button>);
    };

    renderError = () => {
        if (this.props.snapshot.error) {
            return (<Row className="text-center" style={{marginTop: "5px"}}>
                <h4><span className="label label-danger"> {this.props.snapshot.error}
                </span></h4></Row>);
        } else if (this.isBingOrGoogle()) {
            return (<Row className="text-center" style={{marginTop: "5px"}}>
                <h4><span className="label label-danger">{this.getgoogleBingError()}
                </span></h4></Row>);
        }
        return null;
    };

    mapIsLoading = (layers) => {
        return layers.some((layer) => layer.loading);
    };

    renderPreview = () => {

        if (!SnapshotSupport.Preview) {
            return <div className="snapshot-notsupported"><Message msgId="snapshot.notsupported"/></div>;
        }

        let bingOrGoogle = this.isBingOrGoogle();
        let snapshotReady = this.isSnapshotReady();
        let replaceImage;
        if (!bingOrGoogle) {
            replaceImage = shotingImg;
        } else {
            replaceImage = notAvailable;
        }

        return [
            <div style={{display: snapshotReady && !bingOrGoogle ? "block" : "none" }} key="snapshotPreviewContainer">
                { !bingOrGoogle ? <SnapshotSupport.Preview
                    ref="snapshotPreview"
                    timeout={this.props.timeout}
                    config={this.props.map}
                    layers={this.props.layers.filter((l) => {return l.visibility; })}
                    snapstate={this.props.snapshot}
                    onStatusChange={this.props.onStatusChange}
                    active={this.props.active && !bingOrGoogle}
                    allowTaint
                    drawCanvas={snapshotReady && !bingOrGoogle}
                    browser={this.props.browser}/> : null}
            </div>,
            <Image key="snapshotLoader" src={replaceImage} style={{margin: "0 auto", display: snapshotReady && !bingOrGoogle ? "none" : "block" }} responsive/>
        ];
    };

    renderSize = () => {
        const size = this.props.map && this.props.map.size || {width: 100, height: 100};
        return size.width + " X " + size.height;
    };

    renderSnapshotQueue = () => {
        if (this.props.snapshot.queue && this.props.snapshot.queue.length > 0) {
            return <div key="counter" style={{margin: "20px"}}>{this.renderDownloadMessage()}<BasicSpinner value={this.props.snapshot.queue.length} /> </div>;
        }
        return null;
    };

    renderDownloadMessage = () => {
        return <Message msgId={this.props.downloadingMsg}/>;
    };

    wrap = (panel) => {
        if (this.props.wrap) {
            if (this.props.wrapWithPanel) {
                return (<Panel id={this.props.id} header={<span><span className="snapshot-panel-title"><Message msgId="snapshot.title"/></span><span className="settings-panel-close panel-close" onClick={this.props.toggleControl}></span></span>} style={this.props.panelStyle} className={this.props.panelClassName}>
                    {panel}
                </Panel>);
            }
            return (
                <Portal>
                    <Dialog id="mapstore-snapshot-panel" style={this.props.panelStyle} bounds={this.props.bounds}>
                        <span role="header"><span className="snapshot-panel-title"><Message msgId="snapshot.title"/></span><button onClick={this.props.toggleControl} className="print-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button></span>
                        {panel}
                    </Dialog>
                </Portal>
            );
        }
        return panel;
    };

    renderTaintedMessage = () => {
        if (this.props.snapshot && this.props.snapshot && this.props.snapshot.tainted) {
            return <Alert bsStyle="warning"><Message msgId="snapshot.taintedMessage" /></Alert>;
        }
        return null;
    };

    render() {
        let bingOrGoogle = this.isBingOrGoogle();
        let snapshotReady = this.isSnapshotReady();
        return this.props.active ? this.wrap(
            <Grid role="body" className="snapshot-panel" fluid>
                <Row key="main">
                    <Col key="previewCol" xs={7} sm={7} md={7}>{this.renderPreview()}</Col>
                    <Col key="dataCol" xs={5} sm={5} md={5}>
                        <Table responsive>
                            <tbody>
                                <tr>
                                    <td><Message msgId="snapshot.date"/></td><td> <DateFormat dateParams={this.props.dateFormat}/></td>
                                </tr>
                                <tr><td><Message msgId="snapshot.layers"/></td><td><ul>{this.renderLayers()}</ul></td></tr>
                                <tr><td><Message msgId="snapshot.size"/></td><td>{this.renderSize()}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                {this.renderError()}

                <Row key="buttons" htopclassName="pull-right" style={{marginTop: "5px"}}>
                    { this.renderButton(!bingOrGoogle && snapshotReady)}
                    { this.renderTaintedMessage()}
                    {this.renderSnapshotQueue()}
                </Row>

            </Grid>
        ) : null;
    }

    onClick = () => {
        if (this.refs.snapshotPreview.isTainted()) {
            this.createSnapshot();
        } else {
            let dataURL = this.refs.snapshotPreview.exportImage();
            this.props.downloadImg(dataURL);
        }
    };

    createSnapshot = () => {
        this.props.onCreateSnapshot({
            key: new Date().getTime(), // create a unique key for this snapshot
            config: this.props.map,
            layers: this.props.layers.filter((l) => {return l.visibility; }),
            snapstate: this.props.snapshot,
            active: this.props.active,
            allowTaint: false,
            drawCanvas: true,
            browser: this.props.browser
        });
    };

    isBingOrGoogle = () => {
        return this.props.layers.some((layer) => {
            return layer.type === 'google' && layer.visibility || layer.type === 'bing' && layer.visibility;
        });
    };

    getgoogleBingError = () => {
        return <Message msgId={this.props.googleBingErrorMsg}/>;
    };

    isSnapshotReady = () => {
        return this.props.snapshot.state === "READY" && !this.mapIsLoading(this.props.layers) && this.props.map && this.props.map.size;
    };
}

module.exports = SnapshotPanel;
