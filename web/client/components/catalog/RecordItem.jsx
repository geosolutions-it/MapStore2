/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Message = require('../I18N/Message');
const {Image, Panel, Button, Glyphicon} = require('react-bootstrap');
const _ = require('lodash');

const RecordItem = React.createClass({
    propTypes: {
        catalogURL: React.PropTypes.string,
        onLayerAdd: React.PropTypes.func,
        onZoomToExtent: React.PropTypes.func,
        record: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            mapType: "leaflet",
            onLayerAdd: () => {},
            onZoomToExtent: () => {},
            style: {}
        };
    },
    renderThumb(thumbURL, dc) {
        if (thumbURL) {
            let thumbSrc = thumbURL;
            let absolute = (thumbURL.indexOf("http") === 0);
            if (!absolute) {
                thumbSrc = this.props.catalogURL + "/" + thumbURL;
            }
            return (<Image src={thumbSrc} alt={dc.title} style={{
                "float": "left",
                width: "150px",
                maxHeight: "150px",
                marginRight: "20px"
            }}/>);
        }
    },
    renderWMSButtons(wms) {
        if (wms) {
            return (<div>
                <Button
                bsStyle="success"
                onClick={() => {this.addLayer(wms); }}
                key="addlayer">
                    <Glyphicon glyph="plus" />&nbsp;<Message msgId="catalog.addToMap" />
                </Button>&nbsp;
            </div>);
        }
    },
    renderDescription(dc) {
        if (typeof dc.abstract === "string") {
            return dc.abstract;
        } else if (Array.isArray(dc.abstract)) {
            return dc.abstract.join(", ");
        }
    },
    render() {
        let dc = this.props.record && this.props.record.dc || {};
        let thumbURL;
        let wms;
        // let wms;
        if (dc && dc.URI) {
            let thumb = _.head([].filter.call(dc.URI, (uri) => {return uri.name === "thumbnail"; }) );
            thumbURL = thumb ? thumb.value : null;
            wms = _.head([].filter.call(dc.URI, (uri) => { return uri.protocol === "OGC:WMS-1.1.1-http-get-map"; }));
        }
        return (
            <Panel className="record-item">
                {this.renderThumb(thumbURL, dc)}
                <div>
                    <h4>{dc.title}</h4>
                    <p className="record-item-description">{this.renderDescription(dc)}</p>
                </div>
                  {this.renderWMSButtons(wms)}

            </Panel>
        );
    },
    addLayer(wms) {
        let wmsURL = wms.value;
        let absolute = (wmsURL.indexOf("http") === 0);
        if (!absolute) {
            wmsURL = this.props.catalogURL + "/" + wmsURL;
        }
        this.props.onLayerAdd({
            type: "wms",
            url: wmsURL,
            name: wms.name,
            title: wms.description || wms.name
        });
        if (this.props.record.boundingBox) {
            let extent = this.props.record.boundingBox.extent;
            let crs = this.props.record.boundingBox.crs;
            this.props.onZoomToExtent(extent, crs);
        }
    }
});

module.exports = RecordItem;
