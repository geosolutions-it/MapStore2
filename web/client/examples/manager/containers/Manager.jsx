/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var connect = require('react-redux').connect;
var bindActionCreators = require('redux').bindActionCreators;

var MapList = require('../../../components/maps/MapList');
var changeMapType = require('../actions/mapType').changeMapType;
var loadLocale = require('../../../actions/locale').loadLocale;

var Localized = require('../../../components/I18N/Localized');
var assign = require('object-assign');
var I18N = require('../../../components/I18N/I18N');
var LangSelector = require('../../../components/I18N/LangSelector');
var {Label, Input} = require('react-bootstrap');

var Manager = React.createClass({
    propTypes: {
        maps: React.PropTypes.object,
        dispatch: React.PropTypes.func,
        messages: React.PropTypes.object,
        locale: React.PropTypes.string,
        mapType: React.PropTypes.string,
        loadLocale: React.PropTypes.func,
        changeMapType: React.PropTypes.func
    },
    render() {
        if (this.props.maps) {
            return (
                <Localized messages={this.props.messages} locale={this.props.locale}>
                    {() =>
                        <div>
                        <Label><I18N.Message msgId="manager.locales_combo"/></Label>
                        <LangSelector key="langSelector" currentLocale={this.props.locale} onLanguageChange={this.props.loadLocale}/>
                        <Label><I18N.Message msgId="manager.mapTypes_combo"/></Label>
                        <Input value={this.props.mapType} type="select" bsSize="small" ref="mapType" onChange={this.changeMapType}>
                            <option value="leaflet" key="leaflet">Leaflet</option>
                            <option value="openlayers" key="openlayer">OpenLayers</option>
                        </Input>
                        <MapList mapType={this.props.mapType} maps={this.props.maps.results} locale={this.props.locale} viewerUrl="../viewer"
                            panelProps={{header: this.props.messages.manager.maps_title, collapsible: true, defaultExpanded: true }}
                            totalCount={this.props.maps.totalCount}
                            />
                        </div>
                    }
                </Localized>
            );
        }
        return <div className="spinner-loader"></div>;
    },
    changeMapType: function(event) {
        this.props.changeMapType(event.target.value);
    }
});

module.exports = connect((state) => {
    return {
        maps: state.maps,
        mapType: state.mapType,
        messages: state.locale ? state.locale.messages : null,
        locale: state.locale ? state.locale.current : null
    };
}, dispatch => {
    return bindActionCreators(assign({}, {
        loadLocale: loadLocale.bind(null, '../../translations'),
        changeMapType: changeMapType
    }), dispatch);
})(Manager);
