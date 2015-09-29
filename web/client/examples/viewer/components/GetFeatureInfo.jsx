/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var BootstrapReact = require('react-bootstrap');
var Modal = BootstrapReact.Modal;
var Tabs = BootstrapReact.Tabs;
var Tab = BootstrapReact.Tab;
var I18N = require('../../../components/I18N/I18N');

var ToggleButton = require('../../../components/buttons/ToggleButton');
var HtmlRenderer = require('../../../components/misc/HtmlRenderer');

var CoordinatesUtils = require('../../../utils/CoordinatesUtils');
var assign = require('object-assign');

var GetFeatureInfo = React.createClass({
    propTypes: {
        htmlResponses: React.PropTypes.array,
        btnConfig: React.PropTypes.object,
        btnText: React.PropTypes.string,
        btnIcon: React.PropTypes.string,
        enabled: React.PropTypes.bool,
        mapConfig: React.PropTypes.object,
        layerFilter: React.PropTypes.func,
        actions: React.PropTypes.shape({
            getFeatureInfo: React.PropTypes.func,
            changeMapInfoState: React.PropTypes.func,
            purgeMapInfoResults: React.PropTypes.func,
            changeMousePointer: React.PropTypes.func
        }),
        clickedMapPoint: React.PropTypes.shape({
            x: React.PropTypes.number,
            y: React.PropTypes.number
        })
    },
    getDefaultProps() {
        return {
            enabled: false,
            htmlResponses: [],
            mapConfig: {layers: []},
            layerFilter(l) {
                return l.visibility &&
                    l.type === 'wms' &&
                    (l.queryable === undefined || l.queryable) &&
                    l.group !== "background"
                ;
            },
            actions: {
                getFeatureInfo() {},
                changeMapInfoState() {},
                purgeMapInfoResults() {},
                changeMousePointer() {}
            }
        };
    },
    getInitialState() {
        return { showModal: true };
    },
    componentWillReceiveProps(newProps) {
        // if there's a new clicked point on map and GetFeatureInfo is active
        // it composes and sends a getFeatureInfo action.
        if (newProps.enabled && newProps.clickedMapPoint && (!this.props.clickedMapPoint || this.props.clickedMapPoint.x !== newProps.clickedMapPoint.x ||
                this.props.clickedMapPoint.y !== newProps.clickedMapPoint.y)) {
            const wmsVisibleLayers = newProps.mapConfig.layers.filter(newProps.layerFilter);
            const {bounds, crs} = this.reprojectBbox(newProps.mapConfig.bbox, newProps.mapConfig.projection);
            for (let l = 0; l < wmsVisibleLayers.length; l++) {
                const layer = wmsVisibleLayers[l];
                const requestConf = {
                    layers: layer.name,
                    query_layers: layer.name,
                    x: newProps.clickedMapPoint.x,
                    y: newProps.clickedMapPoint.y,
                    height: newProps.mapConfig.size.height,
                    width: newProps.mapConfig.size.width,
                    srs: crs,
                    bbox: bounds.minx + "," +
                          bounds.miny + "," +
                          bounds.maxx + "," +
                          bounds.maxy,
                    info_format: "text/html"
                };
                const layerMetadata = {
                    title: layer.title
                };
                const url = layer.url.replace(/[?].*$/g, '');
                this.props.actions.getFeatureInfo(url, requestConf, layerMetadata);
            }
        }

        if (newProps.enabled && !this.props.enabled) {
            this.props.actions.changeMousePointer('pointer');
        } else if (!newProps.enabled && this.props.enabled) {
            this.props.actions.changeMousePointer('auto');
        }
    },
    onToggleButtonClick(btnEnabled) {
        this.props.actions.changeMapInfoState(!btnEnabled);
    },
    onModalHiding() {
        this.props.actions.purgeMapInfoResults();
    },
    // returns a array of tabs where each one contains feature info for
    // a specific layer.
    getModalContent(responses) {
        var output = [];
        var content = "";
        var title = "";
        var style = "";
        const regexpBody = /^[\s\S]*<body>([\s\S]*)<\/body>[\s\S]*$/i;
        const regexpStyle = /(<style[\s\=\w\/\"]*>[^<]*<\/style>)/i;
        const regexpException = /<ServiceException[\s]?[\s\w\=\"]*>([^<]*)<\/ServiceException>/i;

        for (let i = 0; i < responses.length; i++) {
            const {response, layerMetadata} = responses[i];

            title = (
                <div key={i} style={{
                        maxWidth: "96px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                    }}>
                    {layerMetadata.title}
                </div>
            );

            if (typeof response === "string") {
                // response can be a HTML feature info or XML exception
                if (response.indexOf('<?xml') === 0) { // XML exception
                    let match = regexpException.exec(response);
                    let exceptionMsg = match && match.length === 2 ? match[1].trim() : "";
                    content = (<div><h3>Exception</h3><p style={{margin: "16px"}}>{exceptionMsg}</p></div>);
                } else { // HTML feature info
                    // gets css rules from the response and removes which are related to body tag.
                    let styleMatch = regexpStyle.exec(response);
                    style = styleMatch && styleMatch.length === 2 ? regexpStyle.exec(response)[1] : "";
                    style = style.replace(/body[,]+/g, '');
                    // gets feature info managing an eventually empty response
                    content = response.replace(regexpBody, '$1').trim();
                    if (content.length === 0) {
                        content = <p style={{margin: "16px"}}><I18N.Message msgId="noFeatureInfo"/></p>;
                    } else {
                        content = <HtmlRenderer key={i} html={style + content} />;
                    }
                }
                output.push(
                    <Tab eventKey={i} key={i} title={title}>
                        <div style={{overflow: "auto"}}>
                            {content}
                        </div>
                    </Tab>
                );
            } else if (response.length !== undefined) {
                // response is an array of exceptions
                const exArray = response;
                for (let j = 0; j < exArray.length; j++) {
                    output.push(
                        <Tab eventKey={i} key={i} title={title}>
                            <div style={{overflow: "auto"}}>
                                <HtmlRenderer key={i} html={
                                    '<h3>Exception: ' + j + '</h3>' +
                                    '<p>' + exArray[j].text + '</p>'
                                }/>
                            </div>
                        </Tab>
                    );
                }
            } else {
                let match = regexpBody.exec(response.data);
                if (match && match.length === 2) {
                    content = match[1];
                } else {
                    content = '<p>' + response.data + '</p>';
                }
                output.push(
                    <Tab eventKey={i} title={title}>
                        <div style={{overflow: "auto"}}>
                            <HtmlRenderer key={i} html={content}/>
                        </div>
                    </Tab>
                );
            }
        }
        return output;
    },
    render() {
        return (
            <div id="mapstore-getfeatureinfo">
                <ToggleButton
                    pressed={this.props.enabled}
                    btnConfig={this.props.btnConfig}
                    text={this.props.btnText}
                    glyphicon={this.props.btnIcon}
                    onClick={this.onToggleButtonClick}
                />
                <Modal
                    show={this.props.htmlResponses.length !== 0}
                    onHide={this.onModalHiding}
                    bsStyle="info"
                    dialogClassName="getFeatureInfo">

                    <Modal.Header closeButton>
                        <Modal.Title><I18N.Message msgId="getFeatureInfoTitle" /></Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Tabs defaultActiveKey={0}>
                            {this.getModalContent(this.props.htmlResponses)}
                        </Tabs>
                    </Modal.Body>
                </Modal>
            </div>
        );
    },
    reprojectBbox(bbox, destSRS) {
        let newBbox = CoordinatesUtils.reprojectBbox([
            bbox.bounds.minx,
            bbox.bounds.miny,
            bbox.bounds.maxx,
            bbox.bounds.maxy
        ], bbox.crs, destSRS);
        return assign({}, {
            crs: destSRS,
            bounds: {
                minx: newBbox[0],
                miny: newBbox[1],
                maxx: newBbox[2],
                maxy: newBbox[3]
            }
        });
    }
});

module.exports = GetFeatureInfo;
