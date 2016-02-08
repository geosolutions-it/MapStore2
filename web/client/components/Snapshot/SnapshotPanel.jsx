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
        dateFormat: React.PropTypes.object
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
            dateFormat: {day: "numeric", month: "long", year: "numeric"}
        };
    },
    renderLayers() {
        let items = this.props.layers.map((layer) => {
            if (layer.visibility) {
                return (layer.title);
            }
        });
        return items;
    },
    localDownload() {
        return (<Button bsSize="xs" disabled={(this.props.snapshot.state === "SHOTING")}
            href={this.props.snapshot.img.data.replace(/^data:image\/[^;]/, 'data:application/octet-stream')} download="snapshot.png"
                            >
                            <Glyphicon glyph="floppy-save" />{this.props.saveBtnText}
                            </Button>);
    },
    remoteDownload() {
        return (<Button bsSize="xs" disabled={(this.props.snapshot.state === "SHOTING")}
                onClick={this.onClick}>
                <Glyphicon glyph="floppy-save" />{this.props.saveBtnText}
                </Button>);
    },
    renderError() {
        if (this.props.snapshot.error) {
            return (<Row style={{marginTop: "5px"}}>
                    {this.props.snapshot.error}
                    </Row>);
        }
    },
    render() {
        return ( (this.props.snapshot.img && this.props.snapshot.img.data) || this.props.snapshot.state === "READY") ? (
            <Grid header={this.props.name} className="snapshot-panel" fluid={true}>
                <Row>
                    <Col xs={7} sm={7} md={7}><Image src={this.props.snapshot.img.data} responsive thumbnail/></Col>
                    <Col xs={5} sm={5} md={5}>
                       <Table responsive>
                            <tbody>
                               <tr>
                                <td>Date</td><td> <DateFormat dateParams={this.props.dateFormat}/></td>
                                </tr>
                                <tr><td>Layers</td><td>{this.renderLayers()}</td></tr>
                                <tr><td>Size</td><td>{this.props.snapshot.img.width}X{this.props.snapshot.img.height}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>

                <Row className="pull-right" style={{marginTop: "5px"}}>
                    {(this.props.browser.ie || (this.props.snapshot.img.size > 2000 && this.props.browser.chrome)) ? this.remoteDownload() : this.localDownload()}
                </Row>
                {this.renderError()}
            </Grid>
        ) : null;
    },
    onClick() {
        this.props.downloadImg(this.props.snapshot.img.data, this.props.serviceBoxUrl || configUtils.getConfigProp("serviceBoxUrl"));
    }
});

module.exports = SnapshotPanel;
