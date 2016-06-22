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
const {head} = require('lodash');

const defaultThumb = require('./img/default.jpg');
const removeURLParameter = function(url, parameter) {
    // prefer to use l.search if you have a location/link object
    if (!url) {
        return url;
    }
    let urlparts = url.split('?');
    if (urlparts.length >= 2) {

        let prefix = encodeURIComponent(parameter) + '=';
        let pars = urlparts[1].split(/[&;]/g);

        // reverse iteration as may be destructive
        for (let i = pars.length; i-- > 0; ) {
            // idiom for string.startsWith
            if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                pars.splice(i, 1);
            }
        }

        return urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : "");
    }
    return url;

};
const RecordItem = React.createClass({
    propTypes: {
        onLayerAdd: React.PropTypes.func,
        onZoomToExtent: React.PropTypes.func,
        record: React.PropTypes.object,
        buttonSize: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            mapType: "leaflet",
            onLayerAdd: () => {},
            onZoomToExtent: () => {},
            style: {},
            buttonSize: "small"
        };
    },
    renderThumb(thumbURL, record) {
        let thumbSrc = thumbURL || defaultThumb;

        return (<Image src={thumbSrc} alt={record && record.title} style={{
            "float": "left",
            width: "150px",
            maxHeight: "150px",
            marginRight: "20px"
        }}/>);

    },
    renderWMSButtons(wms) {
        if (wms) {
            return (<div className="record-buttons">
                <Button
                bsStyle="success"
                bsSize={this.props.buttonSize}
                onClick={() => {this.addLayer(wms); }}
                key="addlayer">
                    <Glyphicon glyph="plus" />&nbsp;<Message msgId="catalog.addToMap" />
                </Button>&nbsp;
            </div>);
        }
    },
    renderDescription(record) {
        if (!record) {
            return null;
        }
        if (typeof record.description === "string") {
            return record.description;
        } else if (Array.isArray(record.description)) {
            return record.description.join(", ");
        }
    },
    render() {
        let record = this.props.record;
        let wms;
        if (record) {
            wms = head(record.references.filter(rec => rec && rec.type && rec.type.indexOf("OGC:WMS") >= 0));
        }


        return (
            <Panel className="record-item">
                {this.renderThumb(record && record.thumbnail, record)}
                <div>
                    <h4>{record && record.title}</h4>
                    <p className="record-item-description">{this.renderDescription(record)}</p>
                </div>
                  {this.renderWMSButtons(wms)}

            </Panel>
        );
    },
    addLayer(wms) {
        let url = removeURLParameter(wms.url, "request");
        url = removeURLParameter(url, "layer");
        this.props.onLayerAdd({
            type: "wms",
            url: url,
            visibility: true,
            name: wms.params && wms.params.name,
            title: this.props.record.title || (wms.params && wms.params.name)
        });
        if (this.props.record.boundingBox) {
            let extent = this.props.record.boundingBox.extent;
            let crs = this.props.record.boundingBox.crs;
            this.props.onZoomToExtent(extent, crs);
        }
    }
});

module.exports = RecordItem;
