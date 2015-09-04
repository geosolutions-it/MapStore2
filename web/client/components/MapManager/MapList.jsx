/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {ListGroup, Panel, Input, Label} = require('react-bootstrap');
var MapItem = require('./MapItem');
var I18N = require('../I18N/I18N');
var LangSelector = require('../LangSelector/LangSelector');

var MapList = React.createClass({
    propTypes: {
        panelProps: React.PropTypes.object,
        maps: React.PropTypes.array,
        viewerUrl: React.PropTypes.string,
        mapType: React.PropTypes.string,
        onChangeMapType: React.PropTypes.func,
        locale: React.PropTypes.string,
        onLanguageChange: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            onChangeMapType: function() {}
        };
    },
    renderMaps: function(maps, mapType) {
        const viewerUrl = this.props.viewerUrl;
        return maps.map(function(map) {
            return <MapItem viewerUrl={viewerUrl} key={map.id} mapType={mapType} {...map} />;
        });
    },
    render: function() {
        return (
            <Panel {...this.props.panelProps}>
                <LangSelector key="langSelector" currentLocale={this.props.locale} onLanguageChange={this.props.onLanguageChange}/>,
                <Label><I18N.Message msgId="manager_mapTypes_combo"/></Label>
                <Input value={this.props.mapType} type="select" bsSize="small" onChange={this.changeMapType}>
                    <option value="leaflet" key="leaflet">Leaflet</option>
                    <option value="openlayers" key="openlayer">OpenLayers</option>
                </Input>
                <ListGroup>
                    {this.renderMaps(this.props.maps, this.props.mapType)}
                </ListGroup>
            </Panel>
        );
    },
    changeMapType: function() {
        var element = React.findDOMNode(this);
        var selectNode = element.getElementsByTagName('select').item(0);
        this.props.onChangeMapType(selectNode.value);
    }
});

module.exports = MapList;
