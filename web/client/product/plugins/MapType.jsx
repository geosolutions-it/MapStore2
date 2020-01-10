/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const PropTypes = require('prop-types');
const React = require('react');
const {Label, FormControl, FormGroup} = require('react-bootstrap');
const Message = require('../../components/I18N/Message');
const {compose} = require('redux');
const {changeMapType} = require('../../actions/maptype');
const {mapTypeSelector} = require('../../selectors/maptype');
const {connect} = require('react-redux');
const assign = require('object-assign');

class MapType extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        className: PropTypes.object,
        mapType: PropTypes.string,
        mapTypes: PropTypes.array,
        onChangeMapType: PropTypes.func
    };

    static defaultProps = {
        mapType: 'leaflet',
        onChangeMapType: () => {},
        mapTypes: [
            { key: "leaflet", label: "Leaflet"},
            { key: "openlayers", label: "OpenLayers"},
            { key: "cesium", label: "Cesium"}
        ]
    };

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
}

const MapTypePlugin = connect((state) => ({
    mapType: mapTypeSelector(state)
}), {
    onChangeMapType: compose(changeMapType, (event) => event.target.value)
})(MapType);

module.exports = {
    MapTypePlugin: assign(MapTypePlugin, {
        OmniBar: {
            name: 'MapType',
            tool: true,
            position: 6,
            priority: 1
        }
    }),
    reducers: {maptype: require('../../reducers/maptype')}
};
