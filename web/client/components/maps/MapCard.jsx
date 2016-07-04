/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Message = require('../I18N/Message');
const GridCard = require('../misc/GridCard');
const thumbUrl = require('./style/default.png');
const assign = require('object-assign');
require("./style/mapcard.css");

const MapCard = React.createClass({
    propTypes: {
        style: React.PropTypes.object,
        map: React.PropTypes.object,
        viewerUrl: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
        mapType: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            style: {
                backgroundImage: 'url(' + thumbUrl + ')',
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "repeat-x"
            }
        };
    },
    getCardStyle() {
        if (this.props.map.thumbnail) {
            return assign({}, this.props.style, {
                backgroundImage: 'url(' + this.props.map.thumbnail + ')'
            });
        }
        return this.props.style;
    },
    render: function() {

        return (
           <GridCard className="map-thumb" style={this.getCardStyle()} header={this.props.map.name} actions={
                   [{
                       onClick: () => this.props.viewerUrl(this.props.map),
                       glyph: "chevron-right",
                       tooltip: <Message msgId="manager.openInANewTab" />
                   }]
               }><div className="map-thumb-description">{this.props.map.description}</div></GridCard>
        );
    }
});

module.exports = MapCard;
