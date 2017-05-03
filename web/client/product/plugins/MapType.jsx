/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Label, FormControl, FormGroup} = require('react-bootstrap');
const Message = require('../../components/I18N/Message');
const {compose} = require('redux');
const {changeMapType} = require('../../actions/maptype');
const {connect} = require('react-redux');
const assign = require('object-assign');

const MapType = React.createClass({
    propTypes: {
        style: React.PropTypes.object,
        className: React.PropTypes.object,
        mapType: React.PropTypes.string,
        mapTypes: React.PropTypes.array,
        onChangeMapType: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            mapType: 'leaflet',
            onChangeMapType: () => {},
            mapTypes: [
                { key: "leaflet", label: "Leaflet"},
                { key: "openlayers", label: "OpenLayers"},
                { key: "cesium", label: "Cesium"}
            ]
        };
    },
    render() {
        return (
            <div id="mapstore-maptype">
                <Label><Message msgId="manager.mapTypes_combo"/></Label>
                <FormGroup bsSize="small">
                    <FormControl value={this.props.mapType} componentClass="select" ref="mapType" onChange={this.props.onChangeMapType}>
                        {this.props.mapTypes.map(type => <option value={type.key} key={type.key}>{type.label}</option>)}
                    </FormControl>
                </FormGroup>
        </div>
        );
    }
});

const MapTypePlugin = connect((state) => ({
    mapType: state.maptype && state.maptype.mapType || 'leaflet'
}), {
    onChangeMapType: compose(changeMapType, (event) => event.target.value)
})(MapType);

module.exports = {
    MapTypePlugin: assign(MapTypePlugin, {
        GridContainer: {
            name: 'MapType',
            tool: true,
            position: 1,
            priority: 1
        }
    }),
    reducers: {maptype: require('../../reducers/maptype')}
};
