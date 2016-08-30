/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Label, Input} = require('react-bootstrap');
const Message = require('../../components/I18N/Message');
const {compose} = require('redux');
const {changeMapType} = require('../actions/home');
const {connect} = require('react-redux');

const MapType = React.createClass({
    propTypes: {
        style: React.PropTypes.object,
        className: React.PropTypes.object,
        mapType: React.PropTypes.string,
        onChangeMapType: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            mapType: 'leaflet',
            onChangeMapType: () => {}
        };
    },
    render() {
        return (
            <div id="mapstore-maptype">
                <Label><Message msgId="manager.mapTypes_combo"/></Label>
                <Input value={this.props.mapType} type="select" bsSize="small" ref="mapType" onChange={this.props.onChangeMapType}>
                    <option value="leaflet" key="leaflet">Leaflet</option>
                    <option value="openlayers" key="openlayer">OpenLayers</option>
                </Input>
        </div>
        );
    }
});

const MapTypePlugin = connect((state) => ({
    mapType: state.home && state.home.mapType || 'leaflet'
}), {
    onChangeMapType: compose(changeMapType, (event) => event.target.value)
})(MapType);

module.exports = {
    MapTypePlugin: MapTypePlugin,
    reducers: {home: require('../reducers/home')}
};
