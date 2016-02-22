/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {Button, Col, Grid, Row, Image, Glyphicon, Table} = require('react-bootstrap');
var {DateFormat} = require('../I18N/I18N');
require("./style.css");
const configUtils = require('../../utils/ConfigUtils');
const shotingImg = require('./shoting.gif');
const {isEqual} = require('lodash');
const LocaleUtils = require('../../utils/LocaleUtils');

let SnapshotPanel = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        name: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        saveBtnText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        layers: React.PropTypes.array,
        img: React.PropTypes.object,
        snapshot: React.PropTypes.object,
        status: React.PropTypes.string,
        browser: React.PropTypes.object,
        onStatusChange: React.PropTypes.func,
        downloadImg: React.PropTypes.func,
        serviceBoxUrl: React.PropTypes.string,
        dateFormat: React.PropTypes.object,
        googleBingError: React.PropTypes.string,
        googleBingErrorMsgId: React.PropTypes.string
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            id: "snapshot_panel",
            layers: [],
            snapshot: { state: "DISABLED", img: {}},
            browser: {},
            icon: <Glyphicon glyph="camera"/>,
            onStatusChange: () => {},
            downloadImg: () => {},
            saveBtnText: "Save",
            serviceBoxUrl: null,
            dateFormat: {day: "numeric", month: "long", year: "numeric"},
            googleBingErrorMsgId: "snapshot.googleBingError"
        };
    },
    shouldComponentUpdate(nextProps) {
        return (nextProps.status === "DISABLED" || !isEqual(nextProps.snapshot, this.props.snapshot));
    },
    renderLayers() {
        let items = this.props.layers.map((layer, i) => {
            if (layer.visibility) {
                return (<li key={i}>{layer.title}</li>);
            }
        });
        return items;
    },
    localDownload() {
        return (
            <Button bsSize="xs" disabled={(this.props.snapshot.state === "SHOTING" || this.isBingOrGoogle())}
                href={ (this.props.snapshot.img && this.props.snapshot.img.data) ? this.props.snapshot.img.data.replace(/^data:image\/[^;]/, 'data:application/octet-stream') : "" } download="snapshot.png">
                <Glyphicon glyph="floppy-save" />{this.props.saveBtnText}
            </Button>);
    },
    remoteDownload() {
        return (<Button bsSize="xs" disabled={(this.props.snapshot.state === "SHOTING" || this.isBingOrGoogle())}
                onClick={this.onClick}>
                <Glyphicon glyph="floppy-save" />{this.props.saveBtnText}
                </Button>);
    },
    renderError() {
        if (this.props.snapshot.error) {
            return (<Row className="text-center" style={{marginTop: "5px"}}>
                    <h4><span className="label label-danger"> {this.props.snapshot.error}
                    </span></h4></Row>);
        }else if (this.isBingOrGoogle()) {
            return (<Row className="text-center" style={{marginTop: "5px"}}>
                    <h4><span className="label label-danger">{this.getgoogleBingError()}
                    </span></h4></Row>);
        }

    },
    renderPreview() {
        return (this.props.snapshot.state === "READY") ? (<Image src={this.props.snapshot.img.data} responsive thumbnail/>) :
        (<Image src={shotingImg} style={{margin: "0 auto"}}responsive/>);
    },
    renderSize() {
        return (this.props.snapshot && this.props.snapshot.img) ? this.props.snapshot.img.width + "X" + this.props.snapshot.img.height :
        '';
    },
    render() {
        return ( this.props.snapshot.state !== "DISABLED") ? (
            <Grid header={this.props.name} className="snapshot-panel" fluid={true}>
                <Row>
                    <Col xs={7} sm={7} md={7}>{this.renderPreview()}</Col>
                    <Col xs={5} sm={5} md={5}>
                       <Table responsive>
                            <tbody>
                               <tr>
                                <td>Date</td><td> <DateFormat dateParams={this.props.dateFormat}/></td>
                                </tr>
                                <tr><td>Layers</td><td><ul>{this.renderLayers()}</ul></td></tr>
                                <tr><td>Size</td><td>{this.renderSize()}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                {this.renderError()}
                <Row className="pull-right" style={{marginTop: "5px"}}>
                    {(this.props.browser.ie || (this.props.snapshot.img && this.props.snapshot.img.size > 1800 && this.props.browser.chrome)) ? this.remoteDownload() : this.localDownload()}
                </Row>

            </Grid>
        ) : null;
    },
    onClick() {
        this.props.downloadImg(this.props.snapshot.img.data, this.props.serviceBoxUrl || configUtils.getConfigProp("serviceBoxUrl"));
    },
    isBingOrGoogle() {
        return (
            this.props.layers.find((layer) => {
                return (layer.type === 'google' && layer.visibility ) || (layer.type === 'bing' && layer.visibility );
            }) ) ? true : false;
    },
    getgoogleBingError() {
        let error = '';
        if (!this.props.googleBingError && this.context.messages) {
            let googBingError = LocaleUtils.getMessageById(this.context.messages, this.props.googleBingErrorMsgId);
            if (googBingError) {
                error = googBingError;
            }
        } else {
            error = this.props.googleBingError;
        }
        return error;
    }
});

module.exports = SnapshotPanel;
