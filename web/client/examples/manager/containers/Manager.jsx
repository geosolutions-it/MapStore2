/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var connect = require('react-redux').connect;

var MapList = require('../../../components/MapManager/MapList');
var changeMapType = require('../actions/mapType').changeMapType;
var loadLocale = require('../../../actions/locale').loadLocale;

var Localized = require('../../../components/I18N/Localized');

var Manager = React.createClass({
    propTypes: {
        maps: React.PropTypes.object,
        dispatch: React.PropTypes.func,
        messages: React.PropTypes.object,
        locale: React.PropTypes.string,
        mapType: React.PropTypes.string
    },
    render() {
        if (this.props.maps) {
            return (
                <Localized messages={this.props.messages} locale={this.props.locale}>
                    {() => <MapList mapType={this.props.mapType} maps={this.props.maps.results} locale={this.props.locale} viewerUrl="../viewer"
                    panelProps={{header: this.props.messages.manager_maps_title, collapsible: true, defaultExpanded: true }}
                    totalCount={this.props.maps.totalCount} onChangeMapType={this.changeMapType}
                    onLanguageChange={this.changeLocale} />
                }
                </Localized>
            );
        }
        return null;
    },
    changeMapType(mapType) {
        this.props.dispatch(changeMapType(mapType));
    },
    changeLocale(locale) {
        this.props.dispatch(loadLocale('../../translations', locale));
    }
});

module.exports = connect((state) => {
    return {
        maps: state.maps,
        mapType: state.mapType,
        messages: state.locale ? state.locale.messages : null,
        locale: state.locale ? state.locale.current : null
    };
})(Manager);
