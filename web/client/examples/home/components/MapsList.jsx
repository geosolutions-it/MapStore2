/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var I18N = require('../../../components/I18N/I18N');
var {Label, Input} = require('react-bootstrap');
var MapList = require('../../../components/MapManager/MapList');

var MapsList = React.createClass({
    propTypes: {
        maps: React.PropTypes.object,
        mapType: React.PropTypes.string,
        title: React.PropTypes.string,
        onChangeMapType: React.PropTypes.func
    },
    render() {
        if (this.props.maps) {
            return (
                <div>
                <Label><I18N.Message msgId="manager.mapTypes_combo"/></Label>
                <Input value={this.props.mapType} type="select" bsSize="small" ref="mapType" onChange={this.props.onChangeMapType}>
                    <option value="leaflet" key="leaflet">Leaflet</option>
                    <option value="openlayers" key="openlayer">OpenLayers</option>
                </Input>
                <MapList mapType={this.props.mapType} viewerUrl="examples/viewer"
            maps={this.props.maps && this.props.maps.results ? this.props.maps.results : []}
            panelProps={{className: "mapmanager",
                header: this.props.title,
                 collapsible: true,
                 defaultExpanded: true}} />
             </div>
         );
        }
        return <div className="spinner-loader"></div>;
    }
});

module.exports = MapsList;
